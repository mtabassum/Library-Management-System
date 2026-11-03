using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using MediatR;

namespace LibraryManagementSystem.Features.Members.FindMembers;

public sealed class FindMembersHandler
    : IRequestHandler<FindMembersQuery, FindMembersResult>
{
    public const int PageSize = 25;
    private readonly IMemberRepository _members;

    public FindMembersHandler(IMemberRepository members) => _members = members;

    public async Task<FindMembersResult> Handle(
        FindMembersQuery query,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(0, query.Page);

        var (items, total) = await _members.FindAsync(
            query.SearchType,
            query.Term.Trim(),
            page * PageSize,
            PageSize,
            cancellationToken);

        return new FindMembersResult(items, total, (page + 1) * PageSize < total);
    }
}

