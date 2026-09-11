using MediatR;


namespace LibraryManagementSystem.Features.Books.SearchBooks
{
    public sealed record SearchBooksQuery(BookSearchField SearchField, string Text)
        : IRequest<SearchBooksResult>;
}
