using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Books.FindBooks;
using LibraryManagementSystem.Features.Books.GetBookDetails;
using LibraryManagementSystem.Features.Books.SearchBooks;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence;
    public sealed class BookRepository : IBookRepository
    {
        private readonly LibraryDbContext _db;
        public BookRepository(LibraryDbContext db) => _db = db;
        public async Task<IReadOnlyList<SearchBooksResult.Item>> SearchAsync(
        BookSearchField searchField, string? text, CancellationToken cancellationToken)
        {
            var books = _db.Books.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(text))
        {
            books = searchField switch
            {
                BookSearchField.Title => books.Where(b => b.Title.Contains(text)),
                BookSearchField.Author => books.Where(b => b.Author.Contains(text)),
                BookSearchField.ISBN => books.Where(b => b.Isbn.Contains(text)),
                _ => books.Where(b => false)
            };
        }
            var query =
                from copy in _db.BookCopies.AsNoTracking()
                join book in books on copy.BookId equals book.BookId
                join br in _db.BorrowRecords.AsNoTracking().Where(r => r.Status == BorrowStatus.Borrowed)
                    on copy.Id equals br.BookCopyId into activeRecords
                from br in activeRecords.DefaultIfEmpty()          // null when the copy is free
                join m in _db.Members.AsNoTracking()
                    on br.MemberId equals m.Id into borrowers
                from m in borrowers.DefaultIfEmpty()               // null when there's no active record
                orderby book.Title, copy.CopyCode
                select new
                {
                    book.BookId,
                    book.Title,
                    book.Author,
                    book.Isbn,
                    book.Category,
                    book.Publisher,
                    CopyId = copy.Id,
                    copy.CopyCode,
                    copy.Status,
                    BorrowerName = m != null ? m.Name : null,
                    MemberId = m != null ? (int?)m.Id : null,
                    DueDate = br != null ? (DateTime?)br.DueDate : null
                };

            var rows = await query.ToListAsync(cancellationToken);

            return rows
                .Select(x => new SearchBooksResult.Item(
                    x.BookId, x.Title, x.Author, x.Isbn, x.Category, x.Publisher,
                    x.CopyId, x.CopyCode, x.Status.ToString(),
                    x.BorrowerName,x.MemberId, x.DueDate))
                .ToList();
        }
        public Task<int> CountAsync(CancellationToken cancellationToken) =>
         _db.Books.CountAsync(cancellationToken);

        public async Task<(IReadOnlyList<FindBooksResult.BookItem> Items, int Total)> FindAsync(
        BookSearchField searchField, string term, int skip, int take, CancellationToken cancellationToken)
    {
        var books = searchField switch
        {
            BookSearchField.Title => _db.Books.AsNoTracking().Where(b => b.Title.Contains(term)),
            BookSearchField.Author => _db.Books.AsNoTracking().Where(b => b.Author.Contains(term)),
            BookSearchField.ISBN => _db.Books.AsNoTracking().Where(b => b.Isbn.Contains(term)),
            _ => _db.Books.AsNoTracking().Where(b => false)
        };

        var total = await books.CountAsync(cancellationToken);

        var items = await books
            .OrderBy(b => b.Title)
            .ThenBy(b => b.BookId)       
            .Skip(skip)
            .Take(take)
            .Select(b => new FindBooksResult.BookItem(
                b.BookId,
                b.Title,
                b.Author,
                b.Isbn,
                _db.BookCopies.Count(c => c.BookId == b.BookId),
                _db.BookCopies.Count(c => c.BookId == b.BookId
                                       && c.Status == BookCopyStatus.Available)))
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task<GetBookDetailsResult.BookInfo?> GetInfoAsync(
        int bookId, CancellationToken cancellationToken) =>
        _db.Books
            .AsNoTracking()
            .Where(b => b.BookId == bookId)
            .Select(b => new GetBookDetailsResult.BookInfo(
                b.BookId, b.Title, b.Author, b.Isbn, b.Category, b.Publisher))
            .FirstOrDefaultAsync(cancellationToken);
}

