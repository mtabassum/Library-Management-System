using MediatR;

namespace LibraryManagementSystem.Features.Books.GetBookDetails;

/// <summary>
/// Flow 6 — View Book Details. A plain read, so it returns its result model
/// directly instead of a <c>Result&lt;T&gt;</c>; "no such book" is the only
/// failure and the controller maps a null response to 404.
/// </summary>
public sealed record GetBookDetailsQuery(int BookId)
    : IRequest<GetBookDetailsResult?>;
