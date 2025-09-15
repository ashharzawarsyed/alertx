import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import BackendTest from "./components/BackendTest";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex min-h-screen items-center justify-center">
              <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
                      <span className="text-2xl font-bold text-white">🚨</span>
                    </div>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    AlertX Dashboard
                  </h1>
                  <p className="mb-6 text-gray-600">
                    Emergency Management System
                  </p>
                  <div className="space-y-3">
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                      ✅ React Query: Ready
                    </div>
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                      ✅ TailwindCSS: Ready
                    </div>
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                      ✅ React Router: Ready
                    </div>
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                      ✅ Auth Context: Ready
                    </div>
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                      ✅ React 19.0.0: Fixed
                    </div>
                    <BackendTest />
                  </div>
                  <p className="mt-6 text-sm text-gray-500">
                    Phase 1: Dependencies & Version Conflicts Resolved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
