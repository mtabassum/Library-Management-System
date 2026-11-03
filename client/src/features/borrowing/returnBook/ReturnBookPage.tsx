import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { findActiveBorrowings, returnBook } from "./returnBookApi";
import type {
  BorrowingLookupField,
  ActiveBorrowingItem,
  ReturnBookResult,
  ReturnNavState,
} from "./types";
import { SearchIcon, CheckIcon } from "../../../components/icons";
import styles from "./ReturnBookPage.module.css";

const FIELDS: { value: BorrowingLookupField; label: string }[] = [
  { value: "CopyCode", label: "Copy code" },
  { value: "Isbn", label: "ISBN" },
];

type Status = "idle" | "loading" | "done" | "error";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// > 0 means overdue by that many days; <= 0 means on time.
function overdueDays(dueIso: string): number {
  const due = new Date(dueIso);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - due.getTime()) / 86400000);
}

export default function ReturnBookPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Router state is typed as unknown, so we narrow it once here. Arriving from
  // the sidebar leaves this null; arriving from a member profile fills it in.
  const navState = (location.state ?? null) as ReturnNavState | null;
  const fromMember = navState?.member ?? null;

  const [field, setField] = useState<BorrowingLookupField>("CopyCode");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [borrowings, setBorrowings] = useState<ActiveBorrowingItem[]>([]);
  const [selected, setSelected] = useState<ActiveBorrowingItem | null>(null);
  const [summary, setSummary] = useState<ReturnBookResult | null>(null);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState("");
  const [returnError, setReturnError] = useState("");

  async function runLookup(
    lookupField: BorrowingLookupField,
    rawTerm: string,
  ): Promise<void> {
    const query = rawTerm.trim();
    if (!query) return;
    setStatus("loading");
    setError("");
    setReturnError("");
    setSummary(null);
    setSelected(null);
    try {
      const result = await findActiveBorrowings(lookupField, query);
      setBorrowings(result.borrowings);

      setSelected(result.borrowings.length === 1 ? result.borrowings[0] : null);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  // Flow 4: the librarian already picked the copy on the member's profile, so
  // the lookup runs itself instead of asking them to retype the code. The ref
  // makes it happen once, not on every re-render.
  const prefilled = useRef(false);

  useEffect(() => {
    const code = navState?.copyCode;
    if (!code || prefilled.current) return;
    prefilled.current = true;
    setField("CopyCode");
    setTerm(code);
    void runLookup("CopyCode", code);
    // runLookup only reads its arguments, so it is safe to leave out here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.copyCode]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void runLookup(field, term);
  }

  async function confirmReturn(item: ActiveBorrowingItem) {
    setReturning(true);
    setReturnError("");
    try {
      const result = await returnBook({ bookCopyId: item.bookCopyId });
      setSummary(result);
    } catch (e) {
      setReturnError(
        e instanceof Error ? e.message : "Couldn't return this copy.",
      );
    } finally {
      setReturning(false);
    }
  }

  function goBack() {
    if (borrowings.length > 1) {
      setSelected(null);
      setReturnError("");
    } else {
      reset();
    }
  }

  function reset() {
    setStatus("idle");
    setTerm("");
    setBorrowings([]);
    setSelected(null);
    setSummary(null);
    setError("");
    setReturnError("");
  }

  function backToMember() {
    if (fromMember) navigate(`/members/${fromMember.id}`);
  }

  const placeholder =
    field === "Isbn" ? "Enter an ISBN\u2026" : "Enter a copy code\u2026";
  const fieldLabel = field === "Isbn" ? "ISBN" : "copy code";

  return (
    <>
      <h1 className={styles.title}>Return book</h1>
      <p className={styles.intro}>
        Look up a borrowed copy by its code or ISBN, check the details, then
        confirm the return to make the copy available again.
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
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Lookup term"
          />
        </label>

        <button
          className={styles.btn}
          type="button"
          onClick={() => void runLookup(field, term)}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Finding\u2026" : "Find"}
        </button>
      </div>

      {summary && selected && (
        <SummaryPanel
          item={selected}
          result={summary}
          member={fromMember}
          onReset={reset}
          onBackToMember={backToMember}
        />
      )}

      {!summary && status === "idle" && (
        <div className={styles.state}>
          <SearchIcon />
          <div className={styles.stateHead}>Find a copy to return</div>
          <div className={styles.stateBody}>
            Pick copy code or ISBN, enter it, and press Find.
          </div>
        </div>
      )}

      {!summary && status === "loading" && (
        <div className={styles.state}>
          <div className={styles.spinner} />
          <div className={styles.stateHead}>Finding&hellip;</div>
        </div>
      )}

      {!summary && status === "error" && (
        <div className={styles.state}>
          <div className={styles.stateHead}>Couldn't run the lookup</div>
          <div className={styles.stateBody}>
            {error} — check the API is running, then try again.
          </div>
        </div>
      )}

      {!summary && status === "done" && borrowings.length === 0 && (
        <div className={styles.state}>
          <SearchIcon />
          <div className={styles.stateHead}>
            No borrowed copy matches &ldquo;{term.trim()}&rdquo;
          </div>
          <div className={styles.stateBody}>
            Only copies that are currently out can be returned. Check the{" "}
            {fieldLabel}, or switch the lookup type.
          </div>
        </div>
      )}

      {!summary && status === "done" && borrowings.length > 0 && !selected && (
        <MatchList items={borrowings} onPick={setSelected} />
      )}

      {!summary && status === "done" && selected && (
        <DetailCard
          item={selected}
          fromList={borrowings.length > 1}
          returning={returning}
          returnError={returnError}
          onConfirm={confirmReturn}
          onBack={goBack}
        />
      )}
    </>
  );
}

function MatchList({
  items,
  onPick,
}: {
  items: ActiveBorrowingItem[];
  onPick: (item: ActiveBorrowingItem) => void;
}) {
  return (
    <>
      <div className={styles.resultMeta}>
        {items.length} borrowed copies of this book — pick the one being
        returned
      </div>
      <div className={styles.matchList}>
        {items.map((item) => {
          const over = overdueDays(item.dueDate) > 0;
          return (
            <button
              key={item.bookCopyId}
              type="button"
              className={styles.matchRow}
              onClick={() => onPick(item)}
            >
              <span className={styles.matchMain}>
                <span className={styles.matchCode}>{item.copyCode}</span>
                <span className={styles.matchSub}>
                  {item.borrowerName}
                  {" \u00b7 due "}
                  {formatDate(item.dueDate)}
                  {over && (
                    <span className={styles.overdueTag}> · Overdue</span>
                  )}
                </span>
              </span>
              <ChevronIcon />
            </button>
          );
        })}
      </div>
    </>
  );
}

function DetailCard({
  item,
  fromList,
  returning,
  returnError,
  onConfirm,
  onBack,
}: {
  item: ActiveBorrowingItem;
  fromList: boolean;
  returning: boolean;
  returnError: string;
  onConfirm: (item: ActiveBorrowingItem) => void;
  onBack: () => void;
}) {
  const over = overdueDays(item.dueDate);
  const isOverdue = over > 0;

  return (
    <>
      <div className={styles.resultMeta}>Confirm the return</div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Borrowed copy
          {isOverdue ? (
            <span className={`${styles.badge} ${styles.badgeAlert}`}>
              <span className={styles.dot} />
              Overdue by {over} {over === 1 ? "day" : "days"}
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeOk}`}>
              <span className={styles.dot} />
              On time
            </span>
          )}
        </div>

        <div className={styles.split}>
          <div className={styles.facts}>
            <Fact label="Title" value={item.title} />
            <Fact label="Author" value={item.author} />
            <Fact label="ISBN" value={item.isbn} mono />
            <Fact label="Copy" value={item.copyCode} mono />
          </div>
          <div className={styles.facts}>
            <Fact label="Borrower" value={item.borrowerName} />
            <Fact label="Member ID" value={String(item.memberCode)} mono />
            <Fact label="Issued" value={formatDate(item.issueDate)} />
            <Fact label="Due" value={formatDate(item.dueDate)} />
          </div>
        </div>

        {returnError && (
          <div className={`${styles.notice} ${styles.noticeAlert}`}>
            {returnError}
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.btn}
            type="button"
            onClick={() => onConfirm(item)}
            disabled={returning}
          >
            {returning ? "Returning\u2026" : "Confirm return"}
          </button>
          <button
            className={styles.btnGhost}
            type="button"
            onClick={onBack}
            disabled={returning}
          >
            {fromList ? "Back to matches" : "Cancel"}
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryPanel({
  item,
  result,
  member,
  onReset,
  onBackToMember,
}: {
  item: ActiveBorrowingItem;
  result: ReturnBookResult;
  member: { id: number; name: string } | null;
  onReset: () => void;
  onBackToMember: () => void;
}) {
  return (
    <div className={styles.summary}>
      <div className={styles.summaryHead}>
        <CheckIcon />
        Book returned
      </div>
      <div className={styles.summaryBody}>
        <div className={styles.facts}>
          <Fact label="Book" value={item.title} />
          <Fact label="Copy" value={result.copyCode} mono />
          <Fact label="Returned by" value={item.borrowerName} />
          <Fact label="Return date" value={formatDate(result.returnDate)} />
          <div className={styles.fact}>
            <span className={styles.factLabel}>New status</span>
            <span className={`${styles.badge} ${styles.badgeOk}`}>
              <span className={styles.dot} />
              Available
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {member && (
            <button
              className={styles.btn}
              type="button"
              onClick={onBackToMember}
            >
              {`Back to ${member.name}'s profile`}
            </button>
          )}
          <button className={styles.btnGhost} type="button" onClick={onReset}>
            Return another
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span
        className={
          mono ? `${styles.factValue} ${styles.mono}` : styles.factValue
        }
      >
        {value}
      </span>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className={styles.chev}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
