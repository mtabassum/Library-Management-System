namespace LibraryManagementSystem.Features.Borrowing.IssueBook;
    public sealed record IssueBookResult(
        int BorrowRecordId,
        int BookCopyId,
        int MemberId,
        DateTime IssueDate,
        DateTime DueDate);
