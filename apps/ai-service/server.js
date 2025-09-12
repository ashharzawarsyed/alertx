import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import triageRoutes from "./routes/triageRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AlertX AI Triage Service",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/triage", triageRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Triage Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🩺 Triage endpoint: http://localhost:${PORT}/api/triage/analyze`
  );
});
