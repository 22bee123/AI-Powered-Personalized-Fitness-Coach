import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;
