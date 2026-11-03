// Mirrors the JSON from GET /members/:id (camelCased by ASP.NET).
// Keep in sync with GetMemberDetailsResult on the backend.

// MemberStatus serializes as its integer value, same as /members/find sends.
// Active = 1, Inactive = 2, Deactivated = 3.
export type MemberStatus = 1 | 2 | 3;

// --- Member lookup: GET /members/find ---

// Which field the librarian is searching by. These strings are the names of the
// MemberSearchType enum on the backend; ASP.NET binds enum names for us.
// "Code" is the M-000123 code shown on screen, not the internal integer id.
export type MemberSearchField = "Code" | "Phone" | "Name";

// One row in the match list. Mirrors FindMembersResult.MemberItem.
export interface MemberSearchItem {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  address: string;
  status: MemberStatus;
}

// One page of matches. `total` is every member that matched, not just the ones
// in this page, so the screen can say "25 of 140". `hasMore` saves the page
// doing that arithmetic itself.
export interface FindMembersResult {
  members: MemberSearchItem[];
  total: number;
  hasMore: boolean;
}

// --- Member details: GET /members/:id ---

export interface MemberProfile {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  address: string;
  status: MemberStatus;
}

export interface BorrowingSummary {
  currentlyBorrowed: number;
  overdue: number;
  totalBorrowed: number;
}

export interface CurrentBorrowing {
  borrowRecordId: number;
  bookCopyId: number;
  copyCode: string;
  title: string;
  author: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  isOverdue: boolean;
  daysOverdue: number;
}

export interface HistoryEntry {
  borrowRecordId: number;
  copyCode: string;
  title: string;
  author: string;
  issueDate: string;
  dueDate: string;
  returnDate: string;
  wasReturnedLate: boolean;
}

export interface MemberDetailsResult {
  member: MemberProfile;
  borrowing: BorrowingSummary;
  currentlyBorrowed: CurrentBorrowing[];
  history: HistoryEntry[];
}
