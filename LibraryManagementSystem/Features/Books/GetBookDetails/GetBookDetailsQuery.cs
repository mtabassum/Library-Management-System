using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Books.GetBookDetails;

public sealed record GetBookDetailsQuery(int BookId)
    : IRequest<Result<GetBookDetailsResult>>;
