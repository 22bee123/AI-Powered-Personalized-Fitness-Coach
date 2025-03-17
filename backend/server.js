import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fitnessCoachRoutes from "./routes/fitnessCoach.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import connectToMongoDB from "./db/fitnessDataBase.js";

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Also load from parent directory .env if it exists
dotenv.config({ path: resolve(__dirname, '../.env') });

// Also load from .env.local if it exists
dotenv.config({ path: resolve(__dirname, './.env.local') });



// Convert user routes to ES modules
import userRoutes from "./routes/user.js";
import aiCoachRoutes from "./routes/aiCoach.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/fitness-coach", fitnessCoachRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai-coach", aiCoachRoutes);

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI Fitness Coach API is running" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});