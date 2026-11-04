namespace LibraryManagementSystem.Features.Books.GetBookDetails;

// Everything the Book Details screen renders, in one response: the book itself,
// the availability summary, and every physical copy. The screen never shows one
// card without the others, so one round trip means one loading state.
public sealed record GetBookDetailsResult(
    GetBookDetailsResult.BookInfo Book,
    GetBookDetailsResult.Availability Summary,
    IReadOnlyList<GetBookDetailsResult.CopyItem> Copies)
{
    public sealed record BookInfo(
        int BookId,
        string Title,
        string Author,
        string Isbn,
        string Category,
        string Publisher);

    // NextAvailable is null only when the book has no copies at all.
    // EarliestDueDate is filled only for DueBack and Overdue -- for Now there is
    // nothing to wait for.
    public sealed record Availability(
        int TotalCopies,
        int AvailableCopies,
        int BorrowedCopies,
        NextAvailability? NextAvailable,
        DateTime? EarliestDueDate);

    // Status is sent as text ("Available" / "Borrowed"), the same as
    // SearchBooksResult.Item, because BookCopyStatus has no explicit numbers.
    // CopyId travels silently to the Issue screen; CopyCode is what people see.
    public sealed record CopyItem(
        int CopyId,
        string CopyCode,
        string Status,
        string? BorrowerName,
        int? MemberId,
        DateTime? DueDate);
}
