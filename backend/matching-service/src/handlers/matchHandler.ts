import { v4 as uuidv4 } from "uuid";
import { sendToQueue } from "../config/rabbitmq";
import { sendMatchFound } from "./websocketHandler";

interface Match {
  matchUser1: MatchUser;
  matchUser2: MatchUser;
  accepted: boolean;
}

export interface MatchUser {
  id: string;
  username: string;
  profile?: string;
}

export interface MatchRequest {
  user: MatchUser;
  complexity: string;
  category: string;
  language: string;
  timeout: number;
}

export interface MatchRequestItem {
  id: string;
  user: MatchUser;
  sentTimestamp: number;
  ttlInSecs: number;
  rejectedPartnerId?: string;
}

const matches = new Map<string, Match>();

export const sendMatchRequest = async (
  matchRequest: MatchRequest,
  requestId: string,
  rejectedPartnerId?: string
): Promise<boolean> => {
  const { user, complexity, category, language, timeout } = matchRequest;

  const matchItem: MatchRequestItem = {
    id: requestId,
    user: user,
    sentTimestamp: Date.now(),
    ttlInSecs: timeout,
    rejectedPartnerId: rejectedPartnerId,
  };

  const sent = await sendToQueue(complexity, category, language, matchItem);
  return sent;
};

export const createMatch = (
  requestItem1: MatchRequestItem,
  requestItem2: MatchRequestItem
) => {
  const matchId = uuidv4();
  const matchUser1 = requestItem1.user;
  const matchUser2 = requestItem2.user;

  matches.set(matchId, {
    matchUser1: matchUser1,
    matchUser2: matchUser2,
    accepted: false,
  });

  sendMatchFound(matchId, matchUser1, matchUser2);
};

export const handleMatchAccept = (matchId: string): boolean => {
  const match = matches.get(matchId);
  if (!match) {
    return false;
  }

  const partnerAccepted = match.accepted;
  matches.set(matchId, { ...match, accepted: true });
  return partnerAccepted;
};

export const handleMatchDelete = (matchId: string): boolean =>
  matches.delete(matchId);

export const getMatchIdByUid = (uid: string): string | null => {
  for (const [matchId, match] of matches) {
    if (match.matchUser1.id === uid || match.matchUser2.id === uid) {
      return matchId;
    }
  }
  return null;
};

export const getMatchByUid = (
  uid: string
): { matchId: string; partner: MatchUser } | null => {
  for (const [matchId, match] of matches) {
    if (match.matchUser1.id === uid) {
      return { matchId: matchId, partner: match.matchUser2 };
    } else if (match.matchUser2.id === uid) {
      return { matchId: matchId, partner: match.matchUser1 };
    }
  }
  return null;
};
