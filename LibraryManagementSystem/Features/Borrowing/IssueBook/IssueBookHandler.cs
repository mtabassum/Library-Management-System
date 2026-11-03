using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using MediatR;

namespace LibraryManagementSystem.Features.Borrowing.IssueBook;

public sealed class IssueBookHandler
    : IRequestHandler<IssueBookCommand, Result<IssueBookResult>>
{
    private const int BorrowLimit = 5;

    private const int DefaultLoanDays = 14;

    private readonly IBookCopyRepository _bookCopies;
    private readonly IMemberRepository _members;
    private readonly IBorrowRecordRepository _borrowRecords;
    private readonly IUnitOfWork _unitOfWork;

    public IssueBookHandler(
        IBookCopyRepository bookCopies,
        IMemberRepository members,
        IBorrowRecordRepository borrowRecords,
        IUnitOfWork unitOfWork)
    {
        _bookCopies = bookCopies;
        _members = members;
        _borrowRecords = borrowRecords;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IssueBookResult>> Handle(
        IssueBookCommand command, CancellationToken cancellationToken)
    {
        var copy = await _bookCopies.GetByIdAsync(command.BookCopyId, cancellationToken);
        if (copy is null)
            return Result.Failure<IssueBookResult>(BorrowingErrors.CopyNotFound(command.BookCopyId));

        var member = await _members.GetByIdAsync(command.MemberId, cancellationToken);
        if (member is null)
            return Result.Failure<IssueBookResult>(BorrowingErrors.MemberNotFound(command.MemberId));

        if (!member.IsActive)
            return Result.Failure<IssueBookResult>(BorrowingErrors.MemberInactive(member.MemberCode));

        var activeBorrows = await _borrowRecords.CountActiveByMemberAsync(member.Id, cancellationToken);
        if (activeBorrows >= BorrowLimit)
            return Result.Failure<IssueBookResult>(BorrowingErrors.BorrowLimitReached());

        if (!copy.IsAvailable)
            return Result.Failure<IssueBookResult>(BorrowingErrors.CopyUnavailable(copy.CopyCode));

        var issueDate = DateTime.UtcNow;
        var dueDate = command.DueDate ?? issueDate.AddDays(DefaultLoanDays);

        if (dueDate <= issueDate)
            return Result.Failure<IssueBookResult>(BorrowingErrors.DueDateNotAfterIssueDate());

        copy.MarkAsBorrowed(); 

        var record = BorrowRecord.Create(copy.Id, member.Id, issueDate, dueDate);
        _borrowRecords.Add(record);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new IssueBookResult(
            record.Id, copy.Id, member.Id, record.IssueDate, record.DueDate));
    }
}