import { v4 as uuidv4 } from "uuid";
import {
  isActiveRequest,
  isUserConnected,
  sendMatchFound,
} from "./websocketHandler";
import { MatchRequestItem, MatchUser } from "../utils/types";

interface Match {
  matchUser1: MatchUser;
  matchUser2: MatchUser;
  accepted: boolean;
  complexity: string;
  category: string;
}

const matches = new Map<string, Match>();

export const matchUsers = (
  newRequest: MatchRequestItem,
  waitingList: Map<string, MatchRequestItem>,
  complexity: string,
  category: string
) => {
  const newRequestUid = newRequest.user.id;

  for (const [uid, waitListRequest] of waitingList) {
    if (
      isExpired(waitListRequest) ||
      !isUserConnected(uid) ||
      !isActiveRequest(uid, waitListRequest.id) ||
      uid === newRequestUid
    ) {
      waitingList.delete(uid);
      continue;
    }

    if (
      isExpired(newRequest) ||
      !isUserConnected(newRequestUid) ||
      !isActiveRequest(newRequestUid, newRequest.id)
    ) {
      return;
    }

    if (
      uid === newRequest.rejectedPartnerId ||
      newRequestUid === waitListRequest.rejectedPartnerId
    ) {
      continue;
    }

    waitingList.delete(uid);
    createMatch(waitListRequest.user, newRequest.user, complexity, category);
    return;
  }
  waitingList.set(newRequestUid, newRequest);
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

export const getMatchById = (matchId: string): Match | undefined => {
  return matches.get(matchId);
};

const createMatch = (
  matchUser1: MatchUser,
  matchUser2: MatchUser,
  complexity: string,
  category: string
) => {
  const matchId = uuidv4();

  matches.set(matchId, {
    matchUser1: matchUser1,
    matchUser2: matchUser2,
    accepted: false,
    complexity,
    category,
  });

  sendMatchFound(matchId, matchUser1, matchUser2);
};

const isExpired = (data: MatchRequestItem): boolean => {
  return Date.now() - data.sentTimestamp >= data.ttlInSecs * 1000;
};
