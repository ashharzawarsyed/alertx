import express from "express";
import cors from "cors";
import morgan from "morgan";
// import rateLimit from "express-rate-limit"; // DISABLED FOR DEVELOPMENT

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import apiRoutes from "./routes/index.js";

/*
It’s a browser security feature that controls whether a web page
running on one origin(domain, port, or protocol) can make requests
to another origin
*/
const app = express();

/* -------------------------------
   1. Database Connection
--------------------------------- */
connectDB();

/* -------------------------------
   2. Global Middleware
--------------------------------- */
// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URLS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

//app.use in Express.js is a method for mounting middleware.
app.use(cors(corsOptions));

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // max requests per IP - increased for development
//   message: {
//     error: "Too many requests from this IP, please try again later.",
//     retryAfter: "15 minutes",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use("/api", limiter);

// Logging middleware
app.use(
  process.env.NODE_ENV === "development" ? morgan("dev") : morgan("combined")
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------
   3. Routes
--------------------------------- */
// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AlertX Backend API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api/v1", apiRoutes);

/* -------------------------------
   4. Error Handling
--------------------------------- */
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

export default app;
