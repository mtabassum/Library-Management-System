using LibraryManagementSystem.Domain;

namespace LibraryManagementSystem.Abstractions
{
    public interface IBookCopyRepository
    {
        Task<BookCopy?> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<int> CountByStatusAsync(BookCopyStatus status, CancellationToken cancellationToken);
    }
}
