namespace LibraryManagementSystem.Abstractions.Validation
{
    public interface IValidator<in T>
    {
        IEnumerable<ValidationFailure> Validate(T instance);
    }
}
