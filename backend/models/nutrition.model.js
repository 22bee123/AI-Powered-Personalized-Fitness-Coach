import mongoose from "mongoose";

// Meal schema
const mealSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  calories: { 
    type: String 
  },
  protein: { 
    type: String 
  },
  carbs: { 
    type: String 
  },
  fats: { 
    type: String 
  },
  ingredients: [{ 
    type: String 
  }],
  instructions: { 
    type: String 
  },
  timeOfDay: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  }
});

// Daily nutrition schema
const dailyNutritionSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  meals: [mealSchema],
  totalCalories: {
    type: String
  },
  totalProtein: {
    type: String
  },
  totalCarbs: {
    type: String
  },
  totalFats: {
    type: String
  },
  waterIntake: {
    type: String
  },
  notes: {
    type: String
  }
});

// Schema for nutrition plans
const nutritionPlanSchema = new mongoose.Schema({
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
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  // User information
  userDetails: {
    age: { type: String },
    gender: { type: String },
    weight: { type: String },
    height: { type: String },
    goals: { type: String },
    preferences: { type: String },
    limitations: { type: String },
    allergies: { type: String },
    dietaryRestrictions: { type: String }
  },
  // The complete plan as returned by AI
  rawPlan: {
    type: String,
    required: true
  },
  // Structured 7-day nutrition schedule
  weekSchedule: {
    Monday: { type: dailyNutritionSchema, required: true },
    Tuesday: { type: dailyNutritionSchema, required: true },
    Wednesday: { type: dailyNutritionSchema, required: true },
    Thursday: { type: dailyNutritionSchema, required: true },
    Friday: { type: dailyNutritionSchema, required: true },
    Saturday: { type: dailyNutritionSchema, required: true },
    Sunday: { type: dailyNutritionSchema, required: true }
  },
  // General nutrition guidelines
  guidelines: [{
    type: String
  }],
  // Hydration recommendations
  hydration: [{
    type: String
  }],
  // Supplement recommendations
  supplements: [{
    type: String
  }],
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
nutritionPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

export default NutritionPlan;
