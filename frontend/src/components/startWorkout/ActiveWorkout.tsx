import React from 'react';
import { Workout, formatTime } from './types';
import { 
  ClockIcon, 
  BoltIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import CountdownTimer from './CountdownTimer';
import ExerciseView from './ExerciseView';
import WorkoutCompleted from './WorkoutCompleted';

interface ActiveWorkoutProps {
  workout: Workout;
  selectedDay: string | null;
  workoutStage: 'countdown' | 'exercise' | 'completed';
  timer: number;
  currentExerciseIndex: number;
  exerciseTimer: number;
  exerciseTimerRunning: boolean;
  countdownTimer: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onToggleExerciseTimer: () => void;
  onSkipCountdown: () => void;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
  onCompleteWorkout: () => void;
  dayNumber?: number;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  workout,
  selectedDay,
  workoutStage,
  timer,
  currentExerciseIndex,
  exerciseTimer,
  exerciseTimerRunning,
  countdownTimer,
  soundEnabled,
  onBack,
  onToggleSound,
  onToggleExerciseTimer,
  onSkipCountdown,
  onPreviousExercise,
  onNextExercise,
  onCompleteWorkout,
  dayNumber
}) => {
  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      {/* Main workout area */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with day and timer */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-3 sm:mr-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Back to workout selection"
              >
                <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-wider">
                    {formatTime(timer)}
                  </span>
                  <span className="text-xs sm:text-sm text-white/70">
                    Total Workout Time
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onToggleSound}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${soundEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                title={soundEnabled ? "Sound On" : "Sound Off"}
              >
                {soundEnabled ? (
                  <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center">
                {dayNumber && (
                  <span className="bg-white/20 w-7 h-7 flex items-center justify-center rounded-full text-lg font-bold mr-2">
                    {dayNumber}
                  </span>
                )}
                <h2 className="text-base sm:text-xl font-bold">
                  {selectedDay && selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Workout
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-sm sm:text-base text-white/90 mt-1">
                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                  {workout.exercises.length} Exercises
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                  {workout.exercises.filter(e => e.completed).length} Completed
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm sm:text-base">
                {workout.focus}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-4 sm:p-6">
          {workoutStage === 'countdown' && (
            <CountdownTimer
              countdownTimer={countdownTimer}
              currentExercise={currentExercise}
              onSkip={onSkipCountdown}
            />
          )}
          {workoutStage === 'exercise' && (
            <ExerciseView
              exercise={currentExercise}
              currentNumber={currentExerciseIndex + 1}
              totalExercises={workout.exercises.length}
              exerciseTimer={exerciseTimer}
              exerciseTimerRunning={exerciseTimerRunning}
              onToggleTimer={onToggleExerciseTimer}
              onPrevious={onPreviousExercise}
              onNext={onNextExercise}
            />
          )}
          {workoutStage === 'completed' && (
            <WorkoutCompleted
              workout={workout}
              timer={timer}
              onComplete={onCompleteWorkout}
            />
          )}
        </div>
      </div>
      
      {/* Sidebar with exercise list */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-semibold">Workout Progress</h3>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ 
                width: `${(workout.exercises.filter(e => e.completed).length / workout.exercises.length) * 100}%` 
              }}
            ></div>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 flex justify-between">
            <span>{workout.exercises.filter(e => e.completed).length} completed</span>
            <span>{workout.exercises.length} total</span>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3">Exercise List</h3>
          <div className="max-h-[250px] sm:max-h-[300px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-2">
            {workout.exercises.map((exercise, index) => (
              <div 
                key={exercise._id} 
                className={`p-2 sm:p-3 rounded-lg border flex justify-between items-center transition-all ${
                  index === currentExerciseIndex 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : exercise.completed 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full ${
                    index === currentExerciseIndex 
                      ? 'bg-blue-100 text-blue-700' 
                      : exercise.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-700'
                  } text-xs sm:text-sm font-medium`}>
                    {index + 1}
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <div className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{exercise.exerciseName}</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  </div>
                </div>
                <div>
                  {exercise.completed ? (
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                  ) : index === currentExerciseIndex ? (
                    <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  ) : (
                    <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkout; 