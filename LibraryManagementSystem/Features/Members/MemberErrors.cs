using LibraryManagementSystem.Abstractions.Errors;

namespace LibraryManagementSystem.Features.Members
{
    public static class MemberErrors
    {
        public static Error MemberNotFound(int memberId) =>
            Error.NotFound(
                "Members.MemberNotFound",
                $"No member exists with id {memberId}.");
    }
}
