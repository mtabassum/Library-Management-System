namespace LibraryManagementSystem.Features.Borrowing.FindActiveLoans;

// How the librarian is looking up the loan to return.
//   CopyCode -> one physical copy, so at most one active loan.
//   ISBN     -> the book itself; several of its copies may be out at once.
public enum BorrowingLookupField
{
    CopyCode = 1,
    ISBN = 2
}
