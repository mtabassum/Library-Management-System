using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using LibraryManagementSystem.Features.Members.FindMembers;
using LibraryManagementSystem.Features.Members.GetMemberDetails;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence
{
    public sealed class MemberRepository : IMemberRepository
    {
        private readonly LibraryDbContext _db;
        public MemberRepository(LibraryDbContext db) => _db = db;

        public Task<Member?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
            _db.Members.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        public void Add(Member member) => _db.Members.Add(member);
        public async Task<IReadOnlyList<FindMembersResult.MemberItem>> FindAsync(
        MemberSearchType searchType, string term, CancellationToken cancellationToken)
        {
            var members = _db.Members.AsNoTracking();

            IQueryable<Member> matches = searchType switch
            {
                MemberSearchType.Id when int.TryParse(term, out var id)
                    => members.Where(m => m.Id == id),
                MemberSearchType.Code                                    
    => members.Where(m => m.MemberCode == term),
                MemberSearchType.Phone
                    => members.Where(m => m.Phone == term),
                _ => members.Where(_ => false)
            };

            return await matches
                .Select(m => new FindMembersResult.MemberItem(
                    m.Id,m.MemberCode, m.Name, m.Phone, m.Address, m.Status))
                .ToListAsync(cancellationToken);
        }

        public Task<int> CountAsync(CancellationToken cancellationToken) =>
    _db.Members.CountAsync(cancellationToken);

        public Task<GetMemberDetailsResult.Profile?> GetProfileAsync(
    int memberId,
    CancellationToken cancellationToken) =>
    _db.Members
        .AsNoTracking()
        .Where(m => m.Id == memberId)
        .Select(m => new GetMemberDetailsResult.Profile(
            m.Id, m.MemberCode, m.Name, m.Phone, m.Address, m.Status))
        .FirstOrDefaultAsync(cancellationToken);
    }
}
