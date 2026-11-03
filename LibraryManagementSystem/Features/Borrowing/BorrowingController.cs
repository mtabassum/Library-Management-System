using LibraryManagementSystem.Extensions;
using LibraryManagementSystem.Features.Borrowing.FindActiveLoans;
using LibraryManagementSystem.Features.Borrowing.IssueBook;
using LibraryManagementSystem.Features.Borrowing.ReturnBook;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Features.Borrowing;

[ApiController]
[Route("borrowing")]
public sealed class BorrowingController : ControllerBase
{
    private readonly ISender _mediator;
    public BorrowingController(ISender mediator) => _mediator = mediator;

    // POST /borrowing/issue   body: { "bookCopyId": 1, "memberId": 1, "dueDate": null }
    [HttpPost("issue")]
    public async Task<IActionResult> Issue(IssueBookCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.ToActionResult();
    }

    // GET /borrowing/active?field=CopyCode&term=BC-0001-01
    [HttpGet("active")]
    public async Task<IActionResult> FindActive(
        [FromQuery] FindActiveBorrowingsQuery query, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // POST /borrowing/return   body: { "bookCopyId": 7 }
    [HttpPost("return")]
    public async Task<IActionResult> Return(
        ReturnBookCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.ToActionResult();
    }
}
