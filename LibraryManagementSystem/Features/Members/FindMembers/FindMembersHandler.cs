using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using MediatR;

namespace LibraryManagementSystem.Features.Members.FindMembers;

public sealed class FindMembersHandler
    : IRequestHandler<FindMembersQuery, FindMembersResult>
{
    private readonly IMemberRepository _members;

    public FindMembersHandler(IMemberRepository members) => _members = members;

    public async Task<FindMembersResult> Handle(
        FindMembersQuery query,
        CancellationToken cancellationToken)
    {
        var matches = await _members.FindAsync(
            query.SearchType, query.Term, cancellationToken);

        return new FindMembersResult(matches);
    }
}

