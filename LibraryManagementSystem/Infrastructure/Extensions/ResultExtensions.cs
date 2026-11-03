using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Abstractions.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Extensions
{
    /// <summary>
    /// Turns a Result&lt;T&gt; into an IActionResult. Written once, used by
    /// every controller action that returns a Result.
    ///
    /// Failures come back as ProblemDetails -- the same shape
    /// GlobalExceptionHandler returns -- so the client has ONE error shape to
    /// parse instead of two. The error code travels in an "errorCode"
    /// extension field.
    /// </summary>
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult<T>(this Result<T> result) =>
            result.IsSuccess
                ? new OkObjectResult(result.Value)
                : ToActionResult(result.Error!);

        private static IActionResult ToActionResult(Error error)
        {
            var problem = new ProblemDetails
            {
                Status = StatusFor(error.Type),
                Title = error.Description
            };

            problem.Extensions["errorCode"] = error.Code;

            return new ObjectResult(problem) { StatusCode = problem.Status };
        }

        private static int StatusFor(ErrorType type) => type switch
        {
            ErrorType.NotFound   => StatusCodes.Status404NotFound,
            ErrorType.Conflict   => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            _                    => StatusCodes.Status400BadRequest
        };
    }
}
