using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Books.SearchBooks;

namespace LibraryManagementSystem.Abstractions
{
    public interface IBookRepository
    {
     Task<IReadOnlyList<SearchBooksResult.Item>> SearchAsync(
      BookSearchField searchField, string? text, CancellationToken cancellationToken);

     Task<int> CountAsync(CancellationToken cancellationToken);

    }
}
