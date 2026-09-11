using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain; 
using MediatR;

namespace LibraryManagementSystem.Features.Dashboard.GetDashboard;

public sealed class GetDashboardHandler
    : IRequestHandler<GetDashboardQuery, GetDashboardResult>
{
    private readonly IBookRepository _books;
    private readonly IBookCopyRepository _copies;
    private readonly IMemberRepository _members;

    public GetDashboardHandler(
        IBookRepository books,
        IBookCopyRepository copies,
        IMemberRepository members)
    {
        _books = books;
        _copies = copies;
        _members = members;
    }

    public async Task<GetDashboardResult> Handle(
        GetDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var totalBooks = await _books.CountAsync(cancellationToken);
        var availableCopies = await _copies.CountByStatusAsync(
            BookCopyStatus.Available, cancellationToken);
        var onLoan = await _copies.CountByStatusAsync(
            BookCopyStatus.Borrowed, cancellationToken);
        var memberCount = await _members.CountAsync(cancellationToken);

        return new GetDashboardResult(totalBooks, availableCopies, onLoan, memberCount);
    }
}

