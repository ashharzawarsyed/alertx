import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import MainContent from "../components/MainContent";

const DashboardLayout = ({ children, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Layout Container */}
      <div className="relative z-10">
        {/* Sidebar */}
        <Sidebar
          user={user}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Top Navigation */}
        <TopNavbar user={user} isCollapsed={isCollapsed} />

        {/* Main Content Area */}
        <MainContent isCollapsed={isCollapsed}>{children}</MainContent>
      </div>
    </div>
  );
};

export default DashboardLayout;
