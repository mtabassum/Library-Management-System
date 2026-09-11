using MediatR;
using LibraryManagementSystem.Abstractions;

namespace LibraryManagementSystem.Features.Books.SearchBooks
{
    public sealed class SearchBooksHandler
        : IRequestHandler<SearchBooksQuery, SearchBooksResult>
    {
        private readonly IBookRepository _books;
        public SearchBooksHandler(IBookRepository books) => _books = books;

        public async Task<SearchBooksResult> Handle(
            SearchBooksQuery query, CancellationToken cancellationToken)
        {
            var items = await _books.SearchAsync(query.SearchField, query.Text, cancellationToken);
            return new SearchBooksResult(items);
        }
    }
}
