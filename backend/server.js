import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fitnessCoachRoutes from "./routes/fitnessCoach.js";

import connectToMongoDB from "./db/fitnessDataBase.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/fitness-coach", fitnessCoachRoutes);

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