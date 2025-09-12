// Clean up active emergencies for testing
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";
const TEST_USER = {
  email: "testpatient3@example.com",
  password: "Password123",
};

async function cleanupEmergencies() {
  try {
    // Authenticate first
    console.log("🔐 Authenticating...");
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!authResponse.ok) {
      throw new Error("Authentication failed");
    }

    const authData = await authResponse.json();
    const token = authData.data.token;

    // Get all emergencies for the user
    console.log("📋 Fetching user emergencies...");
    const emergenciesResponse = await fetch(`${API_BASE}/emergencies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!emergenciesResponse.ok) {
      throw new Error("Failed to fetch emergencies");
    }

    const emergenciesData = await emergenciesResponse.json();
    const emergencies =
      emergenciesData.data.emergencies || emergenciesData.data;

    console.log(`📊 Found ${emergencies.length} emergencies`);

    // Update each active emergency to completed status
    for (const emergency of emergencies) {
      if (["pending", "accepted", "in_progress"].includes(emergency.status)) {
        console.log(
          `🔧 Updating emergency ${emergency._id} from ${emergency.status} to completed`
        );

        const updateResponse = await fetch(
          `${API_BASE}/emergencies/${emergency._id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "completed",
              note: "Test cleanup - marking as completed",
            }),
          }
        );

        if (updateResponse.ok) {
          console.log(`✅ Emergency ${emergency._id} updated to completed`);
        } else {
          console.log(`⚠️ Failed to update emergency ${emergency._id}`);
        }
      }
    }

    console.log("🧹 Cleanup completed! Ready for testing.");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
  }
}

cleanupEmergencies().catch(console.error);
