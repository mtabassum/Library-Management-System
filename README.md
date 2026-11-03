# Library Management System

A library system that lets a librarian find any copy in the catalog, issue it to a member, check it back in, and pull up anyone's borrowing history in seconds.

Built on .NET 10 with Vertical Slice Architecture and CQRS. The frontend is React + TypeScript. Both live in this one repository.

---

## Who uses it

The **librarian**. A member comes to the desk to borrow or return a book, and the librarian does the work in the app.

---

## What it can do

| Feature | What the librarian can do | Status |
|---|---|---|
| Dashboard | See totals: books, available copies, borrowed copies, members | ✅ Done |
| Search books | Search by title, author, or ISBN. See every copy and whether it is available. Borrowed copies show who has them and when they are due. | ✅ Done |
| Issue book | Pick an available copy, find the member, confirm the due date, and issue it | ✅ Done |
| Return book | Find a borrowed copy by copy code, ISBN, member code, or member phone, then confirm the return | ✅ Done |
| Member details | Find a member by member code, phone, or name. See their current books and full borrowing history. Return a book straight from their profile. | ✅ Done |
| Summary popup | See a clear confirmation after issuing or returning a book | ✅ Done |
| Book details | See one book with all its copies and borrowers | 🔜 Planned |

---

## Tech stack

**Backend** (`LibraryManagementSystem/`)
- .NET 10, ASP.NET Core Web API
- Entity Framework Core with SQL Server
- MediatR (sends each request to the right handler)
- Built-in `ILogger` for logging
- Scalar for API docs (development only)

**Frontend** (`client/`)
- React 19 + TypeScript, built with Vite
- React Router for pages
- CSS Modules for styling. No UI library.

---

## Getting started

### 1. What you need

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- SQL Server (Express or Developer edition is fine)
- [Node.js](https://nodejs.org/) (LTS version) and npm

### 2. Get the code

```bash
git clone <your-repo-url>
cd LibraryManagementSystem
```

### 3. Set your database connection

The connection string is kept out of Git. Each developer stores their own with **User Secrets**. User Secrets live on your machine, outside the project folder, so a password can never end up in a commit.

```bash
cd LibraryManagementSystem
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=YOUR_SERVER;Database=LibraryManagementDb;Trusted_Connection=True;TrustServerCertificate=True"
```

Replace `YOUR_SERVER` with your SQL Server name. For SQL Server Express it is usually `localhost\SQLEXPRESS`.

**You do not need to run migrations by hand.** When the API starts, it:
1. creates the database if it does not exist,
2. applies any new migrations,
3. adds sample data if the tables are empty.

### 4. Run the API

Open `LibraryManagementSystem.slnx` in Visual Studio, choose the **https** profile, and press **F5**.

Or from a terminal:

```bash
cd LibraryManagementSystem
dotnet run --launch-profile https
```

The API runs at **https://localhost:7001**.
To browse and try the endpoints, open **https://localhost:7001/scalar**.

### 5. Run the frontend

In a second terminal, from the repository root:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The frontend sends every API call to `/api/...`. Vite forwards those calls to `https://localhost:7001`, so the API must be running on the **https** profile.

---

## Sample data

The first run fills the database with test data, so you can try every screen right away:

- **30 books** from real publishers
- **80 copies** spread across those books
- **30 members**. 6 of them are deactivated, so you can see the "inactive member can't borrow" rule in action.

Some useful formats:
- Copy codes look like `BC-0001-01` (book 1, copy 1).
- Member codes look like `M-0001`. New codes come from a database sequence, so two members never get the same code.

---

## Project structure

```text
/
├── LibraryManagementSystem/          ← the backend (ASP.NET Core Web API)
│   ├── Domain/                       ← Book, BookCopy, Member, BorrowRecord and their rules
│   ├── Abstractions/                 ← shared contracts: Result, Error, repository interfaces, validation
│   ├── Features/                     ← one folder per business area, one sub-folder per use case
│   │   ├── Books/                    ← SearchBooks
│   │   ├── Borrowing/                ← IssueBook, FindActiveBorrowings, ReturnBook
│   │   ├── Members/                  ← FindMembers, GetMemberDetails
│   │   └── Dashboard/                ← GetDashboard
│   ├── Infrastructure/
│   │   ├── Persistence/              ← DbContext, EF configurations, repositories, seeder
│   │   ├── Behaviors/                ← steps that run around every request (logging, validation)
│   │   ├── ErrorHandling/            ← global exception handler
│   │   ├── Middleware/               ← correlation id
│   │   └── Extensions/               ← keeps Program.cs short
│   ├── Migrations/                   ← EF Core migrations
│   └── Program.cs
├── client/                           ← the frontend (Vite + React + TypeScript)
│   └── src/
│       ├── api/                      ← shared fetch helpers and error reading
│       ├── components/               ← layout and icons
│       └── features/                 ← one folder per screen, mirroring the backend
├── LibraryManagementSystem.slnx
└── .gitignore
```

The backend uses **Vertical Slice Architecture**. In simple words: code is grouped by *what it does* (issue a book), not by *what kind of code it is* (all controllers in one folder, all services in another). Everything for "issue a book" sits together in `Features/Borrowing/IssueBook/`.

[ARCHITECTURE.md](ARCHITECTURE.md) explains how the parts connect.

---

## API endpoints

| Method | Path | What it does |
|---|---|---|
| `GET` | `/dashboard` | Totals for the dashboard tiles |
| `GET` | `/books/search` | Search books by title, author, or ISBN. Returns one row per copy. |
| `GET` | `/members/find` | Find members by member code, phone, or name. Name results come back 25 at a time. |
| `GET` | `/members/{memberId}` | One member's profile, current books, and history |
| `POST` | `/borrowing/issue` | Issue a copy to a member |
| `GET` | `/borrowing/active` | Find borrowed copies by copy code, ISBN, member code, or member phone |
| `POST` | `/borrowing/return` | Return a borrowed copy |

### When something goes wrong

Errors come back as standard **ProblemDetails** JSON, so the frontend reads them one way.

| Status | When |
|---|---|
| `400` | The request itself is wrong. Example: a required field is missing. |
| `404` | The thing asked for does not exist. Example: no copy with that id. |
| `409` | The request is fine, but the library's rules say no. Example: the copy is already borrowed. |
| `500` | Something unexpected broke. The details are logged on the server, not sent to the browser. |

Every response has an `X-Correlation-Id` header. It is a unique id for that one request. If something fails, search the server logs for that id to find every log line from that request.

---

## Business rules

These come from the project specification:

- A copy can only be issued if it is **available**.
- Only **active** members can borrow.
- The due date must be **after** the issue date.
- Issuing a copy marks it **Borrowed** and creates a borrow record.
- Only **borrowed** copies can be returned.
- Returning records the return date and marks the copy **Available** again.
- A returned book leaves the member's current list but **stays in their history**.

These were added on top of the spec:

- A member can hold **at most 5 books** at once.
- The due date defaults to **14 days** after the issue date. The librarian can change it before confirming.
- A return shows whether the book came back **late**. There are no fines.
- Search by member **name** needs at least 3 letters.

---

## Design choices

- **Use-case handlers instead of service classes.** The spec suggests `BookService`, `MemberService`, and `BorrowService`. This project uses one small handler per use case instead. Each handler does one job, so it stays small and easy to read.
- **One project, not many.** Folders keep the layers apart. Splitting into several projects would add setup without a real benefit at this size.
- **Rules live in the domain objects.** For example, only `BookCopy` can change its own status. Nothing else can set it directly.
- **Expected "no" answers are values, not exceptions.** "This copy is already borrowed" is normal library life, so the handler returns it as a result. Exceptions are kept for real bugs.

---

## Roadmap

- [ ] Book Details screen (spec Flow 6)
- [ ] Librarian setting for the default borrow period
- [ ] Serilog for structured logging
