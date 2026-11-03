export type BookSearchField = "Title" | "Author" | "Isbn";

export interface SearchCopyItem {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  copyId: number;
  copyCode: string;
  status: "Available" | "Borrowed";
  borrowerName: string | null;
  memberId: number | null;
  dueDate: string | null;
}

export interface SearchBooksResult {
  copies: SearchCopyItem[];
}
