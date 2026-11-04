using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Books.FindBooks;
using LibraryManagementSystem.Features.Books.GetBookDetails;
using LibraryManagementSystem.Features.Books.SearchBooks;

namespace LibraryManagementSystem.Abstractions
{
    public interface IBookRepository
    {
     Task<IReadOnlyList<SearchBooksResult.Item>> SearchAsync(
      BookSearchField searchField, string? text, CancellationToken cancellationToken);

     Task<int> CountAsync(CancellationToken cancellationToken);
     Task<(IReadOnlyList<FindBooksResult.BookItem> Items, int Total)> FindAsync(
     BookSearchField searchField, string term, int skip, int take, CancellationToken cancellationToken);

     Task<GetBookDetailsResult.BookInfo?> GetInfoAsync(
     int bookId, CancellationToken cancellationToken);
    }
}
