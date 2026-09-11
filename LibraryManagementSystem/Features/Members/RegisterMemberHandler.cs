using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Domain;
using MediatR;

namespace LibraryManagementSystem.Features.Members;

public sealed class RegisterMemberHandler
    : IRequestHandler<RegisterMemberCommand, Result<RegisterMemberResult>>
{
    private readonly IMemberRepository _members;
    private readonly IMemberCodeGenerator _codeGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterMemberHandler(
        IMemberRepository members,
        IMemberCodeGenerator codeGenerator,
        IUnitOfWork unitOfWork)
    {
        _members = members;
        _codeGenerator = codeGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RegisterMemberResult>> Handle(
        RegisterMemberCommand command, CancellationToken cancellationToken)
    {
        var code = await _codeGenerator.NextAsync(cancellationToken);

        var member = new Member(code, command.Name, command.Phone, command.Address);
        _members.Add(member);

        await _unitOfWork.SaveChangesAsync(cancellationToken); 

        return Result.Success(new RegisterMemberResult(member.Id, member.MemberCode));
    }
}

