import { apiGet, apiPost } from "../../../api/client";
import type {
  MemberItem,
  MemberSearchType,
  MemberStatus,
  IssueBookRequest,
  IssueBookResult,
} from "./types";

const STATUS_BY_NUMBER: Record<number, MemberStatus> = {
  1: "Active",
  2: "Inactive",
  3: "Deactivated",
};
function normalizeStatus(raw: number | string): MemberStatus {
  if (typeof raw === "number") return STATUS_BY_NUMBER[raw] ?? "Deactivated";
  return raw as MemberStatus;
}

interface RawMember {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  address: string;
  status: number | string;
}

interface RawFindResult {
  members: RawMember[];
}

// GET /members/find?searchType=Code|Phone&term=...
export async function findMembers(
  searchType: MemberSearchType,
  term: string,
): Promise<MemberItem[]> {
  const params = new URLSearchParams({ searchType, term });
  const raw = await apiGet<RawFindResult>(`/members/find?${params.toString()}`);
  return raw.members.map((m) => ({ ...m, status: normalizeStatus(m.status) }));
}

export function issueBook(request: IssueBookRequest): Promise<IssueBookResult> {
  return apiPost<IssueBookResult>("/borrowing/issue", request);
}
