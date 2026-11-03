import { apiGet } from "../../../api/client";
import type { BookSearchField, SearchBooksResult } from "./types";

// Calls GET /books/search?searchField=...&text=...
export function searchBooks(field: BookSearchField, text: string) {
  const params = new URLSearchParams({ searchField: field });
  if (text) params.set("text", text); // empty text → left out of the URL
  return apiGet<SearchBooksResult>(`/books/search?${params.toString()}`);
}

export function listAllBooks() {
  return searchBooks("Title", ""); // the field is ignored when there's no text
}
