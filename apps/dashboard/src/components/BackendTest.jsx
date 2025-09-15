import React, { useState, useEffect } from "react";
import axios from "axios";

function BackendTest() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await axios.get("http://localhost:5000/health", {
          timeout: 5000,
        });
        setBackendStatus("connected");
        setBackendData(response.data);
      } catch (error) {
        setBackendStatus("failed");
        setBackendData({ error: error.message });
      }
    };

    testBackendConnection();
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case "checking":
        return "bg-yellow-100 border-yellow-400 text-yellow-700";
      case "connected":
        return "bg-green-100 border-green-400 text-green-700";
      case "failed":
        return "bg-red-100 border-red-400 text-red-700";
      default:
        return "bg-gray-100 border-gray-400 text-gray-700";
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case "checking":
        return "🔄";
      case "connected":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⚪";
    }
  };

  return (
    <div className={`rounded border px-4 py-3 ${getStatusColor()}`}>
      {getStatusIcon()} Backend API:{" "}
      {backendStatus === "checking"
        ? "Checking..."
        : backendStatus === "connected"
          ? "Connected"
          : "Failed"}
      {backendData && (
        <div className="mt-2 text-xs opacity-75">
          {backendStatus === "connected"
            ? `Response: ${JSON.stringify(backendData).substring(0, 50)}...`
            : `Error: ${backendData.error}`}
        </div>
      )}
    </div>
  );
}

export default BackendTest;
