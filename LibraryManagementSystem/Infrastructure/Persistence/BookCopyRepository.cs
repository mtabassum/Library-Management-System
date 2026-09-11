using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence;
    public class BookCopyRepository : IBookCopyRepository
    {
        private readonly LibraryDbContext _db;
        public BookCopyRepository(LibraryDbContext db) => _db = db;

        public Task<BookCopy?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            _db.BookCopies.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        public Task<int> CountByStatusAsync(
    BookCopyStatus status, CancellationToken cancellationToken) =>
    _db.BookCopies.CountAsync(c => c.Status == status, cancellationToken);
    }


