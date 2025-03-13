import mongoose from "mongoose";

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
  // Structured workout data
  schedule: [{
    day: { type: String, required: true },
    workouts: [{
      type: { type: String, required: true }, // e.g., "strength", "cardio", "rest"
      description: { type: String, required: true }
    }]
  }],
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number },
    reps: { type: String },
    rest: { type: String },
    instructions: { type: String },
    muscleGroup: { type: String }
  }],
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
