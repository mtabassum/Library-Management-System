using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Borrowing.IssueBook;

public sealed record IssueBookCommand(int BookCopyId, int MemberId, DateTime? DueDate)
    : IRequest<Result<IssueBookResult>>;
