namespace LibraryManagementSystem.Features.Dashboard.GetDashboard;
    public sealed record GetDashboardResult(
        int TotalBooks,       
        int AvailableCopies, 
        int BorrowedCopies,     
        int MemberCount);     

