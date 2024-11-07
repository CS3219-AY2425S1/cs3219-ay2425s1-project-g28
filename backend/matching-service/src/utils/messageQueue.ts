import { getPendingRequests } from "../config/rabbitmq";
import { createMatch, MatchRequestItem } from "../handlers/matchHandler";
import { isActiveRequest, isUserConnected } from "../handlers/websocketHandler";

export const matchUsers = (queueName: string, newRequest: string) => {
  const pendingRequests = getPendingRequests(queueName);
  const newRequestJson = JSON.parse(newRequest) as MatchRequestItem;
  const newRequestUid = newRequestJson.user.id;
  const [complexity, category, language] = queueName.split("_");

  for (const [uid, pendingRequest] of pendingRequests) {
    if (
      isExpired(pendingRequest) ||
      !isUserConnected(uid) ||
      !isActiveRequest(uid, pendingRequest.id) ||
      uid === newRequestUid
    ) {
      pendingRequests.delete(uid);
      continue;
    }

    if (
      isExpired(newRequestJson) ||
      !isUserConnected(newRequestUid) ||
      !isActiveRequest(newRequestUid, newRequestJson.id)
    ) {
      return;
    }

    if (
      uid === newRequestJson.rejectedPartnerId ||
      newRequestUid === pendingRequest.rejectedPartnerId
    ) {
      continue;
    }

    pendingRequests.delete(uid);
    createMatch(pendingRequest, newRequestJson, complexity, category, language);
    return;
  }
  pendingRequests.set(newRequestUid, newRequestJson);
};

const isExpired = (data: MatchRequestItem): boolean => {
  return Date.now() - data.sentTimestamp >= data.ttlInSecs * 1000;
};
