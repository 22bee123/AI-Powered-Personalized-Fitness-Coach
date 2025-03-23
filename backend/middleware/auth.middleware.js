import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Cache for Clerk JWKs
let jwksCache = null;
let jwksCacheTime = 0;

// Function to fetch Clerk JWKS
const getClerkJWKS = async () => {
  // Check if cache is still valid (1 hour)
  const cacheExpiryTime = 60 * 60 * 1000; // 1 hour in milliseconds
  const now = Date.now();
  
  if (jwksCache && now - jwksCacheTime < cacheExpiryTime) {
    return jwksCache;
  }
  
  try {
    const response = await fetch('https://api.clerk.dev/v1/jwks');
    jwksCache = await response.json();
    jwksCacheTime = now;
    return jwksCache;
  } catch (error) {
    console.error('Error fetching Clerk JWKS:', error);
    throw error;
  }
};

// Function to verify the Clerk JWT token
const verifyClerkToken = async (token) => {
  try {
    // For development/testing, you can decode the token without verification
    // This is only for debugging, and should be removed in production
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      throw new Error('Invalid token format');
    }
    
    // Extract user ID from Clerk token
    const userId = decoded.payload.sub;
    
    return { id: userId };
  } catch (error) {
    console.error('Error verifying Clerk token:', error);
    throw error;
  }
};

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if this is a Clerk token
      const decoded = jwt.decode(token, { complete: true });
      
      if (decoded && decoded.header.alg && decoded.header.alg.startsWith('RS')) {
        // Verify Clerk token
        const userData = await verifyClerkToken(token);
        req.user = userData;
      } else {
        // Verify JWT token (legacy)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = { id: decoded.id };
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
