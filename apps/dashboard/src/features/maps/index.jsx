import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MapsProvider,
  useMapsState,
  useMapsDispatch,
  MAPS_ACTIONS,
} from "./context/MapsContext";
import { mapsAPI } from "./services/mapsAPI";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";

// Main Maps component content
const MapsContent = () => {
  const { loading, error, sidebarOpen } = useMapsState();
  const dispatch = useMapsDispatch();

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      dispatch({ type: MAPS_ACTIONS.SET_LOADING, payload: true });

      try {
        const result = await mapsAPI.initializeData();

        if (result.success) {
          dispatch({
            type: MAPS_ACTIONS.SET_AMBULANCES,
            payload: result.ambulances,
          });
          dispatch({
            type: MAPS_ACTIONS.SET_HOSPITALS,
            payload: result.hospitals,
          });
          dispatch({
            type: MAPS_ACTIONS.SET_HOTSPOTS,
            payload: result.hotspots,
          });
        } else {
          dispatch({ type: MAPS_ACTIONS.SET_ERROR, payload: result.error });
        }
      } catch {
        dispatch({
          type: MAPS_ACTIONS.SET_ERROR,
          payload: "Failed to load map data",
        });
      }
    };

    initializeData();
  }, [dispatch]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Error Loading Maps
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading map data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full Screen Map Mode when sidebar is open - Portal to body */}
      {sidebarOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-gray-900"
            style={{
              zIndex: 999997,
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* Full Screen Map */}
            <div className="absolute inset-0">
              <MapView />
            </div>
          </div>,
          document.body,
        )}

      {/* Normal Map Mode when sidebar is closed */}
      {!sidebarOpen && (
        <div className="relative h-screen w-full overflow-hidden bg-gray-900">
          {/* Main Map - Full Screen */}
          <div className="absolute inset-0">
            <MapView />
          </div>
        </div>
      )}

      {/* Sidebar - Always rendered via portal, handles its own visibility */}
      <Sidebar />
    </>
  );
};

// Main exported component with provider
const Maps = () => {
  return (
    <MapsProvider>
      <MapsContent />
    </MapsProvider>
  );
};

export default Maps;
