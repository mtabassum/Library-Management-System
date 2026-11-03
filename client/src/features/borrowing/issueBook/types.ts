// --- Member lookup: GET /members/find ---
export type MemberSearchType = "Id" | "Code" | "Phone";
export type MemberStatus = "Active" | "Inactive" | "Deactivated";

export interface MemberItem {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  address: string;
  status: MemberStatus;
}

// --- Issue: POST /borrowing/issue ---
export interface IssueBookRequest {
  bookCopyId: number;
  memberId: number;
  dueDate: string | null;
}

export interface IssueBookResult {
  borrowRecordId: number;
  bookCopyId: number;
  memberCode: string;
  issueDate: string;
  dueDate: string;
}
