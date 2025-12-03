import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard or signin */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
