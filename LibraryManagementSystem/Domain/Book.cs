namespace LibraryManagementSystem.Domain
{
    public class Book
    {
        public int BookId { get; private set; }
        public string Title { get; private set; } = null!;
        public string Author { get; private set; } = null!;
        public string Isbn { get; private set; } = null!;
        public string Category { get; private set; } = null!;
        public string Publisher { get; private set; } = null!;

        private Book() 
        { 
        }

        public Book(string title, string author, string isbn, string category, string publisher)
        {
            Title = title;
            Author = author;
            Isbn = isbn;
            Category = category;
            Publisher = publisher;
        }
    }
}
