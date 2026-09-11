using LibraryManagementSystem.Abstractions;
using MediatR;

namespace LibraryManagementSystem.Features.Members;

public sealed record RegisterMemberCommand(string Name, string Phone, string Address)
    : IRequest<Result<RegisterMemberResult>>;
