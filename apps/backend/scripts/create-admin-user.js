// Create admin user for dashboard testing
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/v1";

async function createAdminUser() {
  console.log("🔧 Creating admin user for dashboard login...");

  const adminUser = {
    name: "System Administrator",
    email: "admin@alertx.com",
    password: "Admin123!@#",
    role: "admin",
    phone: "+1555123456",
  };

  try {
    // Register the admin user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminUser),
    });

    const registerResult = await registerResponse.json();

    if (registerResponse.ok) {
      console.log("✅ Admin user created successfully");
      console.log("📧 Email:", adminUser.email);
      console.log("🔑 Password:", adminUser.password);
      console.log("👤 Role:", adminUser.role);
      console.log(
        "\n🎯 You can now login to the dashboard with these credentials"
      );
    } else {
      console.error("❌ Failed to create admin user:");
      console.error(registerResult);
    }
  } catch (error) {
    console.error("💥 Error creating admin user:", error.message);
  }

  process.exit(0);
}

createAdminUser();
