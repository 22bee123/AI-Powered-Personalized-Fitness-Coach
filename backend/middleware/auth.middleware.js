import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

// Log the environment variable for debugging
console.log('Auth middleware - Using JWT_SECRET:', JWT_SECRET ? "Key is set" : "Key is missing");

/**
 * Middleware to verify JWT authentication token
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  }
};
