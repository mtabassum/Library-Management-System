using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Members.FindMembers;
using LibraryManagementSystem.Features.Members.GetMemberDetails;

namespace LibraryManagementSystem.Abstractions
{
    public interface IMemberRepository
    {
        Task<Member?> GetByIdAsync(int id, CancellationToken cancellationToken);
        void Add(Member member);
        Task<(IReadOnlyList<FindMembersResult.MemberItem> Items, int Total)> FindAsync(
        MemberSearchType searchType, string term, int skip, int take,CancellationToken cancellationToken);

        Task<int> CountAsync(CancellationToken cancellationToken);

        Task<GetMemberDetailsResult.Profile?> GetProfileAsync(
        int memberId,
        CancellationToken cancellationToken);
    }
}
