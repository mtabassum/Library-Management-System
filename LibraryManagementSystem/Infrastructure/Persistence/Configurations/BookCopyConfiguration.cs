using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagementSystem.Infrastructure.Persistence.Configurations;

    public sealed class BookCopyConfiguration : IEntityTypeConfiguration<BookCopy>
    {
        public void Configure(EntityTypeBuilder<BookCopy> builder)
        {
            builder.HasOne<Book>()               
                   .WithMany()
                   .HasForeignKey(c => c.BookId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }

