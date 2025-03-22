import mongoose from 'mongoose';

const exerciseProgressSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  reps: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number, // in seconds
    default: 0
  }
});

const startWorkoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  focus: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalDuration: {
    type: Number, // in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  exercises: [exerciseProgressSchema],
  warmupCompleted: {
    type: Boolean,
    default: false
  },
  cooldownCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const StartWorkout = mongoose.model('StartWorkout', startWorkoutSchema);

export default StartWorkout;