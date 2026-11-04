namespace LibraryManagementSystem.Features.Books.GetBookDetails;

/// <summary>
/// What the "Next Available" row on Book Details says.
/// Display only: it is worked out from copy statuses and due dates, never stored,
/// and no business rule reads it.
/// </summary>
public enum NextAvailability
{
    /// <summary>At least one copy is on the shelf.</summary>
    Now = 1,

    /// <summary>Every copy is out; the earliest due date is today or later.</summary>
    DueBack = 2,

    /// <summary>Every copy is out; the earliest due date has already passed.</summary>
    Overdue = 3
}
