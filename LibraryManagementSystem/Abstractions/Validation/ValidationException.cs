namespace LibraryManagementSystem.Abstractions.Validation
{
    public sealed class ValidationException : Exception
    {
        public ValidationException(IEnumerable<ValidationFailure> errors)
            : base("One or more validation errors occurred.")
        {
            Errors = errors
                .GroupBy(failure => failure.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(failure => failure.ErrorMessage).ToArray());
        }

        public IDictionary<string, string[]> Errors { get; }
    }
}
