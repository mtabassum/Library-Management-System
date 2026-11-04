import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { listAllBooks, searchBooks } from "./searchBooksApi";
import type {
  BookSearchField,
  SearchBooksResult,
  SearchCopyItem,
} from "./types";
import { SearchIcon } from "../../../components/icons";
import styles from "./SearchBooksPage.module.css";

const FIELDS: { value: BookSearchField; label: string }[] = [
  { value: "Title", label: "Title" },
  { value: "Author", label: "Author" },
  { value: "Isbn", label: "ISBN" },
];

const DEBOUNCE_MS = 500;
const AUTO_SEARCH_MIN_CHARS = 3;

type Status = "idle" | "loading" | "done" | "error";

interface BookGroup {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  copies: SearchCopyItem[];
}

function groupByBook(copies: SearchCopyItem[]): BookGroup[] {
  const groups = new Map<number, BookGroup>();
  for (const c of copies) {
    let group = groups.get(c.bookId);
    if (!group) {
      group = {
        bookId: c.bookId,
        title: c.title,
        author: c.author,
        isbn: c.isbn,
        category: c.category,
        publisher: c.publisher,
        copies: [],
      };
      groups.set(c.bookId, group);
    }
    group.copies.push(c);
  }
  return [...groups.values()];
}

function formatDue(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SearchBooksPage() {
  const navigate = useNavigate();
  const [field, setField] = useState<BookSearchField>("Title");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [copies, setCopies] = useState<SearchCopyItem[]>([]);
  const [error, setError] = useState("");
  const [resultsFor, setResultsFor] = useState("");

  const fieldLabel = field === "Isbn" ? "ISBN" : field.toLowerCase();
  const groups = groupByBook(copies);
  const showingAll = resultsFor === "";

  const requestIdRef = useRef(0);

  // One place that runs a request and puts the answer on screen. Both the
  // full list and a real search go through here, so they share the race guard.
  const load = useCallback(
    async (query: string, request: () => Promise<SearchBooksResult>) => {
      const requestId = ++requestIdRef.current;
      setStatus("loading");
      setError("");
      try {
        const result = await request();
        if (requestId !== requestIdRef.current) return; // superseded — drop it
        setCopies(result.copies);
        setResultsFor(query);
        setStatus("done");
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [],
  );

  const performSearch = useCallback(
    (searchField: BookSearchField, query: string) =>
      load(query, () => searchBooks(searchField, query)),
    [load],
  );

  const showAllBooks = useCallback(() => load("", listAllBooks), [load]);

  // Search button / Enter. An empty box means "show me everything".
  function runSearch() {
    const query = text.trim();
    if (query) performSearch(field, query);
    else showAllBooks();
  }

  // Show every book when the page opens (the box starts empty), and again
  // whenever the librarian clears the box. `isEmpty` only flips between
  // true and false, so typing more letters does not re-run this.
  const isEmpty = text.trim() === "";
  useEffect(() => {
    if (isEmpty) showAllBooks();
  }, [isEmpty, showAllBooks]);

  // Auto-search: fire DEBOUNCE_MS after the user stops typing. The cleanup
  // clears the pending timer on every keystroke, so only the pause fires it.
  useEffect(() => {
    const query = text.trim();

    if (field === "Isbn" || query.length < AUTO_SEARCH_MIN_CHARS) return;

    const timer = setTimeout(() => performSearch(field, query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, field, performSearch]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") runSearch();
  }

  function onIssue(copy: SearchCopyItem) {
    navigate("/issue", {
      state: {
        copyId: copy.copyId,
        copyCode: copy.copyCode,
        title: copy.title,
        author: copy.author,
        isbn: copy.isbn,
        status: copy.status,
      },
    });
  }

  // A borrowed copy names its borrower, so this row is a way into that member's
  // profile. Nothing rides along in route state: the id is in the URL, so the
  // page survives a refresh and the link can be shared.
  function onViewBorrower(copy: SearchCopyItem) {
    if (copy.memberId === null) return;
    navigate(`/members/${copy.memberId}`);
  }

  return (
    <>
      <h1 className={styles.title}>Search books</h1>
      <p className={styles.intro}>
        Find a title by name, author, or ISBN, and see every copy and who has
        it.
      </p>

      <div className={styles.searchBar}>
        <div className={styles.segmented}>
          {FIELDS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={
                field === f.value
                  ? `${styles.segBtn} ${styles.segOn}`
                  : styles.segBtn
              }
              onClick={() => setField(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className={styles.input}>
          <SearchIcon />
          <input
            className={styles.inputField}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Search by ${fieldLabel}\u2026`}
            aria-label="Search text"
          />
        </label>

        <button
          className={styles.btn}
          type="button"
          onClick={runSearch}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Searching\u2026" : "Search"}
        </button>
      </div>

      {status === "loading" && (
        <div className={styles.state}>
          <div className={styles.spinner} />
          <div className={styles.stateHead}>
            {isEmpty ? "Loading books" : "Searching"}&hellip;
          </div>
        </div>
      )}

      {status === "error" && (
        <div className={styles.state}>
          <div className={styles.stateHead}>Couldn't run the search</div>
          <div className={styles.stateBody}>
            {error} — check the API is running, then try again.
          </div>
        </div>
      )}

      {status === "done" && groups.length === 0 && showingAll && (
        <div className={styles.state}>
          <SearchIcon />
          <div className={styles.stateHead}>No books in the library yet</div>
          <div className={styles.stateBody}>
            Books will show up here once they are added.
          </div>
        </div>
      )}

      {status === "done" && groups.length === 0 && !showingAll && (
        <div className={styles.state}>
          <SearchIcon />
          <div className={styles.stateHead}>
            No books match &ldquo;{resultsFor}&rdquo;
          </div>
          <div className={styles.stateBody}>
            Try a different {fieldLabel}, or switch the search type.
          </div>
        </div>
      )}

      {status === "done" && groups.length > 0 && (
        <>
          <div className={styles.resultMeta}>
            {groups.length} {groups.length === 1 ? "book" : "books"}
            {showingAll ? " in the library" : " found"}
            {" \u00b7 "}
            {copies.length} {copies.length === 1 ? "copy" : "copies"}
          </div>
          <div className={styles.results}>
            {groups.map((g) => (
              <BookGroupCard
                key={g.bookId}
                group={g}
                onIssue={onIssue}
                onViewBorrower={onViewBorrower}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function BookGroupCard({
  group,
  onIssue,
  onViewBorrower,
}: {
  group: BookGroup;
  onIssue: (copy: SearchCopyItem) => void;
  onViewBorrower: (copy: SearchCopyItem) => void;
}) {
  const total = group.copies.length;
  const available = group.copies.filter((c) => c.status === "Available").length;
  const free = available > 0;

  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <div className={styles.bookMain}>
          <div className={styles.bookTitle}>{group.title}</div>
          <div className={styles.bookAuthor}>{group.author}</div>
          <div className={styles.bookFacts}>
            <div>
              <div className={styles.factLabel}>ISBN</div>
              <div className={styles.factValue}>{group.isbn}</div>
            </div>
            <div>
              <div className={styles.factLabel}>Category</div>
              <div className={styles.factValue}>{group.category}</div>
            </div>
            <div>
              <div className={styles.factLabel}>Publisher</div>
              <div className={styles.factValue}>{group.publisher}</div>
            </div>
          </div>
        </div>
        <div className={styles.avail}>
          <span
            className={
              free
                ? `${styles.badge} ${styles.badgeOk}`
                : `${styles.badge} ${styles.badgeNone}`
            }
          >
            <span className={styles.dot} />
            {free ? `${available} of ${total} available` : "None available"}
          </span>
          <div className={styles.availSub}>
            {total} {total === 1 ? "copy" : "copies"} total
          </div>
        </div>
      </div>

      <div className={styles.copyList}>
        {group.copies.map((c) => (
          <CopyRow
            key={c.copyId}
            copy={c}
            onIssue={onIssue}
            onViewBorrower={onViewBorrower}
          />
        ))}
      </div>
    </div>
  );
}

function CopyRow({
  copy,
  onIssue,
  onViewBorrower,
}: {
  copy: SearchCopyItem;
  onIssue: (copy: SearchCopyItem) => void;
  onViewBorrower: (copy: SearchCopyItem) => void;
}) {
  const available = copy.status === "Available";
  return (
    <div className={styles.copyRow}>
      <span className={styles.copyCode}>{copy.copyCode}</span>

      <span
        className={
          available
            ? `${styles.pill} ${styles.pillOk}`
            : `${styles.pill} ${styles.pillOut}`
        }
      >
        <span className={styles.dot} />
        {copy.status}
      </span>

      <span className={styles.borrower}>
        {available ? (
          <span className={styles.dash}>&mdash;</span>
        ) : (
          <>
            <span className={styles.borrowerName}>{copy.borrowerName}</span>
            {copy.dueDate && (
              <span className={styles.due}>Due {formatDue(copy.dueDate)}</span>
            )}
          </>
        )}
      </span>

      {available ? (
        <button
          className={styles.issueBtn}
          type="button"
          onClick={() => onIssue(copy)}
        >
          Issue
        </button>
      ) : (
        <button
          className={styles.detailsBtn}
          type="button"
          onClick={() => onViewBorrower(copy)}
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
    </div>
  );
}
