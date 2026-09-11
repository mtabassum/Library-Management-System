namespace LibraryManagementSystem.Features.Borrowing.ReturnBook
{
    public sealed record ReturnBookResult(
        int BorrowRecordId,
        string CopyCode,
        DateTime ReturnDate);
}
