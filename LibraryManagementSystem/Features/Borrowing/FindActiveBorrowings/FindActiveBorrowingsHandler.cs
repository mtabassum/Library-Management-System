using MediatR;
using LibraryManagementSystem.Abstractions;

namespace LibraryManagementSystem.Features.Borrowing.FindActiveLoans;

public sealed class FindActiveBorrowingsHandler
    : IRequestHandler<FindActiveBorrowingsQuery, FindActiveBorrowingsResult>
{
    private readonly IBorrowRecordRepository _borrowRecords;

    public FindActiveBorrowingsHandler(IBorrowRecordRepository borrowRecords)
        => _borrowRecords = borrowRecords;

    public async Task<FindActiveBorrowingsResult> Handle(
        FindActiveBorrowingsQuery query, CancellationToken cancellationToken)
    {
        var loans = await _borrowRecords.GetActiveBorrowingsAsync(
            query.Field, query.Term, cancellationToken);

        return new FindActiveBorrowingsResult(loans);
    }
}
