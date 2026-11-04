using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Books.GetBookDetails;
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

        public async Task<IReadOnlyList<BookCopyRow>> GetCopiesForBookAsync(
        int bookId, CancellationToken cancellationToken)
        {
        var rows =
            from copy in _db.BookCopies.AsNoTracking()
            where copy.BookId == bookId
            join br in _db.BorrowRecords.AsNoTracking().Where(r => r.Status == BorrowStatus.Borrowed)
                on copy.Id equals br.BookCopyId into activeRecords
            from br in activeRecords.DefaultIfEmpty()          // null when the copy is free
            join m in _db.Members.AsNoTracking()
                on br.MemberId equals m.Id into borrowers
            from m in borrowers.DefaultIfEmpty()               // null when there's no active record
            orderby copy.CopyCode
            select new BookCopyRow(
                copy.Id,
                copy.CopyCode,
                copy.Status,
                m != null ? m.Name : null,
                m != null ? (int?)m.Id : null,
                br != null ? (DateTime?)br.DueDate : null);

        return await rows.ToListAsync(cancellationToken);
    }
}


