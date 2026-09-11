using MediatR;

namespace LibraryManagementSystem.Features.Members.GetMemberDetails;

/// <summary>
/// Flow 5 — View Member Details. A plain read, so it returns its result model
/// directly instead of a <c>Result&lt;T&gt;</c>; "no such member" is the only
/// failure and the controller maps a null response to 404.
/// </summary>
public sealed record GetMemberDetailsQuery(int MemberId)
    : IRequest<GetMemberDetailsResult?>;
