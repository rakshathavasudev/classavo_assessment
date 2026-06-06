import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ChapterViewPage from "./pages/ChapterViewPage";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import ManageCoursePage from "./pages/ManageCoursePage";
import ChapterEditPage from "./pages/ChapterEditPage";

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
        <Route
          path="/courses/:courseId/chapters/:chapterId"
          element={<ProtectedRoute><ChapterViewPage /></ProtectedRoute>}
        />

        {/* Instructor-only */}
        <Route
          path="/instructor"
          element={<ProtectedRoute role="instructor"><InstructorCoursesPage /></ProtectedRoute>}
        />
        <Route
          path="/instructor/courses/:id"
          element={<ProtectedRoute role="instructor"><ManageCoursePage /></ProtectedRoute>}
        />
        <Route
          path="/instructor/courses/:id/chapters/new"
          element={<ProtectedRoute role="instructor"><ChapterEditPage /></ProtectedRoute>}
        />
        <Route
          path="/instructor/courses/:id/chapters/:chapterId/edit"
          element={<ProtectedRoute role="instructor"><ChapterEditPage /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
