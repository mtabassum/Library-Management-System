import { apiGet } from "../../../api/client";
import type { BookDetailsResult, BookSearchField, FindBooksResult } from "./types";

// GET /books/find?searchField=Title|Author|Isbn&term=...&page=0
// The query keys match the FindBooksQuery properties that BooksController
// binds with [FromQuery]. page is zero-based: page 0 is the first 25 books.
export function findBooks(
  field: BookSearchField,
  term: string,
  page = 0,
): Promise<FindBooksResult> {
  const params = new URLSearchParams({
    searchField: field,
    term,
    page: String(page),
  });
  return apiGet<FindBooksResult>(`/books/find?${params.toString()}`);
}

// GET /books/:bookId
// One call fills the whole screen -- book info, availability summary and every
// copy. A 404 rejects here and the page's catch shows the message.
export function getBookDetails(bookId: number): Promise<BookDetailsResult> {
  return apiGet<BookDetailsResult>(`/books/${bookId}`);
}
