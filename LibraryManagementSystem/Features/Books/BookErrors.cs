using LibraryManagementSystem.Abstractions.Errors;


namespace LibraryManagementSystem.Features.Books
{
    public static class BookErrors
    {
        public static Error BookNotFound(int bookId) =>
            Error.NotFound(
                "Books.BookNotFound",
                $"No book exists with id {bookId}.");
    }

}
