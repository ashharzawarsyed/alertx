import React from "react";
import { Routes, Route } from "react-router-dom";

import DashboardHome from "../features/dashboard/pages/DashboardHome";
import BedManagement from "../features/dashboard/pages/BedManagement";
import HospitalProfile from "../features/dashboard/pages/HospitalProfile";
import EmergencyQueue from "../features/dashboard/pages/EmergencyQueue";
import AmbulanceFleet from "../features/dashboard/pages/AmbulanceFleet";
import PatientRecords from "../features/dashboard/pages/PatientRecords";
import StaffManagement from "../features/dashboard/pages/StaffManagement";
import LiveTracking from "../pages/LiveTracking";

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
        path="/beds"
        element={
          <LayoutV2>
            <BedManagement />
          </LayoutV2>
        }
      />
      <Route
        path="/profile"
        element={
          <LayoutV2>
            <HospitalProfile />
          </LayoutV2>
        }
      />
      <Route
        path="/patients"
        element={
          <LayoutV2>
            <PatientRecords />
          </LayoutV2>
        }
      />
      <Route
        path="/staff"
        element={
          <LayoutV2>
            <StaffManagement />
          </LayoutV2>
        }
      />
      <Route
        path="/emergencies"
        element={
          <LayoutV2>
            <EmergencyQueue />
          </LayoutV2>
        }
      />
      <Route
        path="/ambulances"
        element={
          <LayoutV2>
            <AmbulanceFleet />
          </LayoutV2>
        }
      />
      <Route path="/tracking" element={<LiveTracking />} />
      <Route
        path="/reports"
        element={
          <LayoutV2>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-800">
                Reports & Analytics
              </h1>
              <p className="text-slate-600 mt-2">
                Analytics coming in Priority 4...
              </p>
            </div>
          </LayoutV2>
        }
      />
    </Routes>
  );
};

export default DashboardLayout;
