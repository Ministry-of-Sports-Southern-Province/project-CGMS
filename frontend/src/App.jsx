import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { applyTheme } from "./lib/theme.js";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EntryForm from "./pages/EntryForm.jsx";
import EntryList from "./pages/EntryList.jsx";
import Profile from "./pages/Profile.jsx";
import Users from "./pages/Users.jsx";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/entries" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      applyTheme({ mode: user.theme_mode || "light", color: user.theme_color || "theme-12" });
    }
  }, [user]);

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries"
          element={
            <ProtectedRoute>
              <EntryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries/new"
          element={
            <ProtectedRoute>
              <EntryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute role="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={user?.role === "admin" ? "/dashboard" : "/entries/new"} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
