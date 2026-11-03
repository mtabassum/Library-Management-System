using LibraryManagementSystem.Abstractions.Validation;
using MediatR;

namespace LibraryManagementSystem.Infrastructure.Behaviors
{
    public sealed class ValidationBehavior<TRequest, TResponse>
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
            => _validators = validators;

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var errors = _validators
                .SelectMany(validator => validator.Validate(request))
                .ToList();

            if (errors.Count > 0)
                throw new ValidationException(errors);

            return await next(cancellationToken);
        }
    }
}
