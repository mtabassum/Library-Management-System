namespace LibraryManagementSystem.Abstractions;
    public interface IMemberCodeGenerator
    {
        Task<string> NextAsync(CancellationToken cancellationToken);
    }

