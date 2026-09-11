using MediatR;

namespace LibraryManagementSystem.Features.Dashboard.GetDashboard;

public sealed record GetDashboardQuery() : IRequest<GetDashboardResult>;
