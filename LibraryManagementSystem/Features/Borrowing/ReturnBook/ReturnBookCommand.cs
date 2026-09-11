using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Borrowing.ReturnBook
{
    public sealed record ReturnBookCommand(int BookCopyId)
        : IRequest<Result<ReturnBookResult>>;
}
