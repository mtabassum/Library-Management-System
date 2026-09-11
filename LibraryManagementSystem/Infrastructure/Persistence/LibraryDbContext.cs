using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence
{
    public sealed class LibraryDbContext : DbContext, IUnitOfWork
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }
        public DbSet<Book> Books => Set<Book>();
        public DbSet<BookCopy> BookCopies => Set<BookCopy>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<BorrowRecord> BorrowRecords => Set<BorrowRecord>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(LibraryDbContext).Assembly);

            modelBuilder.HasSequence<int>("MemberCodeSeq")
                        .StartsAt(31)
                        .IncrementsBy(1);
        }
    }
}
