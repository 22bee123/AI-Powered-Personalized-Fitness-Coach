import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  profileDetails: {
    age: String,
    gender: String,
    weight: String,
    height: String,
    goals: String,
    preferences: String,
    limitations: String
  },
  workoutPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  }],
  nutritionPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NutritionPlan'
  }],
  activePlanIds: {
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan'
    },
    nutrition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NutritionPlan'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;
