// Mirrors the JSON from GET /books/find and GET /books/:bookId (camelCased by
// ASP.NET). Keep in sync with FindBooksResult and GetBookDetailsResult on the
// backend.

// Same three search fields as Search Books -- the backend shares one
// BookSearchField enum between both slices, so the frontend shares the type.
export type { BookSearchField } from "../searchBooks/types";

// --- Book lookup: GET /books/find ---

// One row in the pick list. A book with no copies comes back with both
// counts at 0.
export interface BookSearchItem {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
}

// One page of matches. `total` is every book that matched, not just this page.
export interface FindBooksResult {
  books: BookSearchItem[];
  total: number;
  hasMore: boolean;
}

// --- Book details: GET /books/:bookId ---

// NextAvailability serializes as its integer value, like MemberStatus does.
// Now = 1, DueBack = 2, Overdue = 3. null means the book has no copies.
export type NextAvailability = 1 | 2 | 3;

export interface BookInfo {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
}

export interface AvailabilitySummary {
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  nextAvailable: NextAvailability | null;
  earliestDueDate: string | null; // ISO date string; only for DueBack/Overdue
}

export interface BookCopyItem {
  copyId: number;
  copyCode: string;
  status: "Available" | "Borrowed";
  borrowerName: string | null;
  memberId: number | null;
  dueDate: string | null; // ISO date string
}

export interface BookDetailsResult {
  book: BookInfo;
  summary: AvailabilitySummary;
  copies: BookCopyItem[];
}
