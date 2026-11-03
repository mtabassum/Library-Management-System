import { useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { findMembers, issueBook } from "./issueBookApi";
import type { MemberItem, MemberSearchType, IssueBookResult } from "./types";
import styles from "./IssueBookPage.module.css";

const SEARCH_ROUTE = "/search";

const SEARCH_FIELDS: { value: MemberSearchType; label: string }[] = [
  { value: "Code", label: "Member code" },
  { value: "Phone", label: "Phone" },
];

type MemberState = "idle" | "searching" | "done" | "error";

interface SelectedCopy {
  id: number; // BookCopy.Id — the integer the API needs
  code: string; // CopyCode, e.g. BC-0024-01
  title: string | null;
  author: string | null;
  isbn: string | null;
  status: string | null;
}

function plusDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function shortDate(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export default function IssueBookPage() {
  const location = useLocation();
  const incoming = (location.state ?? {}) as {
    copyId?: number;
    copyCode?: string;
    title?: string;
    author?: string;
    isbn?: string;
    status?: string;
  };

  // Read the picked copy from navigation state once, on first render.
  const [copy, setCopy] = useState<SelectedCopy | null>(
    incoming.copyId != null
      ? {
          id: incoming.copyId,
          code: incoming.copyCode ?? `#${incoming.copyId}`,
          title: incoming.title ?? null,
          author: incoming.author ?? null,
          isbn: incoming.isbn ?? null,
          status: incoming.status ?? null,
        }
      : null,
  );

  const [searchType, setSearchType] = useState<MemberSearchType>("Code");
  const [term, setTerm] = useState("");
  const [memberState, setMemberState] = useState<MemberState>("idle");
  const [matches, setMatches] = useState<MemberItem[]>([]);
  const [selected, setSelected] = useState<MemberItem | null>(null);
  const [memberError, setMemberError] = useState("");

  const [dueDate, setDueDate] = useState(plusDaysISO(14));
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issued, setIssued] = useState<IssueBookResult | null>(null);

  const eligible = selected?.status === "Active";
  const canIssue = !!copy && !!selected && eligible;

  async function search() {
    const value = term.trim();
    if (!value) return;
    setMemberState("searching");
    setMemberError("");
    setSelected(null);
    setMatches([]);
    setIssueError("");
    try {
      const found = await findMembers(searchType, value);
      setMatches(found);
      if (found.length === 1) setSelected(found[0]);
      if (found.length === 0) {
        setMemberError(
          `No member found for that ${searchType === "Code" ? "member code" : "phone number"}.`,
        );
      }
      setMemberState("done");
    } catch (e) {
      setMemberError(e instanceof Error ? e.message : "Search failed.");
      setMemberState("error");
    }
  }

  function onTermKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") search();
  }

  function changeSearchType(value: MemberSearchType) {
    setSearchType(value);
    setTerm("");
    setMatches([]);
    setSelected(null);
    setMemberError("");
    setMemberState("idle");
  }

  async function confirmIssue() {
    if (!copy || !selected || !canIssue) return;
    setIssuing(true);
    setIssueError("");
    try {
      const result = await issueBook({
        bookCopyId: copy.id,
        memberId: selected.id,
        dueDate: dueDate || null,
      });
      setIssued(result);
    } catch (e) {
      setIssueError(e instanceof Error ? e.message : "Issue failed.");
    } finally {
      setIssuing(false);
    }
  }

  function reset() {
    setIssued(null);
    setCopy(null);
    setTerm("");
    setMatches([]);
    setSelected(null);
    setMemberError("");
    setDueDate(plusDaysISO(14));
    setIssueError("");
  }

  return (
    <>
      <h1 className={styles.title}>Issue a book</h1>
      <p className={styles.intro}>
        Confirm the copy, find the member, set the due date, and issue.
      </p>

      {!copy ? (
        <div className={styles.empty}>
          <div className={styles.emptyIco}>
            <BookIcon />
          </div>
          <h2 className={styles.emptyTitle}>No copy selected</h2>
          <p className={styles.emptyText}>
            Issuing starts from the Search screen. Find a book, then choose
            &ldquo;Issue&rdquo; on an available copy to bring it here.
          </p>
          <Link to={SEARCH_ROUTE} className={styles.emptyBtn}>
            Go to Search books
          </Link>
        </div>
      ) : (
        <>
          {/* Selected copy — read-only; chosen on the Search screen */}
          <section className={styles.step}>
            <div className={styles.stepLabel}>Selected copy</div>
            <div className={styles.panel}>
              <div className={styles.copyCard}>
                <div className={styles.copyIco}>
                  <BookIcon />
                </div>
                <div className={styles.copyMain}>
                  <div className={styles.copyHead}>
                    <span className={styles.copyTitleText}>
                      {copy.title ?? copy.code}
                    </span>
                    {copy.status && (
                      <span className={`${styles.badge} ${styles.badgeOk}`}>
                        <span className={styles.dot} />
                        {copy.status}
                      </span>
                    )}
                  </div>
                  {copy.author && (
                    <div className={styles.copySub}>{copy.author}</div>
                  )}
                  <div className={styles.copyFacts}>
                    <div>
                      <span className={styles.factK}>Copy</span>
                      <span className={styles.factV}>{copy.code}</span>
                    </div>
                    {copy.isbn && (
                      <div>
                        <span className={styles.factK}>ISBN</span>
                        <span className={styles.factV}>{copy.isbn}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Member */}
          <section className={styles.step}>
            <div className={styles.stepLabel}>Member</div>
            <div className={styles.panel}>
              <div className={styles.row}>
                <div className={styles.segmented}>
                  {SEARCH_FIELDS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      className={
                        searchType === f.value
                          ? `${styles.segBtn} ${styles.segOn}`
                          : styles.segBtn
                      }
                      onClick={() => changeSearchType(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <label className={styles.field}>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={onTermKeyDown}
                    placeholder={
                      searchType === "Code"
                        ? "Enter member code (e.g. M-0031)"
                        : "Enter phone number"
                    }
                    aria-label="Member lookup"
                  />
                </label>
                <button
                  className={styles.btn}
                  type="button"
                  onClick={search}
                  disabled={memberState === "searching"}
                >
                  {memberState === "searching"
                    ? "Finding\u2026"
                    : "Find member"}
                </button>
              </div>

              {selected && (
                <MemberCard
                  member={selected}
                  onClear={() => setSelected(null)}
                  showClear={matches.length > 1}
                />
              )}

              {!selected && matches.length > 1 && (
                <div className={styles.matchList}>
                  <div className={styles.matchHint}>
                    {matches.length} members matched — pick one:
                  </div>
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={styles.matchRow}
                      onClick={() => setSelected(m)}
                    >
                      <span className={styles.matchName}>{m.name}</span>
                      <span className={styles.matchMeta}>
                        {m.memberCode} &middot; {m.phone}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {memberError && (
                <div className={styles.inlineNote}>{memberError}</div>
              )}
            </div>
          </section>

          {/* Due date */}
          <section className={styles.step}>
            <div className={styles.stepLabel}>Due date</div>
            <div className={styles.panel}>
              <label className={styles.field} style={{ maxWidth: 220 }}>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-label="Due date"
                />
              </label>
              <div className={styles.helper}>
                Defaults to 14 days from today
              </div>
            </div>
          </section>

          {issueError && <div className={styles.issueError}>{issueError}</div>}

          <div className={styles.confirmBar}>
            <button
              className={styles.btn}
              type="button"
              onClick={confirmIssue}
              disabled={!canIssue || issuing}
            >
              {issuing ? "Issuing\u2026" : "Confirm issue"}
            </button>
            <span className={styles.confirmHint}>
              {canIssue
                ? `Ready to issue ${copy.code} to ${selected!.name}.`
                : "Find an active member to continue."}
            </span>
          </div>
        </>
      )}

      {issued && (
        <SummaryModal
          result={issued}
          memberName={selected?.name ?? `#${issued.memberCode}`}
          copyCode={copy?.code ?? `#${issued.bookCopyId}`}
          bookTitle={copy?.title ?? null}
          onDone={reset}
        />
      )}
    </>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function MemberCard({
  member,
  onClear,
  showClear,
}: {
  member: MemberItem;
  onClear: () => void;
  showClear: boolean;
}) {
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const badgeClass =
    member.status === "Active"
      ? `${styles.badge} ${styles.badgeOk}`
      : member.status === "Inactive"
        ? `${styles.badge} ${styles.badgeNeutral}`
        : `${styles.badge} ${styles.badgeWarn}`;
  return (
    <>
      <div className={styles.member}>
        <div className={styles.mAvatar}>{initials}</div>
        <div className={styles.mMain}>
          <div className={styles.mName}>{member.name}</div>
          <div className={styles.mSub}>
            {member.memberCode} &middot; {member.phone}
          </div>
          {member.address && (
            <div className={styles.mAddr}>{member.address}</div>
          )}
        </div>
        <div className={styles.mRight}>
          <span className={badgeClass}>
            <span className={styles.dot} />
            {member.status}
          </span>
          {showClear && (
            <div>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={onClear}
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>
      {member.status !== "Active" && (
        <div className={styles.blockNote}>
          This member is {member.status.toLowerCase()} and can't borrow. Only
          active members can be issued a book.
        </div>
      )}
    </>
  );
}

function SummaryModal({
  result,
  memberName,
  copyCode,
  bookTitle,
  onDone,
}: {
  result: IssueBookResult;
  memberName: string;
  copyCode: string;
  bookTitle: string | null;
  onDone: () => void;
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalIco}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3>Book issued</h3>
        <p>The copy is now on loan and a borrow record was created.</p>
        <div className={styles.receipt}>
          {bookTitle && (
            <div>
              <span className={styles.k}>Book</span>
              <span className={styles.v}>{bookTitle}</span>
            </div>
          )}
          <div>
            <span className={styles.k}>Member</span>
            <span className={styles.v}>
              {memberName} (#{result.memberCode})
            </span>
          </div>
          <div>
            <span className={styles.k}>Copy</span>
            <span className={styles.v}>{copyCode}</span>
          </div>
          <div>
            <span className={styles.k}>Issued</span>
            <span className={styles.v}>{shortDate(result.issueDate)}</span>
          </div>
          <div>
            <span className={styles.k}>Due</span>
            <span className={styles.v}>{shortDate(result.dueDate)}</span>
          </div>
          {/* <div>
            <span className={styles.k}>Borrow record</span>
            <span className={styles.v}>#{result.borrowRecordId}</span>
          </div> */}
        </div>
        <button
          className={styles.btn}
          type="button"
          onClick={onDone}
          style={{ width: "100%" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
