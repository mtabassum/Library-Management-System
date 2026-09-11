using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LibraryManagementSystem.Infrastructure.Persistence.Configurations;
    public sealed class MemberConfiguration : IEntityTypeConfiguration<Member>
    {
        public void Configure(EntityTypeBuilder<Member> builder)
        {
            builder.Property(m => m.MemberCode)
                   .HasColumnName("MemberId")
                   .HasMaxLength(8)
                   .IsRequired();

            builder.HasIndex(m => m.MemberCode).IsUnique();
        }
    }

