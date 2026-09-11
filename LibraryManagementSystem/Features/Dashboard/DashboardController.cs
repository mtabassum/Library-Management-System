using LibraryManagementSystem.Features.Dashboard.GetDashboard;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Features.Dashboard;
    [ApiController]
    [Route("dashboard")]
    public sealed class DashboardController : ControllerBase
    {
        private readonly ISender _mediator;

        public DashboardController(ISender mediator) => _mediator = mediator;

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetDashboardQuery(), cancellationToken);
            return Ok(result);
        }
    }
