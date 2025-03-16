import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fitnessCoachRoutes from "./routes/fitnessCoach.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

import connectToMongoDB from "./db/fitnessDataBase.js";

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load from different .env files
dotenv.config({ path: resolve(__dirname, '.env') });
dotenv.config({ path: resolve(__dirname, '.env.local') });

// Fallback Clerk Secret Key if not in environment variables
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_jPNuDEYU0oyQXsIorEzbSKQ2oLXrdwyCFHgRwUbCdv";

// Convert user routes to ES modules
import userRoutes from "./routes/user.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables for debugging (remove in production)
console.log("Using CLERK_SECRET_KEY:", CLERK_SECRET_KEY ? "Key is set" : "Key is missing");

// Clerk Auth middleware
const clerkMiddleware = ClerkExpressWithAuth({
  secretKey: CLERK_SECRET_KEY,
  onError: (err, req, res) => {
    console.error('Clerk authentication error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// Make clerkMiddleware available globally
app.locals.clerkMiddleware = clerkMiddleware;

// Routes
app.use("/api/fitness-coach", fitnessCoachRoutes);
app.use("/api/users", userRoutes);
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