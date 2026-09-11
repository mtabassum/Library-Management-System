using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Borrowing.FindActiveLoans;
using LibraryManagementSystem.Features.Members.GetMemberDetails;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence;
    public class BorrowRecordRepository : IBorrowRecordRepository
    {
        private readonly LibraryDbContext _db;
        public BorrowRecordRepository(LibraryDbContext db) => _db = db;

        public void Add(BorrowRecord record) => _db.BorrowRecords.Add(record);
        public Task<int> CountActiveByMemberAsync(int memberId, CancellationToken cancellationToken) =>
            _db.BorrowRecords
                .AsNoTracking()
                .CountAsync(r => r.MemberId == memberId && r.ReturnDate == null, cancellationToken);

        public Task<BorrowRecord?> GetActiveByCopyIdAsync(int bookCopyId, CancellationToken cancellationToken) =>
        _db.BorrowRecords.FirstOrDefaultAsync(
            r => r.BookCopyId == bookCopyId && r.Status == BorrowStatus.Borrowed,cancellationToken);


        public async Task<IReadOnlyList<FindActiveBorrowingsResult.Item>> GetActiveBorrowingsAsync(
        BorrowingLookupField field, string term, CancellationToken cancellationToken)
    {
        var borrowings =
            from r in _db.BorrowRecords.AsNoTracking()
            where r.Status == BorrowStatus.Borrowed          // active only
            join c in _db.BookCopies on r.BookCopyId equals c.Id
            join b in _db.Books on c.BookId equals b.BookId
            join m in _db.Members on r.MemberId equals m.Id
            select new { r, c, b, m };

        borrowings = field switch
        {
            BorrowingLookupField.CopyCode => borrowings.Where(x => x.c.CopyCode == term),
            BorrowingLookupField.ISBN => borrowings.Where(x => x.b.Isbn == term),
            _ => borrowings.Where(x => false)
        };

        return await borrowings
            .Select(x => new FindActiveBorrowingsResult.Item(
                x.r.BookCopyId,
                x.c.CopyCode,
                x.b.Title,
                x.b.Author,
                x.b.Isbn,
                x.m.Name,
                x.r.MemberId,
                x.m.MemberCode,
                x.r.IssueDate,
                x.r.DueDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MemberBorrowingRow>> GetBorrowingsForMemberAsync(
    int memberId, CancellationToken cancellationToken)
    {
        var borrowings =
            from r in _db.BorrowRecords.AsNoTracking()
            where r.MemberId == memberId
            join c in _db.BookCopies on r.BookCopyId equals c.Id
            join b in _db.Books on c.BookId equals b.BookId
            select new MemberBorrowingRow(
                r.Id,
                r.BookCopyId,
                c.CopyCode,
                b.Title,
                b.Author,
                r.IssueDate,
                r.DueDate,
                r.ReturnDate);

        return await borrowings.ToListAsync(cancellationToken);
    }

}

