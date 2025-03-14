import mongoose from "mongoose";

// Exercise schema
const exerciseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  sets: { 
    type: Number 
  },
  reps: { 
    type: String 
  },
  rest: { 
    type: String 
  },
  duration: { 
    type: String 
  },
  instructions: { 
    type: String 
  },
  muscleGroup: { 
    type: String 
  }
});

// Daily workout schema
const dailyWorkoutSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  focus: { 
    type: String,
    required: true
  },
  description: { 
    type: String 
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'hiit', 'flexibility', 'rest', 'recovery', 'other']
  },
  exercises: [exerciseSchema],
  isRestDay: {
    type: Boolean,
    default: false
  }
});

// Schema for workout plans
const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    lowercase: true
  },
  // User information
  userDetails: {
    age: { type: String },
    gender: { type: String },
    weight: { type: String },
    height: { type: String },
    goals: { type: String },
    preferences: { type: String },
    limitations: { type: String }
  },
  // The complete plan as returned by Gemini
  rawPlan: {
    type: String,
    required: true
  },
  // Structured 7-day workout schedule
  weekSchedule: {
    Monday: { type: dailyWorkoutSchema, required: true },
    Tuesday: { type: dailyWorkoutSchema, required: true },
    Wednesday: { type: dailyWorkoutSchema, required: true },
    Thursday: { type: dailyWorkoutSchema, required: true },
    Friday: { type: dailyWorkoutSchema, required: true },
    Saturday: { type: dailyWorkoutSchema, required: true },
    Sunday: { type: dailyWorkoutSchema, required: true }
  },
  // Keep the old structure for backward compatibility
  schedule: [{
    day: { type: String, required: true },
    workouts: [{
      type: { type: String, required: true },
      description: { type: String, required: true }
    }]
  }],
  exercises: [exerciseSchema],
  warmup: [{
    name: { type: String, required: true },
    duration: { type: String },
    reps: { type: String }
  }],
  cooldown: [{
    name: { type: String, required: true },
    duration: { type: String }
  }],
  nutrition: [{ type: String }],
  recovery: [{ type: String }],
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Pre-save hook to update the updatedAt field
workoutPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
