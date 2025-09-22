import React from "react";
import { Routes, Route } from "react-router-dom";

import DashboardHome from "../features/dashboard/pages/DashboardHome";

import LayoutV2 from "./LayoutV2";

const DashboardLayout = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LayoutV2>
            <DashboardHome />
          </LayoutV2>
        }
      />
      <Route
        path="/patients"
        element={
          <LayoutV2>
            <div>Patients Page</div>
          </LayoutV2>
        }
      />
      <Route
        path="/beds"
        element={
          <LayoutV2>
            <div>Beds Management</div>
          </LayoutV2>
        }
      />
      <Route
        path="/staff"
        element={
          <LayoutV2>
            <div>Staff Management</div>
          </LayoutV2>
        }
      />
      <Route
        path="/emergencies"
        element={
          <LayoutV2>
            <div>Emergency Queue</div>
          </LayoutV2>
        }
      />
      <Route
        path="/reports"
        element={
          <LayoutV2>
            <div>Reports & Analytics</div>
          </LayoutV2>
        }
      />
    </Routes>
  );
};

export default DashboardLayout;
