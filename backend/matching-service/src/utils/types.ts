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
