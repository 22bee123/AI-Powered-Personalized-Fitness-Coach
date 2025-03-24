import WorkoutComplete from '../model/workoutComplete.model.js';
import WorkoutPlan from '../model/workout.model.js';
import User from '../model/user.model.js';

// Create a workout completion record
export const createWorkoutComplete = async (req, res) => {
  try {
    const { workoutPlanId, day, focus, totalDuration, exercisesCompleted } = req.body;
    
    if (!workoutPlanId || !day || !focus) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user from JWT token
    const userId = req.user.id;

    console.log('Creating workout completion with userId:', userId);

    // Check if this workout day was already completed
    const existingComplete = await WorkoutComplete.findOne({
      userId,
      workoutPlanId,
      day
    });

    if (existingComplete) {
      return res.status(400).json({ message: 'This workout day is already completed' });
    }

    // Create a new workout completion record
    const workoutComplete = new WorkoutComplete({
      userId,
      workoutPlanId,
      day,
      focus,
      totalDuration: totalDuration || 0,
      exercisesCompleted: exercisesCompleted || 0,
    });

    await workoutComplete.save();

    // Update workout plan to mark this day as completed
    await WorkoutPlan.findOneAndUpdate(
      { _id: workoutPlanId, userId },
      { $set: { [`weeklyPlan.${day}.isCompleted`]: true } }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Workout completion recorded', 
      workoutComplete 
    });
  } catch (err) {
    console.error('Error creating workout completion:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all completed workouts for the user
export const getCompletedWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Fetching completed workouts for userId:', userId);
    
    const completedWorkouts = await WorkoutComplete.find({ userId })
      .sort({ completedAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: completedWorkouts.length,
      completedWorkouts 
    });
  } catch (err) {
    console.error('Error fetching completed workouts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get completion stats for a specific workout plan
export const getWorkoutPlanStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutPlanId } = req.params;
    
    console.log('Fetching stats for userId:', userId, 'workoutPlanId:', workoutPlanId);
    
    if (!workoutPlanId) {
      return res.status(400).json({ message: 'Workout plan ID is required' });
    }
    
    const completedWorkouts = await WorkoutComplete.find({ 
      userId, 
      workoutPlanId 
    });
    
    console.log('Found completed workouts:', completedWorkouts.length);
    
    const workoutPlan = await WorkoutPlan.findOne({
      _id: workoutPlanId,
      userId
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    // Calculate stats
    const totalWorkoutDays = Object.values(workoutPlan.weeklyPlan)
      .filter(day => !day.focus.toLowerCase().includes('rest')).length;
    
    const completedDays = completedWorkouts.length;
    const completionPercentage = (completedDays / totalWorkoutDays) * 100;
    
    // Total duration across all completed workouts
    const totalDuration = completedWorkouts.reduce((total, workout) => 
      total + (workout.totalDuration || 0), 0);
    
    res.status(200).json({
      success: true,
      stats: {
        totalWorkoutDays,
        completedDays,
        completionPercentage,
        totalDuration,
        restDays: Object.values(workoutPlan.weeklyPlan)
          .filter(day => day.focus.toLowerCase().includes('rest')).length,
        remainingDays: totalWorkoutDays - completedDays
      }
    });
  } catch (err) {
    console.error('Error fetching workout plan stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
