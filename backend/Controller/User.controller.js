import User from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to mock database file
const MOCK_DB_PATH = path.join(__dirname, '../mock-db.json');

// Load mock users from file if it exists
let mockUsers = [];
try {
  if (fs.existsSync(MOCK_DB_PATH)) {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
    mockUsers = JSON.parse(data);
    console.log('Loaded mock users from file:', mockUsers.length);
  }
} catch (error) {
  console.error('Error loading mock database:', error);
}

// Save mock users to file
const saveMockUsers = () => {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(mockUsers, null, 2));
    console.log('Saved mock users to file');
  } catch (error) {
    console.error('Error saving mock database:', error);
  }
};

// Debug function to log mock users
const logMockUsers = () => {
  console.log('Current mock users:', mockUsers.map(u => ({ _id: u._id, email: u.email, name: u.name })));
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = mockUsers.find(user => user.email === email);
    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to mock database
    mockUsers.push(newUser);
    console.log('User registered successfully:', { _id: newUser._id, email: newUser.email });
    logMockUsers();
    
    // Save to file
    saveMockUsers();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user without password
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      token,
      user: {
        _id: userResponse._id,
        name: userResponse.name,
        email: userResponse.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Log current users for debugging
    logMockUsers();

    // Check if user exists
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', { _id: user._id, email: user.email });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Password matched for user:', email);

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('Login successful for user:', email);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    console.log('Get profile request received for user ID:', req.user.id);
    
    // First try to get user from MongoDB
    let user;
    
    // If the ID looks like a Clerk ID (starts with "user_")
    if (req.user.id && req.user.id.startsWith('user_')) {
      user = await User.findOne({ clerkId: req.user.id });
    } else {
      // Try to find by MongoDB ID
      user = await User.findById(req.user.id);
    }
    
    // If not found in MongoDB, try mock database as fallback
    if (!user) {
      console.log('User not found in MongoDB, checking mock database');
      const mockUser = mockUsers.find(u => 
        u._id === req.user.id || 
        u.clerkId === req.user.id
      );
      
      if (!mockUser) {
        console.log('User not found with ID:', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('User profile found in mock DB:', { _id: mockUser._id, email: mockUser.email });
      
      // Return user without password
      const userResponse = { ...mockUser };
      delete userResponse.password;
      
      return res.json(userResponse);
    }
    
    console.log('User profile found in MongoDB:', { _id: user._id, email: user.email });
    
    // MongoDB model already removes password when converted to JSON
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    console.log('Update profile request received for user ID:', req.user.id);
    
    // First try to get user from MongoDB
    let user;
    
    // If the ID looks like a Clerk ID (starts with "user_")
    if (req.user.id && req.user.id.startsWith('user_')) {
      user = await User.findOne({ clerkId: req.user.id });
    } else {
      // Try to find by MongoDB ID
      user = await User.findById(req.user.id);
    }
    
    if (!user) {
      // Try to find user in mock database as fallback
      const userIndex = mockUsers.findIndex(u => 
        u._id === req.user.id || 
        u.clerkId === req.user.id
      );
      
      if (userIndex === -1) {
        console.log('User not found with ID:', req.user.id);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update mock user
      const mockUser = mockUsers[userIndex];
      console.log('User found for update in mock DB:', { _id: mockUser._id, email: mockUser.email });

      // Update fields that are sent in the request
      if (req.body.name) mockUser.name = req.body.name;
      if (req.body.email) mockUser.email = req.body.email;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        mockUser.password = await bcrypt.hash(req.body.password, salt);
      }
      if (req.body.profilePicture) mockUser.profilePicture = req.body.profilePicture;
      if (req.body.fitnessGoals) mockUser.fitnessGoals = req.body.fitnessGoals;
      if (req.body.fitnessLevel) mockUser.fitnessLevel = req.body.fitnessLevel;
      if (req.body.preferredWorkoutDays) mockUser.preferredWorkoutDays = req.body.preferredWorkoutDays;
      if (req.body.height) mockUser.height = req.body.height;
      if (req.body.weight) mockUser.weight = req.body.weight;
      if (req.body.age) mockUser.age = req.body.age;
      if (req.body.gender) mockUser.gender = req.body.gender;

      mockUser.updatedAt = new Date();
      mockUsers[userIndex] = mockUser;
      console.log('User profile updated successfully in mock DB');
      
      // Save to file
      saveMockUsers();

      // Return user without password
      const userResponse = { ...mockUser };
      delete userResponse.password;

      return res.json(userResponse);
    }
    
    console.log('User found for update in MongoDB:', { _id: user._id, email: user.email });

    // Update MongoDB user with fields sent in the request
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password; // Will be hashed by pre-save hook
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    if (req.body.fitnessGoals) user.fitnessGoals = req.body.fitnessGoals;
    if (req.body.fitnessLevel) user.fitnessLevel = req.body.fitnessLevel;
    if (req.body.preferredWorkoutDays) user.preferredWorkoutDays = req.body.preferredWorkoutDays;
    if (req.body.height) user.height = req.body.height;
    if (req.body.weight) user.weight = req.body.weight;
    if (req.body.age) user.age = req.body.age;
    if (req.body.gender) user.gender = req.body.gender;
    
    // Save updated user to MongoDB
    await user.save();
    console.log('User profile updated successfully in MongoDB');
    
    // MongoDB model already removes password when converted to JSON
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Sync user from Clerk
// @route   POST /api/users/clerk-sync
// @access  Public
export const syncClerkUser = async (req, res) => {
  try {
    console.log('Clerk sync request received:', req.body);
    const { clerkId, name, email } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: 'Clerk ID and email are required' });
    }

    // First try to find the user in the MongoDB database
    let dbUser = await User.findOne({ clerkId });
    
    if (dbUser) {
      // Update existing user in MongoDB
      dbUser.name = name || dbUser.name;
      dbUser.email = email || dbUser.email;
      await dbUser.save();
      
      console.log('Updated existing MongoDB user with Clerk ID:', clerkId);
    } else {
      // Try to find user by email
      dbUser = await User.findOne({ email });
      
      if (dbUser) {
        // Add Clerk ID to existing user
        dbUser.clerkId = clerkId;
        await dbUser.save();
        console.log('Added Clerk ID to existing MongoDB user with email:', email);
      } else {
        // Create a new user in MongoDB
        dbUser = await User.create({
          clerkId,
          name,
          email,
          fitnessGoals: 'general_fitness',
          fitnessLevel: 'beginner',
          preferredWorkoutDays: [],
          profilePicture: '',
          height: 0,
          weight: 0,
          age: 0,
          gender: ''
        });
        console.log('Created new MongoDB user with Clerk ID:', clerkId);
      }
    }
    
    // Also update the mock database for backward compatibility
    let mockUser = mockUsers.find(user => user.clerkId === clerkId);
    
    if (mockUser) {
      // Update mock user
      mockUser.name = name || mockUser.name;
      mockUser.email = email || mockUser.email;
      mockUser.updatedAt = new Date();
    } else {
      mockUser = mockUsers.find(user => user.email === email);
      
      if (mockUser) {
        // Add Clerk ID to existing mock user
        mockUser.clerkId = clerkId;
        mockUser.updatedAt = new Date();
      } else {
        // Create a new mock user
        mockUser = {
          _id: dbUser._id.toString(), // Use MongoDB ID for consistency
          clerkId,
          name,
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
          fitnessGoals: 'general_fitness',
          fitnessLevel: 'beginner',
          preferredWorkoutDays: [],
          profilePicture: '',
          height: 0,
          weight: 0,
          age: 0,
          gender: ''
        };
        mockUsers.push(mockUser);
      }
    }
    
    // Save mock database
    saveMockUsers();
    
    // Return user data from MongoDB
    res.status(200).json(dbUser);
  } catch (error) {
    console.error('Clerk sync error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};