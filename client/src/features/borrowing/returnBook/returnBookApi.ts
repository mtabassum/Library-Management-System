import { apiGet, apiPost } from "../../../api/client";
import type {
  BorrowingLookupField,
  FindActiveBorrowingsResult,
  ReturnBookRequest,
  ReturnBookResult,
} from "./types";

// GET /borrowing/active?field=CopyCode|Isbn&term=...
export function findActiveBorrowings(
  field: BorrowingLookupField,
  term: string,
): Promise<FindActiveBorrowingsResult> {
  const params = new URLSearchParams({ field, term });
  return apiGet<FindActiveBorrowingsResult>(
    `/borrowing/active?${params.toString()}`,
  );
}

// POST /borrowing/return   body: { bookCopyId }
export function returnBook(
  request: ReturnBookRequest,
): Promise<ReturnBookResult> {
  return apiPost<ReturnBookResult>("/borrowing/return", request);
}
