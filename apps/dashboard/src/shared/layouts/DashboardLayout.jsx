import React from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import MainContent from "../components/MainContent";
import DynamicBackground from "../components/DynamicBackground";

const DashboardLayout = ({ children, user }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <DynamicBackground />

      {/* Layout Container */}
      <div className="relative z-10">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Top Navigation */}
        <TopNavbar user={user} />

        {/* Main Content Area */}
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default DashboardLayout;
