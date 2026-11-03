const BASE_URL = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly correlationId: string | null;

  readonly errorCode: string | null;

  readonly validationErrors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number,
    correlationId: string | null,
    errorCode: string | null = null,
    validationErrors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.correlationId = correlationId;
    this.errorCode = errorCode;
    this.validationErrors = validationErrors;
  }
}

interface ParsedError {
  message: string;
  errorCode: string | null;
  validationErrors: Record<string, string[]> | null;
}

// The API sends three error shapes. All of them are ProblemDetails; they just
// fill different fields.
//
//   1. Handler failure (Result.Failure):  detail + errorCode
//        { status: 409, detail: "Copy BC-0001-01 is already borrowed.",
//          errorCode: "Borrowing.CopyUnavailable" }
//
//   2. Validation failure (ValidationBehavior): title + errors, NO detail
//        { status: 400, title: "The request contains invalid values.",
//          errors: { BookCopyId: ["BookCopyId must be greater than 0."] } }
//
//   3. Crash (GlobalExceptionHandler) or ASP.NET Core itself: title only
//        { status: 500, title: "Something went wrong. Please try again." }
//
async function parseError(response: Response): Promise<ParsedError> {
  try {
    const body = await response.json();

    if (body && typeof body === "object") {
      const errorCode =
        typeof body.errorCode === "string" ? body.errorCode : null;

      if (body.errors && typeof body.errors === "object") {
        const validationErrors = body.errors as Record<string, string[]>;
        const flattened = Object.values(validationErrors).flat().join(" ");

        return {
          message:
            flattened ||
            (typeof body.title === "string"
              ? body.title
              : "The request contains invalid values."),
          errorCode,
          validationErrors,
        };
      }

      // Shape 1: written for a human and already includes the specifics.
      if (typeof body.detail === "string" && body.detail.length > 0) {
        return { message: body.detail, errorCode, validationErrors: null };
      }

      // Shape 3.
      if (typeof body.title === "string") {
        return { message: body.title, errorCode, validationErrors: null };
      }
    }
  } catch {
    // empty body, or not JSON
  }

  return {
    message: `Request failed with status ${response.status}`,
    errorCode: null,
    validationErrors: null,
  };
}

async function toApiError(response: Response): Promise<ApiError> {
  const correlationId = response.headers.get("X-Correlation-Id");
  const parsed = await parseError(response);

  return new ApiError(
    parsed.message,
    response.status,
    correlationId,
    parsed.errorCode,
    parsed.validationErrors,
  );
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response.json() as Promise<T>;
}
