using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Borrowing.FindActiveLoans;
using LibraryManagementSystem.Features.Members.GetMemberDetails;

namespace LibraryManagementSystem.Abstractions
{
    public interface IBorrowRecordRepository
    {
        void Add(BorrowRecord record);
        Task<int> CountActiveByMemberAsync(int memberId, CancellationToken cancellationToken);

        Task<BorrowRecord?> GetActiveByCopyIdAsync(int bookCopyId, CancellationToken cancellationToken);

        Task<IReadOnlyList<FindActiveBorrowingsResult.Item>> GetActiveBorrowingsAsync(
            BorrowingLookupField field, string term, CancellationToken cancellationToken);

        Task<IReadOnlyList<MemberBorrowingRow>> GetBorrowingsForMemberAsync(
        int memberId,
        CancellationToken cancellationToken);
    }
}
