using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Books.GetBookDetails;

namespace LibraryManagementSystem.Abstractions
{
    public interface IBookCopyRepository
    {
        Task<BookCopy?> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<int> CountByStatusAsync(BookCopyStatus status, CancellationToken cancellationToken);

        Task<IReadOnlyList<BookCopyRow>> GetCopiesForBookAsync(
        int bookId, CancellationToken cancellationToken);
    }
}
