import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { findBooks, getBookDetails } from "./bookDetailsApi";
import type {
  AvailabilitySummary,
  BookCopyItem,
  BookDetailsResult,
  BookInfo,
  BookSearchField,
  BookSearchItem,
} from "./types";
import { SearchIcon } from "../../../components/icons";
import styles from "./BookDetailsPage.module.css";

type LoadState = "idle" | "loading" | "done" | "error";

// `value` is what the API expects (BookSearchField); `param` is the short,
// readable word kept in the URL: /books?by=author&q=martin
const FIELDS: { value: BookSearchField; param: string; label: string }[] = [
  { value: "Isbn", param: "isbn", label: "ISBN" },
  { value: "Title", param: "title", label: "Title" },
  { value: "Author", param: "author", label: "Author" },
];

function fieldFromParam(param: string | null): BookSearchField | null {
  return FIELDS.find((f) => f.param === param)?.value ?? null;
}

function paramFromField(field: BookSearchField): string {
  return FIELDS.find((f) => f.value === field)?.param ?? "title";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Navigation state set only when a book is opened from the pick list. Its
// presence is what shows the "Back to results" link.
interface FromResultsState {
  fromResults?: boolean;
}

export default function BookDetailsPage() {
  // This component is registered at both /books and /books/:bookId.
  //   /books                       -> lookup bar only
  //   /books?by=author&q=martin    -> lookup bar + pick list (search is in the URL)
  //   /books/12                    -> lookup bar + that book's details
  const { bookId } = useParams<{ bookId?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const urlField = fieldFromParam(searchParams.get("by"));
  const urlTerm = (searchParams.get("q") ?? "").trim();

  // A list is shown only on /books with a valid by + q. Plain strings, so the
  // effect below can depend on them directly.
  const listField = bookId === undefined && urlTerm !== "" ? urlField : null;
  const listTerm = listField !== null ? urlTerm : null;

  const cameFromResults =
    (location.state as FromResultsState | null)?.fromResults === true;

  // --- lookup bar (what the librarian is typing right now) ---
  const [field, setField] = useState<BookSearchField>(urlField ?? "Isbn");
  const [term, setTerm] = useState(urlTerm);

  // --- pick list ---
  const [searchState, setSearchState] = useState<LoadState>("idle");
  const [matches, setMatches] = useState<BookSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState("");

  // --- details ---
  const [detailsState, setDetailsState] = useState<LoadState>("idle");
  const [detailsError, setDetailsError] = useState("");
  const [details, setDetails] = useState<BookDetailsResult | null>(null);

  // Ignores the answer to a search the librarian has already replaced.
  const requestRef = useRef(0);

  // Runs the search that is in the URL. Because the search lives in the URL,
  // Back, "Back to results" and a refresh all land here and rebuild the list.
  // location.key is a dependency so that searching the same text again
  // (e.g. a retry after an error) still runs.
  useEffect(() => {
    if (listField === null || listTerm === null) {
      requestRef.current++; // a search still running is no longer wanted
      setMatches([]);
      setTotal(0);
      setHasMore(false);
      setPage(0);
      setSearchState("idle");
      setSearchError("");
      return;
    }

    // Keep the lookup bar in step with the URL, e.g. after pressing Back.
    setField(listField);
    setTerm(listTerm);

    const ticket = ++requestRef.current;
    setSearchState("loading");
    setSearchError("");

    findBooks(listField, listTerm, 0)
      .then((result) => {
        if (ticket !== requestRef.current) return;

        // Exactly one match is not a choice -- open it. replace swaps this list
        // URL out of history, so Back can't land on a one-item list that would
        // open the same book again.
        const only = result.total === 1 ? result.books[0] : undefined;
        if (only) {
          navigate(`/books/${only.bookId}`, { replace: true });
          return;
        }

        setMatches(result.books);
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(0);
        setSearchState("done");
      })
      .catch((e: unknown) => {
        if (ticket !== requestRef.current) return;
        setSearchError(e instanceof Error ? e.message : "Something went wrong.");
        setSearchState("error");
      });
  }, [listField, listTerm, location.key, navigate]);

  // Loads the book whose id is in the URL. Same pattern as Member Details.
  useEffect(() => {
    if (bookId === undefined) {
      setDetails(null);
      setDetailsError("");
      setDetailsState("idle");
      return;
    }

    const id = Number(bookId);

    if (!Number.isInteger(id) || id <= 0) {
      setDetails(null);
      setDetailsError("That book link isn't valid. Search for the book instead.");
      setDetailsState("error");
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setDetailsState("loading");
      setDetailsError("");

      try {
        const result = await getBookDetails(id);
        if (cancelled) return;
        setDetails(result);
        setDetailsState("done");
      } catch {
        if (cancelled) return;
        setDetails(null);
        setDetailsError("We couldn't load this book. It may no longer exist.");
        setDetailsState("error");
      }
    }

    void load();

    // Guards against a slow response for a book the librarian has left.
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // Puts the search into the URL; the list effect above does the rest.
  function runSearch(): void {
    const query = term.trim();
    if (!query) return;

    const target = `/books?${new URLSearchParams({
      by: paramFromField(field),
      q: query,
    }).toString()}`;

    // Searching exactly what is already on screen: replace, so a retry doesn't
    // stack a duplicate history entry. The new location.key still re-runs it.
    const sameAsNow = listField === field && listTerm === query;
    navigate(target, { replace: sameAsNow });
  }

  // Text typed for one field (a title) is rarely valid for another (an ISBN),
  // so switching clears the box. The list on screen stays until the next search.
  function changeField(next: BookSearchField): void {
    if (next === field) return;
    setField(next);
    setTerm("");
  }

  // Fetches the next page of the search in the URL and appends it. It doesn't
  // take a new ticket: it continues the current search, so a fresh search
  // makes it stale, never the other way round.
  async function loadMore(): Promise<void> {
    if (listField === null || listTerm === null || loadingMore) return;

    const ticket = requestRef.current;
    const next = page + 1;
    setLoadingMore(true);

    try {
      const result = await findBooks(listField, listTerm, next);
      if (ticket !== requestRef.current) return;

      setMatches((previous) => [...previous, ...result.books]);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(next);
    } catch (e) {
      if (ticket !== requestRef.current) return;
      setSearchError(e instanceof Error ? e.message : "Something went wrong.");
      setSearchState("error");
    } finally {
      setLoadingMore(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") runSearch();
  }

  function openBook(book: BookSearchItem): void {
    const state: FromResultsState = { fromResults: true };
    navigate(`/books/${book.bookId}`, { state });
  }

  // The previous history entry is the list (that's the only way fromResults
  // gets set), so going back one step returns to it exactly, and Forward
  // still works afterwards.
  function backToResults(): void {
    navigate(-1);
  }

  // Same navigation state Search Books sends, so the Issue screen needs no
  // changes: it reads the copy from here on its first render.
  function issueCopy(book: BookInfo, copy: BookCopyItem): void {
    navigate("/issue", {
      state: {
        copyId: copy.copyId,
        copyCode: copy.copyCode,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        status: copy.status,
      },
    });
  }

  function viewMember(copy: BookCopyItem): void {
    if (copy.memberId === null) return;
    navigate(`/members/${copy.memberId}`);
  }

  const showList = listField !== null;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Book Details</h1>
      <p className={styles.intro}>
        View full book information and copy-wise status.
      </p>

      <div className={styles.lookup}>
        <div className={styles.lookupSeg}>
          {FIELDS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={
                field === f.value
                  ? `${styles.lookupSegBtn} ${styles.lookupSegOn}`
                  : styles.lookupSegBtn
              }
              onClick={() => changeField(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className={styles.lookupInput}>
          <SearchIcon />
          <input
            className={styles.lookupField}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              field === "Isbn"
                ? "Enter an ISBN…"
                : field === "Title"
                  ? "Enter a title…"
                  : "Enter an author name…"
            }
            aria-label="Search text"
          />
        </label>

        <button
          className={styles.lookupBtn}
          type="button"
          onClick={runSearch}
          disabled={searchState === "loading"}
        >
          {searchState === "loading" ? "Searching…" : "Search Book"}
        </button>
      </div>

      {searchState === "error" && (
        <div className={`${styles.notice} ${styles.noticeAlert}`}>
          {searchError} — check the API is running, then try again.
        </div>
      )}

      {showList && searchState === "done" && matches.length === 0 && (
        <div className={styles.empty}>
          No book matches &ldquo;{listTerm}&rdquo;. Try another search type.
        </div>
      )}

      {showList && matches.length > 0 && (
        <MatchList
          items={matches}
          total={total}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onPick={openBook}
          onLoadMore={() => void loadMore()}
        />
      )}

      {!showList && bookId === undefined && (
        <div className={styles.empty}>
          Search by ISBN, title or author to see a book and every copy of it.
        </div>
      )}

      {bookId !== undefined && detailsState === "loading" && (
        <div className={styles.notice}>Loading book…</div>
      )}

      {bookId !== undefined && detailsState === "error" && detailsError && (
        <div className={`${styles.notice} ${styles.noticeAlert}`}>
          {detailsError}
        </div>
      )}

      {bookId !== undefined && detailsState === "done" && details && (
        <>
          {cameFromResults && (
            <button className={styles.back} type="button" onClick={backToResults}>
              Back to results
            </button>
          )}

          <div className={styles.twoUp}>
            <BookInfoCard book={details.book} />
            <AvailabilityCard summary={details.summary} />
          </div>

          <CopyTable
            copies={details.copies}
            onIssue={(copy) => issueCopy(details.book, copy)}
            onViewMember={viewMember}
          />
        </>
      )}
    </div>
  );
}

function MatchList({
  items,
  total,
  hasMore,
  loadingMore,
  onPick,
  onLoadMore,
}: {
  items: BookSearchItem[];
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onPick: (book: BookSearchItem) => void;
  onLoadMore: () => void;
}) {
  const showingAll = items.length >= total;

  return (
    <>
      <div className={styles.resultMeta}>
        {showingAll
          ? `${total} ${total === 1 ? "book" : "books"} match — pick one`
          : `Showing ${items.length} of ${total} books — pick one, or add more words to narrow the search`}
      </div>
      <div className={styles.matchList}>
        {items.map((book) => (
          <button
            key={book.bookId}
            type="button"
            className={styles.matchRow}
            onClick={() => onPick(book)}
          >
            <span className={styles.matchBody}>
              <span className={styles.matchName}>{book.title}</span>
              <span className={styles.matchSub}>
                {book.author}
                {" · "}
                <span className={styles.mono}>{book.isbn}</span>
              </span>
            </span>
            <MatchChip book={book} />
          </button>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            className={styles.loadMoreBtn}
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}

function MatchChip({ book }: { book: BookSearchItem }) {
  if (book.totalCopies === 0) {
    return <span className={`${styles.chip} ${styles.chipQuiet}`}>No copies</span>;
  }
  if (book.availableCopies > 0) {
    return (
      <span className={`${styles.chip} ${styles.chipOk}`}>
        {book.availableCopies} of {book.totalCopies} available
      </span>
    );
  }
  return <span className={`${styles.chip} ${styles.chipQuiet}`}>None available</span>;
}

function BookInfoCard({ book }: { book: BookInfo }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Book Information</h2>
      <dl className={styles.facts}>
        <dt>Title</dt>
        <dd className={styles.factTitle}>{book.title}</dd>
        <dt>Author</dt>
        <dd>{book.author}</dd>
        <dt>ISBN</dt>
        <dd className={styles.mono}>{book.isbn}</dd>
        <dt>Category</dt>
        <dd>{book.category}</dd>
        <dt>Publisher</dt>
        <dd>{book.publisher}</dd>
      </dl>
    </section>
  );
}

function AvailabilityCard({ summary }: { summary: AvailabilitySummary }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Availability Summary</h2>
      <div className={styles.counts}>
        <Count value={summary.totalCopies} label="Total copies" />
        <Count value={summary.availableCopies} label="Available" />
        <Count value={summary.borrowedCopies} label="Borrowed" />
      </div>
      <div className={styles.nextRow}>
        <span className={styles.nextLabel}>Next available</span>
        <NextAvailableChip summary={summary} />
      </div>
    </section>
  );
}

function Count({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.count}>
      <div className={styles.countValue}>{value}</div>
      <div className={styles.countLabel}>{label}</div>
    </div>
  );
}

// 1 = Now, 2 = DueBack, 3 = Overdue, null = no copies (see types.ts).
// "Due back" rather than "Available on": a due date is when the book should
// come back, not a promise that it will.
function NextAvailableChip({ summary }: { summary: AvailabilitySummary }) {
  const due = summary.earliestDueDate;

  if (summary.nextAvailable === 1) {
    return <span className={`${styles.chip} ${styles.chipOk}`}>Now</span>;
  }
  if (summary.nextAvailable === 2 && due) {
    return (
      <span className={`${styles.chip} ${styles.chipWarn}`}>
        Due back {formatDate(due)}
      </span>
    );
  }
  if (summary.nextAvailable === 3 && due) {
    return (
      <span className={`${styles.chip} ${styles.chipAlert}`}>
        Overdue since {formatDate(due)}
      </span>
    );
  }
  return <span className={`${styles.chip} ${styles.chipQuiet}`}>—</span>;
}

function CopyTable({
  copies,
  onIssue,
  onViewMember,
}: {
  copies: BookCopyItem[];
  onIssue: (copy: BookCopyItem) => void;
  onViewMember: (copy: BookCopyItem) => void;
}) {
  return (
    <section className={`${styles.card} ${styles.tableCard}`}>
      <h2 className={`${styles.cardTitle} ${styles.tableTitle}`}>
        Copy Information
      </h2>

      {copies.length === 0 ? (
        <div className={styles.noCopies}>No copies of this book yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Copy ID</th>
                <th scope="col">Status</th>
                <th scope="col">Borrowed by</th>
                <th scope="col">Due date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {copies.map((copy) => {
                const available = copy.status === "Available";
                return (
                  <tr key={copy.copyId}>
                    <td className={styles.mono}>{copy.copyCode}</td>
                    <td>
                      <span
                        className={
                          available
                            ? `${styles.chip} ${styles.chipOk}`
                            : `${styles.chip} ${styles.chipWarn}`
                        }
                      >
                        {copy.status}
                      </span>
                    </td>
                    <td className={copy.borrowerName ? undefined : styles.dash}>
                      {copy.borrowerName ?? "—"}
                    </td>
                    <td className={copy.dueDate ? styles.mono : styles.dash}>
                      {copy.dueDate ? formatDate(copy.dueDate) : "—"}
                    </td>
                    <td>
                      {available ? (
                        <button
                          className={styles.btn}
                          type="button"
                          onClick={() => onIssue(copy)}
                        >
                          Issue
                        </button>
                      ) : (
                        <button
                          className={styles.btnGhost}
                          type="button"
                          onClick={() => onViewMember(copy)}
                          disabled={copy.memberId === null}
                          title={
                            copy.memberId === null
                              ? "No borrower on record for this copy"
                              : `Open ${copy.borrowerName}'s profile`
                          }
                        >
                          View Member
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
