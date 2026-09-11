namespace LibraryManagementSystem.Features.Members.GetMemberDetails;

// One borrowing of this member -- open or closed -- flattened across
// BorrowRecord, BookCopy and Book. The repository projects straight into this;
// the handler splits the list and derives the overdue values, so no date
// arithmetic has to survive translation to SQL.
public sealed record MemberBorrowingRow(
    int BorrowRecordId,
    int BookCopyId,
    string CopyCode,
    string Title,
    string Author,
    DateTime IssueDate,
    DateTime DueDate,
    DateTime? ReturnDate);
