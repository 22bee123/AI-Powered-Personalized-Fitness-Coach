import User from '../models/user.model.js';
import WorkoutPlan from '../models/fitness.model.js';
import NutritionPlan from '../models/nutrition.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, profileDetails } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by the pre-save hook
      firstName,
      lastName,
      profileDetails: profileDetails || {},
      workoutPlans: [],
      nutritionPlans: [],
      activePlanIds: {}
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileDetails: user.profileDetails
    };

    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileDetails: user.profileDetails
    };

    return res.status(200).json({ 
      message: 'Login successful', 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware

    const user = await User.findById(userId)
      .populate('workoutPlans')
      .populate('nutritionPlans')
      .populate('activePlanIds.workout')
      .populate('activePlanIds.nutrition')
      .select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const { firstName, lastName, profileDetails } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileDetails) user.profileDetails = { ...user.profileDetails, ...profileDetails };
    user.updatedAt = Date.now();

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(200).json({ message: 'User profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Set active workout plan for user
 */
export const setActiveWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const { workoutPlanId } = req.body;

    if (!workoutPlanId) {
      return res.status(400).json({ message: 'Workout plan ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the workout plan exists and belongs to the user
    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Update the active workout plan
    user.activePlanIds.workout = workoutPlanId;
    await user.save();

    return res.status(200).json({ 
      message: 'Active workout plan updated successfully', 
      activePlanId: workoutPlanId 
    });
  } catch (error) {
    console.error('Error in setActiveWorkoutPlan:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Set active nutrition plan for user
 */
export const setActiveNutritionPlan = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const { nutritionPlanId } = req.body;

    if (!nutritionPlanId) {
      return res.status(400).json({ message: 'Nutrition plan ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the nutrition plan exists and belongs to the user
    const nutritionPlan = await NutritionPlan.findById(nutritionPlanId);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Update the active nutrition plan
    user.activePlanIds.nutrition = nutritionPlanId;
    await user.save();

    return res.status(200).json({ 
      message: 'Active nutrition plan updated successfully', 
      activePlanId: nutritionPlanId 
    });
  } catch (error) {
    console.error('Error in setActiveNutritionPlan:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add workout plan to user
 */
export const addWorkoutPlanToUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const { workoutPlanId } = req.body;

    if (!workoutPlanId) {
      return res.status(400).json({ message: 'Workout plan ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the workout plan exists
    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check if the workout plan is already added to the user
    if (user.workoutPlans.includes(workoutPlanId)) {
      return res.status(400).json({ message: 'Workout plan already added to user' });
    }

    // Add the workout plan to the user
    user.workoutPlans.push(workoutPlanId);
    await user.save();

    return res.status(200).json({ 
      message: 'Workout plan added to user successfully', 
      workoutPlanId 
    });
  } catch (error) {
    console.error('Error in addWorkoutPlanToUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add nutrition plan to user
 */
export const addNutritionPlanToUser = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const { nutritionPlanId } = req.body;

    if (!nutritionPlanId) {
      return res.status(400).json({ message: 'Nutrition plan ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the nutrition plan exists
    const nutritionPlan = await NutritionPlan.findById(nutritionPlanId);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check if the nutrition plan is already added to the user
    if (user.nutritionPlans.includes(nutritionPlanId)) {
      return res.status(400).json({ message: 'Nutrition plan already added to user' });
    }

    // Add the nutrition plan to the user
    user.nutritionPlans.push(nutritionPlanId);
    await user.save();

    return res.status(200).json({ 
      message: 'Nutrition plan added to user successfully', 
      nutritionPlanId 
    });
  } catch (error) {
    console.error('Error in addNutritionPlanToUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
