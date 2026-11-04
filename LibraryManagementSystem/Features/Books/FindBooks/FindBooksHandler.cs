using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Books.FindBooks;

// Same flow as FindMembersHandler: clamp the page, ask the repository for one
// slice plus the total, and say whether another page exists.
public sealed class FindBooksHandler
    : IRequestHandler<FindBooksQuery, FindBooksResult>
{
    public const int PageSize = 25;
    private readonly IBookRepository _books;

    public FindBooksHandler(IBookRepository books) => _books = books;

    public async Task<FindBooksResult> Handle(
        FindBooksQuery query,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(0, query.Page);

        var (items, total) = await _books.FindAsync(
            query.SearchField,
            query.Term.Trim(),
            page * PageSize,
            PageSize,
            cancellationToken);

        return new FindBooksResult(items, total, (page + 1) * PageSize < total);
    }
}
