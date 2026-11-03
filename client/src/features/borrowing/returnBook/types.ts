export type BorrowingLookupField = "CopyCode" | "Isbn";

export interface ActiveBorrowingItem {
  bookCopyId: number;
  copyCode: string;
  title: string;
  author: string;
  isbn: string;
  borrowerName: string;
  memberCode: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
}

export interface FindActiveBorrowingsResult {
  borrowings: ActiveBorrowingItem[];
}

// POST /borrowing/return body.
export interface ReturnBookRequest {
  bookCopyId: number;
}

// Mirrors ReturnBookResult — confirms the close.
export interface ReturnBookResult {
  borrowRecordId: number;
  copyCode: string;
  returnDate: string;
}

export interface ReturnNavState {
  copyCode?: string;
  member?: { id: number; name: string };
}
