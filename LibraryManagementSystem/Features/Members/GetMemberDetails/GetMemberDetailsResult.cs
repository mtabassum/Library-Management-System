using LibraryManagementSystem.Domain;

namespace LibraryManagementSystem.Features.Members.GetMemberDetails;

// Everything the Member Details screen renders, in one response: profile,
// borrowing summary, the copies out now, and the closed borrowings. One round
// trip means one loading state on the client; three endpoints would buy nothing
// here, because the screen never shows one section without the rest.
public sealed record GetMemberDetailsResult(
    GetMemberDetailsResult.Profile Member,
    GetMemberDetailsResult.Summary Borrowing,
    IReadOnlyList<GetMemberDetailsResult.CurrentBorrowing> CurrentlyBorrowed,
    IReadOnlyList<GetMemberDetailsResult.HistoryEntry> History)
{
    // Same field order and the same raw MemberStatus as
    // FindMembersResult.MemberItem, so both member screens read alike.
    public sealed record Profile(
        int Id,
        string MemberCode,
        string Name,
        string Phone,
        string Address,
        MemberStatus Status);

    public sealed record Summary(
        int CurrentlyBorrowed,
        int Overdue,
        int TotalBorrowed);

    // A copy the member holds right now. BookCopyId and CopyCode both travel to
    // the Return screen: the id for the eventual POST, the code because the
    // existing lookup endpoint takes a code.
    public sealed record CurrentBorrowing(
        int BorrowRecordId,
        int BookCopyId,
        string CopyCode,
        string Title,
        string Author,
        DateTime IssueDate,
        DateTime DueDate,
        bool IsOverdue,
        int DaysOverdue);

    public sealed record HistoryEntry(
        int BorrowRecordId,
        string CopyCode,
        string Title,
        string Author,
        DateTime IssueDate,
        DateTime DueDate,
        DateTime? ReturnDate,
        bool WasReturnedLate);
}
