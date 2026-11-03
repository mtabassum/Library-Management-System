import { NavLink, Outlet } from "react-router-dom";
import {
  DashboardIcon,
  SearchIcon,
  IssueIcon,
  ReturnIcon,
  MembersIcon,
} from "./icons";
import styles from "./AppLayout.module.css";

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;
}

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              width="18"
              height="18"
            >
              <path d="M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.2V5.5Z" />
              <path d="M20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.2V5.5Z" />
            </svg>
          </span>
          <span>
            <span className={styles.brandName}>Library</span>
            <span className={styles.brandSub}>Management system</span>
          </span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/" end className={navClass}>
            <DashboardIcon /> Dashboard
          </NavLink>
          <NavLink to="/search" className={navClass}>
            <SearchIcon /> Search books
          </NavLink>
          <NavLink to="/issue" className={navClass}>
            <IssueIcon /> Issue book
          </NavLink>
          <NavLink to="/return" className={navClass}>
            <ReturnIcon /> Return book
          </NavLink>
          <NavLink to="/members" className={navClass}>
            <MembersIcon /> Member Details
          </NavLink>

          {/* <span className={`${styles.navItem} ${styles.disabled}`}>
            <MembersIcon /> Members <em className={styles.soon}>soon</em>
          </span> */}
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>LA</span>
          <span>
            <span className={styles.accountName}>Library admin</span>
            <span className={styles.accountRole}>Librarian</span>
          </span>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
