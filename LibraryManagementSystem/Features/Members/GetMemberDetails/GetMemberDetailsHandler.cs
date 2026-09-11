using MediatR;
using LibraryManagementSystem.Abstractions;

namespace LibraryManagementSystem.Features.Members.GetMemberDetails;

// Loads the profile, then every borrowing the member has ever had, and splits
// that one list into "out now" and "history". Overdue is derived here rather
// than read from BorrowStatus, so the screen stays correct whether or not a
// record is ever transitioned to an overdue state later.
public sealed class GetMemberDetailsHandler
    : IRequestHandler<GetMemberDetailsQuery, GetMemberDetailsResult?>
{
    private readonly IMemberRepository _members;
    private readonly IBorrowRecordRepository _borrowRecords;

    public GetMemberDetailsHandler(
        IMemberRepository members,
        IBorrowRecordRepository borrowRecords)
    {
        _members = members;
        _borrowRecords = borrowRecords;
    }

    public async Task<GetMemberDetailsResult?> Handle(
        GetMemberDetailsQuery query,
        CancellationToken cancellationToken)
    {
        var profile = await _members.GetProfileAsync(query.MemberId, cancellationToken);
        if (profile is null)
            return null;

        var borrowings = await _borrowRecords.GetBorrowingsForMemberAsync(
            query.MemberId, cancellationToken);

        // Issue dates are written with DateTime.UtcNow, so compare against the
        // same clock. Whole days only -- a book due today is not yet overdue.
        var today = DateTime.UtcNow.Date;

        // An open borrowing is one with no return date. Equivalent to
        // Status == Borrowed, since BorrowRecord.Return sets both, but this way
        // an overdue record can never fall out of the list the librarian needs.
        var currentlyBorrowed = borrowings
            .Where(borrowing => borrowing.ReturnDate is null)
            .OrderBy(borrowing => borrowing.DueDate)
            .Select(borrowing => new GetMemberDetailsResult.CurrentBorrowing(
                borrowing.BorrowRecordId,
                borrowing.BookCopyId,
                borrowing.CopyCode,
                borrowing.Title,
                borrowing.Author,
                borrowing.IssueDate,
                borrowing.DueDate,
                IsOverdue: borrowing.DueDate.Date < today,
                DaysOverdue: Math.Max(0, (today - borrowing.DueDate.Date).Days)))
            .ToList();

        var history = borrowings
            .Where(borrowing => borrowing.ReturnDate is not null)
            .OrderByDescending(borrowing => borrowing.ReturnDate)
            .Select(borrowing => new GetMemberDetailsResult.HistoryEntry(
                borrowing.BorrowRecordId,
                borrowing.CopyCode,
                borrowing.Title,
                borrowing.Author,
                borrowing.IssueDate,
                borrowing.DueDate,
                borrowing.ReturnDate,
                WasReturnedLate: borrowing.ReturnDate!.Value.Date > borrowing.DueDate.Date))
            .ToList();

        var summary = new GetMemberDetailsResult.Summary(
            CurrentlyBorrowed: currentlyBorrowed.Count,
            Overdue: currentlyBorrowed.Count(borrowing => borrowing.IsOverdue),
            TotalBorrowed: borrowings.Count);

        return new GetMemberDetailsResult(profile, summary, currentlyBorrowed, history);
    }
}
