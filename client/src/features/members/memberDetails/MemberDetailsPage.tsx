import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findMembers, getMemberDetails } from "./memberDetailsApi";
import type {
  CurrentBorrowing,
  HistoryEntry,
  MemberDetailsResult,
  MemberProfile,
  MemberSearchField,
  MemberSearchItem,
  MemberStatus,
} from "./types";
import { SearchIcon } from "../../../components/icons";
import styles from "./MemberDetailsPage.module.css";

type LoadState = "idle" | "loading" | "done" | "error";
type Tab = "current" | "history";

const FIELDS: { value: MemberSearchField; label: string }[] = [
  { value: "Code", label: "Member ID" },
  { value: "Phone", label: "Phone" },
  { value: "Name", label: "Name" },
];

// A one- or two-letter name search matches almost everyone and gives the
// librarian a list they can't use, so we ask for more before calling the API.
const MIN_NAME_LENGTH = 3;

const STATUS_LABELS: Record<MemberStatus, string> = {
  1: "Active",
  2: "Inactive",
  3: "Deactivated",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemberDetailsPage() {
  // memberId is optional: this component is registered at both /members and
  // /members/:memberId. No id means "nobody picked yet" -- show the lookup
  // alone. An id means "load that member".
  const { memberId } = useParams<{ memberId?: string }>();
  const navigate = useNavigate();

  // --- lookup state ---
  const [field, setField] = useState<MemberSearchField>("Code");
  const [term, setTerm] = useState("");
  const [searchState, setSearchState] = useState<LoadState>("idle");
  const [matches, setMatches] = useState<MemberSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchHint, setSearchHint] = useState("");

  // --- details state ---
  const [detailsState, setDetailsState] = useState<LoadState>("idle");
  const [detailsError, setDetailsError] = useState("");
  const [details, setDetails] = useState<MemberDetailsResult | null>(null);
  const [tab, setTab] = useState<Tab>("current");

  // Reads the id from the URL rather than page state, so a refresh or a pasted
  // link still works. Runs again whenever the librarian opens another member.
  useEffect(() => {
    if (memberId === undefined) {
      setDetails(null);
      setDetailsError("");
      setDetailsState("idle");
      return;
    }

    const id = Number(memberId);

    if (!Number.isInteger(id) || id <= 0) {
      setDetails(null);
      setDetailsError(
        "That member link isn't valid. Search for the member instead.",
      );
      setDetailsState("error");
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setDetailsState("loading");
      setDetailsError("");

      try {
        const result = await getMemberDetails(id);
        if (cancelled) return;
        setDetails(result);
        setTab("current");
        setDetailsState("done");
      } catch {
        if (cancelled) return;
        setDetails(null);
        setDetailsError(
          "We couldn't load this member. They may no longer exist.",
        );
        setDetailsState("error");
      }
    }

    void load();

    // Guards against a slow response for a member the librarian has left.
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  // Ignores the answer to a search the librarian has already replaced.
  const requestRef = useRef(0);

  async function runSearch(): Promise<void> {
    const query = term.trim();
    if (!query) return;

    // Only names are this loose. A code or a phone number is precise enough
    // that three characters is a real search.
    if (field === "Name" && query.length < MIN_NAME_LENGTH) {
      setSearchHint(`Enter at least ${MIN_NAME_LENGTH} letters of the name.`);
      setMatches([]);
      setSearchState("idle");
      return;
    }

    setSearchHint("");
    if (memberId !== undefined) navigate("/members");
    const ticket = ++requestRef.current;
    setSearchState("loading");
    setSearchError("");

    try {
      const result = await findMembers(field, query, 0);
      if (ticket !== requestRef.current) return;

      // total, not members.length -- one match across the whole result set is
      // what makes it a non-choice, and on page 0 those happen to be the same.
      const only = result.total === 1 ? result.members[0] : undefined;

      if (only) {
        // Exactly one match is not a choice -- open it.
        resetSearch();
        navigate(`/members/${only.id}`);
        return;
      }

      setMatches(result.members);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(0);
      setSearchState("done");
    } catch (e) {
      if (ticket !== requestRef.current) return;
      setSearchError(e instanceof Error ? e.message : "Something went wrong.");
      setSearchState("error");
    }
  }

  // Switching search type starts a fresh search. Text typed for one type
  // (a name) is almost never valid for another (a phone number), so we
  // clear the box and any results that came from the old type.
  function changeField(next: MemberSearchField): void {
    if (next === field) return;

    setField(next);
    setTerm("");
    setSearchError("");
    setSearchHint("");
    resetSearch();

    // Take a new ticket so an old search that is still running gets ignored
    // when its answer arrives.
    requestRef.current++;
  }

  // Fetches the next page and appends it. It deliberately does NOT take a new
  // ticket: this is a continuation of the search that is already on screen, so
  // it should be discarded if a fresh search has started, never the other way
  // round.
  async function loadMore(): Promise<void> {
    const query = term.trim();
    if (!query || loadingMore) return;

    const ticket = requestRef.current;
    const next = page + 1;
    setLoadingMore(true);

    try {
      const result = await findMembers(field, query, next);
      if (ticket !== requestRef.current) return;

      setMatches((previous) => [...previous, ...result.members]);
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

  function resetSearch(): void {
    setMatches([]);
    setTotal(0);
    setHasMore(false);
    setPage(0);
    setSearchState("idle");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") void runSearch();
  }

  function openMember(member: MemberSearchItem): void {
    resetSearch();
    navigate(`/members/${member.id}`);
  }

  // Flow 4: hand the Return screen the copy code and who we came from, so it can
  // run its own lookup and offer a way back here afterwards.
  function returnCopy(borrowing: CurrentBorrowing): void {
    navigate("/return", {
      state: {
        copyCode: borrowing.copyCode,
        member: details
          ? { id: details.member.id, name: details.member.name }
          : undefined,
      },
    });
  }

  const showMatches = matches.length > 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Member Details</h1>
      <p className={styles.intro}>
        View member information, currently borrowed books, and borrowing
        history.
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
              onClick={() => {
                changeField(f.value);
              }}
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
              field === "Name"
                ? `Enter at least ${MIN_NAME_LENGTH} letters of a name\u2026`
                : field === "Phone"
                  ? "Enter a phone number\u2026"
                  : "Enter a member ID\u2026"
            }
            aria-label="Search text"
          />
        </label>

        <button
          className={styles.lookupBtn}
          type="button"
          onClick={() => void runSearch()}
          disabled={searchState === "loading"}
        >
          {searchState === "loading" ? "Searching\u2026" : "Search Member"}
        </button>
      </div>

      {searchHint && (
        <div className={`${styles.notice} ${styles.noticeHint}`}>
          {searchHint}
        </div>
      )}

      {searchState === "error" && (
        <div className={`${styles.notice} ${styles.noticeAlert}`}>
          {searchError} — check the API is running, then try again.
        </div>
      )}

      {searchState === "done" && matches.length === 0 && (
        <div className={styles.empty}>
          No member matches &ldquo;{term.trim()}&rdquo;. Try another search
          type.
        </div>
      )}

      {showMatches && (
        <MatchList
          items={matches}
          total={total}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onPick={openMember}
          onLoadMore={loadMore}
        />
      )}

      {!showMatches &&
        !searchHint &&
        searchState === "idle" &&
        detailsState === "idle" && (
          <div className={styles.empty}>
            Search for a member to see their profile, current books and history.
          </div>
        )}

      {!showMatches && detailsState === "loading" && (
        <div className={styles.notice}>Loading member…</div>
      )}

      {!showMatches && detailsState === "error" && detailsError && (
        <div className={`${styles.notice} ${styles.noticeAlert}`}>
          {detailsError}
        </div>
      )}

      {!showMatches && detailsState === "done" && details && (
        <>
          <ProfileCard member={details.member} />

          <div className={styles.tiles}>
            <Tile
              count={details.borrowing.currentlyBorrowed}
              label="Currently borrowed"
            />
            <Tile
              count={details.borrowing.overdue}
              label="Overdue"
              alert={details.borrowing.overdue > 0}
            />
            <Tile
              count={details.borrowing.totalBorrowed}
              label="Borrowed all time"
            />
          </div>

          <div
            className={styles.segmented}
            role="tablist"
            aria-label="Borrowing"
          >
            <button
              className={
                tab === "current"
                  ? `${styles.segBtn} ${styles.segBtnOn}`
                  : styles.segBtn
              }
              type="button"
              role="tab"
              aria-selected={tab === "current"}
              onClick={() => setTab("current")}
            >
              Currently borrowed{" "}
              <span className={styles.tally}>
                {details.currentlyBorrowed.length}
              </span>
            </button>
            <button
              className={
                tab === "history"
                  ? `${styles.segBtn} ${styles.segBtnOn}`
                  : styles.segBtn
              }
              type="button"
              role="tab"
              aria-selected={tab === "history"}
              onClick={() => setTab("history")}
            >
              History{" "}
              <span className={styles.tally}>{details.history.length}</span>
            </button>
          </div>

          {tab === "current" ? (
            <CurrentPanel
              items={details.currentlyBorrowed}
              onReturn={returnCopy}
            />
          ) : (
            <HistoryPanel items={details.history} />
          )}
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
  items: MemberSearchItem[];
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onPick: (member: MemberSearchItem) => void;
  onLoadMore: () => void;
}) {
  const showingAll = items.length >= total;

  return (
    <>
      <div className={styles.resultMeta}>
        {showingAll
          ? `${total} ${total === 1 ? "member" : "members"} match — pick one`
          : `Showing ${items.length} of ${total} members — pick one, or add more letters to narrow the search`}
      </div>
      <div className={styles.matchList}>
        {items.map((member) => (
          <button
            key={member.id}
            type="button"
            className={styles.matchRow}
            onClick={() => onPick(member)}
          >
            <span className={styles.matchBody}>
              <span className={styles.matchName}>{member.name}</span>
              <span className={styles.matchSub}>
                <span className={styles.mono}>{member.memberCode}</span>
                {" \u00b7 "}
                {member.phone}
                {" \u00b7 "}
                {STATUS_LABELS[member.status]}
              </span>
            </span>
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
            {loadingMore ? "Loading\u2026" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}

function ProfileCard({ member }: { member: MemberProfile }) {
  return (
    <section className={styles.profile}>
      <div className={styles.profileTop}>
        <h2 className={styles.name}>{member.name}</h2>
        <span className={styles.code}>{member.memberCode}</span>
        <span
          className={
            member.status === 1
              ? `${styles.statusPill} ${styles.statusOk}`
              : `${styles.statusPill} ${styles.statusOff}`
          }
        >
          {STATUS_LABELS[member.status]}
        </span>
      </div>
      <div className={styles.facts}>
        <Fact label="Phone" value={member.phone} mono />
        <Fact label="Address" value={member.address} />
      </div>
    </section>
  );
}

function CurrentPanel({
  items,
  onReturn,
}: {
  items: CurrentBorrowing[];
  onReturn: (borrowing: CurrentBorrowing) => void;
}) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        This member has no books out right now.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article
          key={item.borrowRecordId}
          className={
            item.isOverdue ? `${styles.row} ${styles.rowLate}` : styles.row
          }
        >
          <div className={styles.rowBody}>
            <h2 className={styles.rowTitle}>{item.title}</h2>
            <div className={styles.rowByline}>{item.author}</div>
            <div className={styles.meta}>
              <span className={styles.mono}>{item.copyCode}</span>
              <span>Issued {formatDate(item.issueDate)}</span>
              <span>Due {formatDate(item.dueDate)}</span>
              {item.isOverdue && (
                <span className={`${styles.flag} ${styles.flagAlert}`}>
                  Overdue by {item.daysOverdue}{" "}
                  {item.daysOverdue === 1 ? "day" : "days"}
                </span>
              )}
            </div>
          </div>
          <button
            className={styles.btn}
            type="button"
            onClick={() => onReturn(item)}
          >
            Return this copy
          </button>
        </article>
      ))}
    </div>
  );
}

function HistoryPanel({ items }: { items: HistoryEntry[] }) {
  if (items.length === 0) {
    return <div className={styles.empty}>Nothing returned yet.</div>;
  }

  return (
    <table className={styles.ledger}>
      <thead>
        <tr>
          <th scope="col">Book</th>
          <th scope="col">Issued</th>
          <th scope="col">Due</th>
          <th scope="col">Returned</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.borrowRecordId}>
            <td>
              <div className={styles.ledgerTitle}>{item.title}</div>
              <div className={styles.ledgerSub}>
                {item.author} ·{" "}
                <span className={styles.mono}>{item.copyCode}</span>
              </div>
            </td>
            <td>{formatDate(item.issueDate)}</td>
            <td>{formatDate(item.dueDate)}</td>
            <td>
              {formatDate(item.returnDate)}{" "}
              {item.wasReturnedLate ? (
                <span className={`${styles.flag} ${styles.flagAlert}`}>
                  Late
                </span>
              ) : (
                <span className={`${styles.flag} ${styles.flagQuiet}`}>
                  On time
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Tile({
  count,
  label,
  alert,
}: {
  count: number;
  label: string;
  alert?: boolean;
}) {
  return (
    <div className={alert ? `${styles.tile} ${styles.tileAlert}` : styles.tile}>
      <div className={styles.tileCount}>{count}</div>
      <div className={styles.tileLabel}>{label}</div>
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
