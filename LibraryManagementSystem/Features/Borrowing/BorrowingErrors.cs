using LibraryManagementSystem.Abstractions.Errors;

namespace LibraryManagementSystem.Features.Borrowing
{
        public static class BorrowingErrors
        {
            public static Error CopyNotFound(int copyId) =>
                Error.NotFound(
                    "Borrowing.CopyNotFound",
                    $"No book copy exists with id {copyId}.");

            public static Error MemberNotFound(int memberId) =>
                Error.NotFound(
                    "Borrowing.MemberNotFound",
                    $"No member exists with id {memberId}.");

            public static Error CopyUnavailable(string copyCode) =>
                Error.Conflict(
                    "Borrowing.CopyUnavailable",
                    $"Copy {copyCode} is already borrowed.");

            public static Error BorrowLimitReached() =>
                Error.Conflict(
                    "Borrowing.LimitReached",
                    "A member cannot borrow more than 5 books at a time.");

            public static Error MemberInactive(string memberCode) =>
                Error.Conflict(
                    "Borrowing.MemberInactive",
                    $"Member {memberCode} is not active and cannot borrow books.");

            public static Error LoanNotFound(int borrowId) =>
                Error.NotFound(
                    "Borrowing.LoanNotFound",
                    $"No active loan exists with id {borrowId}.");

        public static Error DueDateNotAfterIssueDate() =>
          Error.Validation(
              "Borrowing.DueDateNotAfterIssueDate",
              "The due date must be later than the issue date.");

        public static Error NoActiveLoanForCopy(string copyCode) =>
            Error.NotFound(
                "Borrowing.NoActiveLoanForCopy",
                $"Copy {copyCode} is not currently borrowed, so it cannot be returned.");
    }
    }
