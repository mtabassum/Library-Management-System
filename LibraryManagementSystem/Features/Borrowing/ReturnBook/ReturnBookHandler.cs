using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Borrowing.ReturnBook
{
    public sealed class ReturnBookHandler
        : IRequestHandler<ReturnBookCommand, Result<ReturnBookResult>>
    {
        private readonly IBookCopyRepository _copies;
        private readonly IBorrowRecordRepository _borrowRecords;
        private readonly IUnitOfWork _unitOfWork;

        public ReturnBookHandler(
            IBookCopyRepository copies,
            IBorrowRecordRepository borrowRecords,
            IUnitOfWork unitOfWork)
        {
            _copies = copies;
            _borrowRecords = borrowRecords;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<ReturnBookResult>> Handle(
            ReturnBookCommand command, CancellationToken cancellationToken)
        {
            var copy = await _copies.GetByIdAsync(command.BookCopyId, cancellationToken);
            if (copy is null)
                return Result.Failure<ReturnBookResult>(BorrowingErrors.CopyNotFound(command.BookCopyId));

            var record = await _borrowRecords.GetActiveByCopyIdAsync(
                command.BookCopyId, cancellationToken);
            if (record is null)
                return Result.Failure<ReturnBookResult>(BorrowingErrors.NoActiveLoanForCopy(copy.CopyCode));

            record.Return(DateTime.UtcNow);
            copy.MarkAsAvailable();

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(
                new ReturnBookResult(record.Id, copy.CopyCode, record.ReturnDate!.Value));
        }
    }
}
