using LibraryManagementSystem.Domain;

namespace LibraryManagementSystem.Features.Members.FindMembers;

public sealed record FindMembersResult(IReadOnlyList<FindMembersResult.MemberItem> Members)
{
    public sealed record MemberItem(
        int Id,
        string MemberCode,
        string Name,
        string Phone,
        string Address,
        MemberStatus Status);
}
