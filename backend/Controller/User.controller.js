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
    
    // Log current users for debugging
    logMockUsers();
    
    const user = mockUsers.find(user => user._id === req.user.id);
    
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile found:', { _id: user._id, email: user.email });

    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;

    res.json(userResponse);
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
    
    const userIndex = mockUsers.findIndex(user => user._id === req.user.id);
    
    if (userIndex === -1) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = mockUsers[userIndex];
    console.log('User found for update:', { _id: user._id, email: user.email });

    // Update fields that are sent in the request
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    if (req.body.fitnessGoals) user.fitnessGoals = req.body.fitnessGoals;
    if (req.body.fitnessLevel) user.fitnessLevel = req.body.fitnessLevel;
    if (req.body.preferredWorkoutDays) user.preferredWorkoutDays = req.body.preferredWorkoutDays;
    if (req.body.height) user.height = req.body.height;
    if (req.body.weight) user.weight = req.body.weight;
    if (req.body.age) user.age = req.body.age;
    if (req.body.gender) user.gender = req.body.gender;

    user.updatedAt = new Date();
    mockUsers[userIndex] = user;
    console.log('User profile updated successfully');
    
    // Save to file
    saveMockUsers();

    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};