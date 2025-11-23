import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import linkRoutes from "./routes/linkRoutes.js";
import * as linkController from "./controllers/linkController.js";
import db from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.status(200).send("URL Shortener API is running");
});


/**
 * Health Check Endpoint
 */
app.get("/healthz", async (req, res) => {
  try {
    const dbConnected = db.testDbConnection();

    const uptime = process.uptime(); 
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    res.status(200).json({
      success: true,
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: dbConnected ? "connected" : "disconnected",
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Server is unhealthy",
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
app.use("/api", linkRoutes);

app.get("/:slug", linkController.redirectLink);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});