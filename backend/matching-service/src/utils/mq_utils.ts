import { createMatch, MatchRequestItem } from "../handlers/matchHandler";
import { isActiveRequest, isUserConnected } from "../handlers/websocketHandler";

const matchingRequests = new Map<string, MatchRequestItem>();

export const matchUsers = (newRequest: string) => {
  const newRequestJson = JSON.parse(newRequest) as MatchRequestItem;
  const newRequestUid = newRequestJson.user.id;
  for (const [uid, pendingRequest] of matchingRequests) {
    if (
      isExpired(pendingRequest) ||
      !isUserConnected(uid) ||
      !isActiveRequest(uid, pendingRequest.id) ||
      uid === newRequestUid
    ) {
      matchingRequests.delete(uid);
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

    if (isMatch(newRequestJson, pendingRequest)) {
      matchingRequests.delete(uid);
      createMatch(pendingRequest, newRequestJson);
      return;
    }
  }
  matchingRequests.set(newRequestUid, newRequestJson);
};

const isExpired = (data: MatchRequestItem): boolean => {
  return Date.now() - data.sentTimestamp >= data.ttlInSecs * 1000;
};

const isMatch = (req1: MatchRequestItem, req2: MatchRequestItem): boolean => {
  const hasCommonComplexity = req1.complexities.some((elem) =>
    req2.complexities.includes(elem)
  );
  const hasCommonCategory = req1.categories.some((elem) =>
    req2.categories.includes(elem)
  );
  const hasCommonLanguage = req1.languages.some((elem) =>
    req2.languages.includes(elem)
  );

  return hasCommonComplexity && hasCommonCategory && hasCommonLanguage;
};
