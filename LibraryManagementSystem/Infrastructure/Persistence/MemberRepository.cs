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
        public async Task<(IReadOnlyList<FindMembersResult.MemberItem> Items, int Total)> FindAsync(
        MemberSearchType searchType, string term, int skip,int take, CancellationToken cancellationToken)
        {
            var query = Filter(_db.Members.AsNoTracking(), searchType, term);

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(m => m.Name)
                .ThenBy(m => m.Id)         
                .Skip(skip)
                .Take(take)
                .Select(m => new FindMembersResult.MemberItem(
                    m.Id, m.MemberCode, m.Name, m.Phone, m.Address, m.Status))
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        private static IQueryable<Member> Filter(
    IQueryable<Member> members, MemberSearchType searchType, string term) =>
    searchType switch
    {
        MemberSearchType.Id => int.TryParse(term, out var id)
            ? members.Where(m => m.Id == id)
            : members.Where(m => false),
        MemberSearchType.Code => members.Where(m => m.MemberCode.Contains(term)),
        MemberSearchType.Phone => members.Where(m => m.Phone.Contains(term)),
        MemberSearchType.Name => members.Where(m => m.Name.Contains(term)),
        _ => throw new ArgumentOutOfRangeException(nameof(searchType))
    };

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
