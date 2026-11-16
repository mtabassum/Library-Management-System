using LibraryManagementSystem.Abstractions.Validation;

namespace LibraryManagementSystem.Features.Members.FindMembers
{
    public sealed class FindMembersQueryValidator : IValidator<FindMembersQuery>
    {
        public IEnumerable<ValidationFailure> Validate(FindMembersQuery query)
        {
            if (!Enum.IsDefined(query.SearchType))
                yield return new ValidationFailure(
                    nameof(query.SearchType), "SearchType must be Id, Phone, Code or Name.");
        }
    }
}
