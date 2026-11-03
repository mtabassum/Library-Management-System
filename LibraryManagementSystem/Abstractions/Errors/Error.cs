namespace LibraryManagementSystem.Abstractions.Errors
{
    public sealed record Error(string Code, string Description, ErrorType Type)
    {
        public static Error Failure(string code, string description)
            => new(code, description, ErrorType.Failure);

        public static Error Validation(string code, string description)
            => new(code, description, ErrorType.Validation);

        public static Error NotFound(string code, string description)
            => new(code, description, ErrorType.NotFound);

        public static Error Conflict(string code, string description)
            => new(code, description, ErrorType.Conflict);
    }
}
