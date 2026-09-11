using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagementSystem.Infrastructure.Persistence.Configurations;

public sealed class BorrowRecordConfiguration : IEntityTypeConfiguration<BorrowRecord>
{
    public void Configure(EntityTypeBuilder<BorrowRecord> builder)
    {
        builder.HasOne<BookCopy>()
               .WithMany()
               .HasForeignKey(br => br.BookCopyId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Member>()
               .WithMany()
               .HasForeignKey(br => br.MemberId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}

