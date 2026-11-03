namespace LibraryManagementSystem.Abstractions.Validation
{
        public sealed record ValidationFailure(string PropertyName, string ErrorMessage);
}
