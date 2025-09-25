import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
// Redirect /controls to /dashboard/controls, preserving query params
const ControlsRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/dashboard/controls${location.search}`} replace />;
};
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./features/auth";
import DashboardLayout from "./shared/layouts/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalManagement from "./features/hospitals/HospitalManagement";
import PatientManagement from "./features/patients";
import PatientDetailsPage from "./features/patients/PatientDetailsPage.jsx";
import AmbulancesPage from "./features/ambulances";
import DriversPage from "./features/drivers";
import Maps from "./features/maps";
import { Controls } from "./features/controls";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-sans font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Dashboard component with new layout
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout user={user}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/hospitals" element={<HospitalManagement />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/ambulances" element={<AmbulancesPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/controls" element={<Controls />} />
        {/* Add more routes here as we implement other features */}
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Redirect /controls to /dashboard/controls */}
            <Route path="/controls" element={<ControlsRedirect />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
