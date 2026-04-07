export interface InboundEmail {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
}

export interface StoredEmail extends InboundEmail {
  id: string;
  receivedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalEmails: number;
  totalPages: number;
  hasMore: boolean;
}

export interface InboxResponse {
  emails: StoredEmail[];
  pagination: PaginationInfo;
}

export interface SpamResult {
  isSpam: boolean;
  reason: string | null;
}

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  DOMAIN: string;
  EMAIL_TTL_SECONDS: string;
  MAX_EMAIL_SIZE_MB: string;
}
