import { Routes, Route } from "react-router-dom";
import DashboardPage from "./features/dashboard/DashboardPage";
import SearchBooksPage from "./features/books/searchBooks/SearchBooksPage";
import IssueBookPage from "./features/borrowing/issueBook/IssueBookPage";
import ReturnBookPage from "./features/borrowing/returnBook/ReturnBookPage";
import MemberDetailsPage from "./features/members/memberDetails/MemberDetailsPage";
import BookDetailsPage from "./features/books/bookDetails/BookDetailsPage";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/search" element={<SearchBooksPage />} />
        <Route path="/issue" element={<IssueBookPage />} />
        <Route path="/return" element={<ReturnBookPage />} />
        <Route path="/members" element={<MemberDetailsPage />} />
        <Route path="/members/:memberId" element={<MemberDetailsPage />} />
        <Route path="/books" element={<BookDetailsPage />} />
        <Route path="/books/:bookId" element={<BookDetailsPage />} />
      </Route>
    </Routes>
  );
}
