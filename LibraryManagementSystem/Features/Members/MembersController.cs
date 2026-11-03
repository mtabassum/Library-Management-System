using LibraryManagementSystem.Features.Members.FindMembers;
using LibraryManagementSystem.Features.Members.GetMemberDetails;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Features.Members;

[ApiController]
[Route("members")]
public sealed class MembersController : ControllerBase
{
    private readonly ISender _mediator;

    public MembersController(ISender mediator) => _mediator = mediator;

    [HttpGet("find")]
    public async Task<IActionResult> Find(
        [FromQuery] MemberSearchType searchType,
        [FromQuery] string term,
        [FromQuery] int page = 0,        
    CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new FindMembersQuery(searchType, term, page), cancellationToken);

        return Ok(result);
    }

    // GET /members/7
    [HttpGet("{memberId:int}")]
    public async Task<IActionResult> Details(int memberId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetMemberDetailsQuery(memberId), cancellationToken);

        return result is not null
            ? Ok(result)
            : NotFound(new { error = "MemberNotFound" });
    }
}
