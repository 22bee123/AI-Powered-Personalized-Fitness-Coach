import StartWorkout from '../model/startWorkout.model.js';
import WorkoutPlan from '../model/workout.model.js';
import mongoose from 'mongoose';

// Start a new workout session
export const startWorkout = async (req, res) => {
  try {
    const { workoutPlanId, day } = req.body;
    const userId = req.user.id;
    
    // Check if workout plan exists
    const workoutPlan = await WorkoutPlan.findOne({ _id: workoutPlanId, userId: userId });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    // Get the day's workout details
    const dayWorkout = workoutPlan.weeklyPlan[day.toLowerCase()];
    
    if (!dayWorkout) {
      return res.status(400).json({ message: 'Invalid workout day' });
    }
    
    // Create exercise progress array
    const exercises = dayWorkout.exercises.map(exercise => ({
      exerciseName: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      completed: false,
      duration: 0
    }));
    
    // Create new workout session
    const newWorkout = new StartWorkout({
      userId: userId,
      workoutPlanId,
      day: day.toLowerCase(),
      focus: dayWorkout.focus,
      exercises,
      startTime: new Date(),
      completed: false
    });
    
    await newWorkout.save();
    
    res.status(201).json({ 
      message: 'Workout session started successfully',
      workout: newWorkout
    });
  } catch (error) {
    console.error('Error starting workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update exercise progress
export const updateExerciseProgress = async (req, res) => {
  try {
    const { workoutId, exerciseId, completed, duration } = req.body;
    const userId = req.user.id;
    
    const workout = await StartWorkout.findOne({ _id: workoutId, userId: userId });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout session not found' });
    }
    
    // Find and update the exercise
    const exercise = workout.exercises.id(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    exercise.completed = completed;
    exercise.duration = duration;
    
    await workout.save();
    
    res.status(200).json({ 
      message: 'Exercise progress updated successfully',
      exercise
    });
  } catch (error) {
    console.error('Error updating exercise progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update warmup/cooldown status
export const updateWarmupCooldown = async (req, res) => {
  try {
    const { workoutId, warmupCompleted, cooldownCompleted } = req.body;
    const userId = req.user.id;
    
    const workout = await StartWorkout.findOne({ _id: workoutId, userId: userId });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout session not found' });
    }
    
    if (warmupCompleted !== undefined) {
      workout.warmupCompleted = warmupCompleted;
    }
    
    if (cooldownCompleted !== undefined) {
      workout.cooldownCompleted = cooldownCompleted;
    }
    
    await workout.save();
    
    res.status(200).json({ 
      message: 'Warmup/cooldown status updated successfully',
      workout
    });
  } catch (error) {
    console.error('Error updating warmup/cooldown status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete workout session
export const completeWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = req.user.id;
    
    const workout = await StartWorkout.findOne({ _id: workoutId, userId: userId });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout session not found' });
    }
    
    const endTime = new Date();
    const totalDuration = Math.floor((endTime - workout.startTime) / 1000); // in seconds
    
    workout.endTime = endTime;
    workout.totalDuration = totalDuration;
    workout.completed = true;
    
    await workout.save();
    
    res.status(200).json({ 
      message: 'Workout completed successfully',
      workout
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active workout session
export const getActiveWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activeWorkout = await StartWorkout.findOne({ 
      userId: userId, 
      completed: false 
    }).sort({ startTime: -1 });
    
    if (!activeWorkout) {
      return res.status(404).json({ message: 'No active workout session found' });
    }
    
    res.status(200).json({ workout: activeWorkout });
  } catch (error) {
    console.error('Error getting active workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get workout history
export const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const workouts = await StartWorkout.find({ 
      userId: userId, 
      completed: true 
    }).sort({ endTime: -1 });
    
    res.status(200).json({ workouts });
  } catch (error) {
    console.error('Error getting workout history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};