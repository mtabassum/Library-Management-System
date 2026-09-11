namespace LibraryManagementSystem.Domain
{
    public class BookCopy
    {
        public int Id { get; private set; }
        public int BookId { get; private set; }
        public string CopyCode { get; private set; } = null!;
        public BookCopyStatus Status { get; private set; }

        public bool IsAvailable => Status == BookCopyStatus.Available;

        private BookCopy() { } 

        private BookCopy(int bookId, string copyCode)
        {
            BookId = bookId;
            CopyCode = copyCode;
            Status = BookCopyStatus.Available;
        }

        public static BookCopy CreateFor(int bookId, string copyCode) => new(bookId, copyCode);

        public void MarkAsBorrowed()
        {
            if (!IsAvailable)
                throw new InvalidOperationException("Only an available book copy can be borrowed.");

            Status = BookCopyStatus.Borrowed;
        }

        public void MarkAsAvailable()
        {
            if (Status != BookCopyStatus.Borrowed)
                throw new InvalidOperationException("Only a borrowed copy can be made available.");

            Status = BookCopyStatus.Available;
        }
    }
}
