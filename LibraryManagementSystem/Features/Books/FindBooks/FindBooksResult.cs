namespace LibraryManagementSystem.Features.Books.FindBooks;

// One page of matching books. Same shape as FindMembersResult: Total is every
// book that matched, not just this page, and HasMore saves the client the
// arithmetic.
public sealed record FindBooksResult(
    IReadOnlyList<FindBooksResult.BookItem> Books,
    int Total,
    bool HasMore)
{
    // Only what the pick list shows. A book with no copies is included, with
    // both counts at 0 -- that is the point of starting from Books.
    public sealed record BookItem(
        int BookId,
        string Title,
        string Author,
        string Isbn,
        int TotalCopies,
        int AvailableCopies);
}
