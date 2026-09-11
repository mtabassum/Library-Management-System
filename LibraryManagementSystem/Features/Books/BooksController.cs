using MediatR;
using LibraryManagementSystem.Features.Books.SearchBooks;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Features.Books
{
    [ApiController]
    [Route("books")]
    public sealed class BooksController : ControllerBase
    {
        private readonly ISender _mediator;
        public BooksController(ISender mediator) => _mediator = mediator;

        // GET /books/search?searchField=Title&text=clean
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] SearchBooksQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }

    }
}
