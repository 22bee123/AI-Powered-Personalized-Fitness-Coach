import mongoose from 'mongoose';

const workoutCompleteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  focus: {
    type: String,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  totalDuration: {
    type: Number,
    default: 0,
  },
  exercisesCompleted: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('WorkoutComplete', workoutCompleteSchema);
