using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Abstractions.Errors;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Infrastructure.Http
{
    /// <summary>
    /// Turns a Result into an HTTP response.
    ///
    /// This is the ONE place that decides which status code an ErrorType
    /// deserves. 

    /// </summary>
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult<TValue>(this Result<TValue> result)
        {
            if (result.IsSuccess)
                return new OkObjectResult(result.Value);

            if (result.Error is null)
            {
                return Problem(Error.Failure(
                    "Result.MissingError",
                    "The operation failed but reported no reason."));
            }

            return Problem(result.Error);
        }

        private static IActionResult Problem(Error error)
        {
            var status = error.Type switch
            {
                ErrorType.NotFound => StatusCodes.Status404NotFound,

                ErrorType.Conflict => StatusCodes.Status409Conflict,

                ErrorType.Validation => StatusCodes.Status400BadRequest,

                _ => StatusCodes.Status500InternalServerError
            };

            var problem = new ProblemDetails
            {
                Status = status,

                Detail = error.Description
            };

            problem.Extensions["errorCode"] = error.Code;

            var response = new ObjectResult(problem) { StatusCode = status };

            response.ContentTypes.Add("application/problem+json");

            return response;
        }
    }
}