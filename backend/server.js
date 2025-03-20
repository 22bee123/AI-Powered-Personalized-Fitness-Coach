import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

import userdatabase from "./db/user.db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.route.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug route to check mock users
app.get('/api/debug/users', (req, res) => {
  try {
    const MOCK_DB_PATH = path.join(__dirname, './mock-db.json');
    
    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
      const users = JSON.parse(data);
      // Return users without passwords
      const safeUsers = users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }));
      res.json({ count: users.length, users: safeUsers });
    } else {
      res.json({ count: 0, users: [], message: 'No mock database file found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  userdatabase();
  console.log(`Server is running on port ${PORT}`);
});
