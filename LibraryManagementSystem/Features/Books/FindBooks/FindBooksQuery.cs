using LibraryManagementSystem.Features.Books.SearchBooks;
using MediatR;

namespace LibraryManagementSystem.Features.Books.FindBooks;

/// <summary>
/// The lookup behind the Book Details search bar: "which BOOKS match?",
/// one row per book, paged. SearchBooks answers a different question --
/// "which COPIES match?" -- for the Search Books screen.
///
/// Reuses BookSearchField: both slices search the same three fields and would
/// change for the same reason.
/// </summary>
public sealed record FindBooksQuery(BookSearchField SearchField, string Term, int Page = 0)
    : IRequest<FindBooksResult>;
