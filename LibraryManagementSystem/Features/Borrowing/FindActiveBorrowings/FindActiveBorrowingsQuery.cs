using MediatR;

namespace LibraryManagementSystem.Features.Borrowing.FindActiveLoans;

// A Query, not a Command: it reads what is currently on loan and changes
// nothing. The librarian must see the borrower and dates before confirming,
// so this read has to happen as its own step.
public sealed record FindActiveBorrowingsQuery(BorrowingLookupField Field, string Term)
    : IRequest<FindActiveBorrowingsResult>;
