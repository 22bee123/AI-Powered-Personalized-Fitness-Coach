import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  dailyPlan: {
    type: Object,
    required: true
  },
  totalCalories: {
    type: Number,
    required: true
  },
  macros: {
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fats: {
      type: Number,
      required: true
    }
  },
  calorieCalculations: {
    bmr: {
      type: Number,
      required: true
    },
    tdee: {
      type: Number,
      required: true
    },
    goalAdjustedCalories: {
      type: Number,
      required: true
    }
  },
  nutritionTips: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NutritionPlan = mongoose.model('NutritionPlan', nutritionSchema);

export default NutritionPlan;