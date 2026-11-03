using MediatR;

namespace LibraryManagementSystem.Features.Members.FindMembers;

public sealed record FindMembersQuery(MemberSearchType SearchType, string Term, int Page = 0)
    : IRequest<FindMembersResult>;
public enum MemberSearchType
{
    Id = 1,
    Phone = 2,
    Code = 3,
    Name = 4
}
