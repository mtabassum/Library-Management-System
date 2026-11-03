import { apiGet } from "../../../api/client";
import type {
  FindMembersResult,
  MemberDetailsResult,
  MemberSearchField,
} from "./types";

// GET /members/find?searchType=Code|Phone|Name&term=...&page=0
// The query keys are "searchType" and "page" because those are the parameter
// names the MembersController action binds. URLSearchParams does the encoding,
// so a name with a space or a phone with a + still arrives intact.
// page is zero-based: page 0 is the first 25 matches, page 1 the next 25.
export function findMembers(
  field: MemberSearchField,
  term: string,
  page = 0,
): Promise<FindMembersResult> {
  const params = new URLSearchParams({
    searchType: field,
    term,
    page: String(page),
  });
  return apiGet<FindMembersResult>(`/members/find?${params.toString()}`);
}

// GET /members/:memberId
// One call fills the whole screen -- profile, summary, current borrowings and
// history all arrive together. Error handling lives at the page, same as the
// other features: a 404 rejects here and the page's catch shows the message.
export function getMemberDetails(
  memberId: number,
): Promise<MemberDetailsResult> {
  return apiGet<MemberDetailsResult>(`/members/${memberId}`);
}
