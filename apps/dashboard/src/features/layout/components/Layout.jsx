import React from "react";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {children}
    </div>
  );
}

export default Layout;
