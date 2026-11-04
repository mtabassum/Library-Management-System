using LibraryManagementSystem.Domain;

namespace LibraryManagementSystem.Features.Books.GetBookDetails;

// One physical copy of the book, joined to its ACTIVE borrow record (if any) and
// that record's member. The repository projects straight into this; the handler
// counts the rows and works out "Next Available", so no date logic has to
// survive translation to SQL. The three borrow fields are null for a copy on
// the shelf.
public sealed record BookCopyRow(
    int CopyId,
    string CopyCode,
    BookCopyStatus Status,
    string? BorrowerName,
    int? MemberId,
    DateTime? DueDate);
