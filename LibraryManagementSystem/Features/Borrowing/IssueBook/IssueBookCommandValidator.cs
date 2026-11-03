using LibraryManagementSystem.Abstractions.Validation;

namespace LibraryManagementSystem.Features.Borrowing.IssueBook
{
    /// <summary>
    /// Input checks for IssueBookCommand.
    ///
    /// Only structural checks live here. "Is there really a copy with this id?"
    /// and "is that copy available?" are NOT input checks -- they need the
    /// database, and the handler already answers both with
    /// Result.Failure("BookCopyNotFound") and Result.Failure("BookCopyUnavailable").
    /// </summary>
    public sealed class IssueBookCommandValidator : IValidator<IssueBookCommand>
    {
        public IEnumerable<ValidationFailure> Validate(IssueBookCommand command)
        {
            var errors = new List<ValidationFailure>();

            if (command.BookCopyId <= 0)
            {
                errors.Add(new ValidationFailure(
                    nameof(command.BookCopyId),
                    "BookCopyId must be greater than 0."));
            }

            return errors;
        }
    }
}
