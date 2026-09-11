namespace LibraryManagementSystem.Features.Borrowing.FindActiveLoans;

// One row per active loan. Everything the Return screen shows before the
// librarian confirms, plus CopyId, which the return command uses to name the
// copy being returned. All rows are borrowed, so IssueDate/DueDate are never
// null here (unlike SearchBooks, which also lists available copies).
public sealed record FindActiveBorrowingsResult(IReadOnlyList<FindActiveBorrowingsResult.Item> Borrowings)
{
    public sealed record Item(
        int BookCopyId,
        string CopyCode,
        string Title,
        string Author,
        string Isbn,
        string BorrowerName,
        int MemberId,
        string MemberCode,
        DateTime IssueDate,
        DateTime DueDate);
}
