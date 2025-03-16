import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Fallback Clerk Secret Key if not in environment variables
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_jPNuDEYU0oyQXsIorEzbSKQ2oLXrdwyCFHgRwUbCdv";

// Log the environment variable for debugging
console.log('Auth middleware - Using CLERK_SECRET_KEY:', CLERK_SECRET_KEY ? "Key is set" : "Key is missing");

/**
 * Middleware to verify Clerk authentication token
 * Uses the ClerkExpressWithAuth middleware from Clerk SDK
 */
export const clerkMiddleware = ClerkExpressWithAuth({
  secretKey: CLERK_SECRET_KEY,
  onError: (err, req, res) => {
    console.error('Clerk authentication error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
});
