import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BooksIcon,
  CheckIcon,
  ClockIcon,
  MembersIcon,
  SearchIcon,
  IssueIcon,
  ReturnIcon,
} from "../../components/icons";
import { useDashboardStats } from "./useDashboardStats";
import type { DashboardStats } from "./useDashboardStats";
import styles from "./DashboardPage.module.css";

const tiles: { field: keyof DashboardStats; label: string; icon: ReactNode }[] =
  [
    { field: "totalBooks", label: "Total books", icon: <BooksIcon /> },
    {
      field: "availableCopies",
      label: "Available copies",
      icon: <CheckIcon />,
    },
    { field: "borrowedCopies", label: "Borrowed Copies", icon: <ClockIcon /> },
    { field: "memberCount", label: "Members", icon: <MembersIcon /> },
  ];

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.intro}>A quick overview of the library.</p>

      <div className={styles.statGrid}>
        {tiles.map((t) => (
          <div key={t.label} className={styles.stat}>
            <div className={styles.statTop}>
              <span className={styles.statIco}>{t.icon}</span>
              {(loading || error) && (
                <span className={styles.statPending}>
                  {error ? "Unavailable" : "Loading…"}
                </span>
              )}
            </div>
            <div className={styles.statValue}>
              {stats ? stats[t.field] : "—"}
            </div>
            <div className={styles.statLabel}>{t.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHead}>
        <h2>What would you like to do?</h2>
        <p>Jump straight into a task.</p>
      </div>

      <div className={styles.actions}>
        <Link to="/search" className={styles.action}>
          <span className={styles.actionIco}>
            <SearchIcon />
          </span>
          <span>
            <span className={styles.actionTitle}>Search books</span>
            <span className={styles.actionDesc}>
              Find a title by name, author, or ISBN.
            </span>
          </span>
        </Link>

        <Link to="/issue" className={styles.action}>
          <span className={styles.actionIco}>
            <IssueIcon />
          </span>
          <span>
            <span className={styles.actionTitle}>Issue a book</span>
            <span className={styles.actionDesc}>
              Issue an available copy to a member.
            </span>
          </span>
        </Link>

        <Link to="/return" className={styles.action}>
          <span className={styles.actionIco}>
            <ReturnIcon />
          </span>
          <span>
            <span className={styles.actionTitle}>Return a book</span>
            <span className={styles.actionDesc}>
              Take a borrowed copy back in.
            </span>
          </span>
        </Link>

        <Link to="/members" className={styles.action}>
          <span className={styles.actionIco}>
            <MembersIcon />
          </span>
          <span>
            <span className={styles.actionTitle}>View members</span>
            <span className={styles.actionDesc}>
              Look up a member and their loans.
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
