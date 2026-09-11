namespace LibraryManagementSystem.Features.Books.SearchBooks;
    public sealed record SearchBooksResult(IReadOnlyList<SearchBooksResult.Item> Copies)
    {
        public sealed record Item(
            int BookId,
            string Title,
            string Author,
            string Isbn,
            string Category,
            string Publisher,
            int CopyId,
            string CopyCode,
            string Status,          
            string? BorrowerName,
            int? MemberId,
            DateTime? DueDate);    
    }
