namespace LibraryManagementSystem.Domain
{
    public class BorrowRecord
    {
        public int Id { get; private set; }
        public int BookCopyId { get; private set; }
        public int MemberId { get; private set; }
        public DateTime IssueDate { get; private set; }
        public DateTime DueDate { get; private set; }
        public DateTime? ReturnDate { get; private set; }
        public BorrowStatus Status { get; private set; }

        private BorrowRecord() { } 

        private BorrowRecord(int bookCopyId, int memberId, DateTime issueDate, DateTime dueDate)
        {
            if (dueDate <= issueDate)
                throw new ArgumentException("Due date must be later than the issue date.", nameof(dueDate));

            BookCopyId = bookCopyId;
            MemberId = memberId;
            IssueDate = issueDate;
            DueDate = dueDate;
            Status = BorrowStatus.Borrowed;
        }

        public const int DefaultBorrowPeriodDays = 14;
        public static BorrowRecord Create(int bookCopyId, int memberId, DateTime issueDate, DateTime dueDate)
            => new(bookCopyId, memberId, issueDate, dueDate);

        public void Return(DateTime returnDate)
        { 
            if (Status != BorrowStatus.Borrowed)
                throw new InvalidOperationException("Only an active borrowing can be returned.");

            ReturnDate = returnDate;
            Status = BorrowStatus.Returned;
        }
    }

}
