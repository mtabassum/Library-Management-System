using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using MediatR;

namespace LibraryManagementSystem.Features.Books.GetBookDetails;

// Loads the book, then every copy of it, and works out the availability summary
// from that one list. Nothing here changes state -- it is a read.
public sealed class GetBookDetailsHandler
    : IRequestHandler<GetBookDetailsQuery, GetBookDetailsResult?>
{
    private readonly IBookRepository _books;
    private readonly IBookCopyRepository _copies;

    public GetBookDetailsHandler(
        IBookRepository books,
        IBookCopyRepository copies)
    {
        _books = books;
        _copies = copies;
    }

    public async Task<GetBookDetailsResult?> Handle(
        GetBookDetailsQuery query,
        CancellationToken cancellationToken)
    {
        var book = await _books.GetInfoAsync(query.BookId, cancellationToken);
        if (book is null)
            return null;

        var copies = await _copies.GetCopiesForBookAsync(query.BookId, cancellationToken);

        var available = copies.Count(copy => copy.Status == BookCopyStatus.Available);
        var borrowed = copies.Count(copy => copy.Status == BookCopyStatus.Borrowed);

        // Only copies with an active borrow record carry a due date, so this is
        // "the borrowed copy that is due back first". Min over DateTime? returns
        // null when no copy has one.
        var earliestDue = copies.Min(copy => copy.DueDate);

        // Due dates are written with DateTime.UtcNow, so compare against the
        // same clock. Whole days only -- a copy due today is not yet overdue.
        // Same rule as GetMemberDetailsHandler.
        var today = DateTime.UtcNow.Date;

        NextAvailability? next =
            available > 0 ? NextAvailability.Now
            : earliestDue is null ? null
            : earliestDue.Value.Date < today ? NextAvailability.Overdue
            : NextAvailability.DueBack;

        var summary = new GetBookDetailsResult.Availability(
            TotalCopies: copies.Count,
            AvailableCopies: available,
            BorrowedCopies: borrowed,
            NextAvailable: next,
            EarliestDueDate: next is NextAvailability.Now ? null : earliestDue);

        var items = copies
            .Select(copy => new GetBookDetailsResult.CopyItem(
                copy.CopyId,
                copy.CopyCode,
                copy.Status.ToString(),
                copy.BorrowerName,
                copy.MemberId,
                copy.DueDate))
            .ToList();

        return new GetBookDetailsResult(book, summary, items);
    }
}
