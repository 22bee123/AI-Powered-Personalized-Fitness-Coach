import User from '../models/user.model.js';
import WorkoutPlan from '../models/fitness.model.js';
import NutritionPlan from '../models/nutrition.model.js';

/**
 * Create or update a user based on Clerk authentication data
 */
export const createOrUpdateUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, profileDetails } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: 'Clerk ID and email are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.email = email;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (profileDetails) user.profileDetails = { ...user.profileDetails, ...profileDetails };
      user.updatedAt = Date.now();

      await user.save();
      return res.status(200).json({ message: 'User updated successfully', user });
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        profileDetails: profileDetails || {},
        workoutPlans: [],
        nutritionPlans: [],
        activePlanIds: {}
      });

      await user.save();
      return res.status(201).json({ message: 'User created successfully', user });
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = async (req, res) => {
  try {
    const { clerkId } = req.params;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    const user = await User.findOne({ clerkId })
      .populate('workoutPlans')
      .populate('nutritionPlans')
      .populate('activePlanIds.workout')
      .populate('activePlanIds.nutrition');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUserByClerkId:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { profileDetails } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileDetails = { ...user.profileDetails, ...profileDetails };
    user.updatedAt = Date.now();

    await user.save();
    return res.status(200).json({ message: 'User profile updated successfully', user });
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
    const { clerkId } = req.params;
    const { workoutPlanId } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    if (!workoutPlanId) {
      return res.status(400).json({ message: 'Workout plan ID is required' });
    }

    const user = await User.findOne({ clerkId });
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
    const { clerkId } = req.params;
    const { nutritionPlanId } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    if (!nutritionPlanId) {
      return res.status(400).json({ message: 'Nutrition plan ID is required' });
    }

    const user = await User.findOne({ clerkId });
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
    const { clerkId } = req.params;
    const { workoutPlanId } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    if (!workoutPlanId) {
      return res.status(400).json({ message: 'Workout plan ID is required' });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the workout plan exists
    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Check if the plan is already in the user's plans
    if (!user.workoutPlans.includes(workoutPlanId)) {
      user.workoutPlans.push(workoutPlanId);
      await user.save();
    }

    return res.status(200).json({ 
      message: 'Workout plan added to user successfully', 
      workoutPlans: user.workoutPlans 
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
    const { clerkId } = req.params;
    const { nutritionPlanId } = req.body;

    if (!clerkId) {
      return res.status(400).json({ message: 'Clerk ID is required' });
    }

    if (!nutritionPlanId) {
      return res.status(400).json({ message: 'Nutrition plan ID is required' });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the nutrition plan exists
    const nutritionPlan = await NutritionPlan.findById(nutritionPlanId);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check if the plan is already in the user's plans
    if (!user.nutritionPlans.includes(nutritionPlanId)) {
      user.nutritionPlans.push(nutritionPlanId);
      await user.save();
    }

    return res.status(200).json({ 
      message: 'Nutrition plan added to user successfully', 
      nutritionPlans: user.nutritionPlans 
    });
  } catch (error) {
    console.error('Error in addNutritionPlanToUser:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
