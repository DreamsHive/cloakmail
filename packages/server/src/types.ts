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
