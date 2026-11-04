using MediatR;
using LibraryManagementSystem.Features.Books.FindBooks;
using LibraryManagementSystem.Features.Books.GetBookDetails;
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

        // GET /books/search?searchField=Title&text=clean   → matching books
        // GET /books/search?searchField=Title              → every book
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] SearchBooksQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }


        // GET /books/find?searchField=Author&term=martin&page=0
        // One row per book (books with no copies included), 25 per page.
        [HttpGet("find")]
        public async Task<IActionResult> Find(
            [FromQuery] FindBooksQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        // GET /books/7
        // The :int constraint keeps "search" and "find" from ever matching here.
        [HttpGet("{bookId:int}")]
        public async Task<IActionResult> Details(int bookId, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetBookDetailsQuery(bookId), cancellationToken);

            return result is not null
                ? Ok(result)
                : NotFound(new { error = "BookNotFound" });
        }
    }
}
