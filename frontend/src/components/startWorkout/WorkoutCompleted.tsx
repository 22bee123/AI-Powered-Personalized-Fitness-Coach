import React from 'react';
import { Workout, formatTime } from './types';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface WorkoutCompletedProps {
  workout: Workout;
  timer: number;
  onComplete: () => void;
}

const WorkoutCompleted: React.FC<WorkoutCompletedProps> = ({
  workout,
  timer,
  onComplete
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center">
      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 sm:mb-6">
        <CheckCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-green-500" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Workout Complete!</h2>
      <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-8">
        Great job! You've completed your workout.
      </p>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-md">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
          <div className="text-gray-500 text-xs sm:text-sm mb-1">Total Time</div>
          <div className="font-bold text-xl sm:text-3xl text-indigo-600">{formatTime(timer)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
          <div className="text-gray-500 text-xs sm:text-sm mb-1">Exercises</div>
          <div className="font-bold text-xl sm:text-3xl text-indigo-600">{workout.exercises.length}</div>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        className="py-3 sm:py-4 px-6 sm:px-8 bg-emerald-600 text-white text-sm sm:text-lg font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
      >
        <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        Finish & Continue to Next Day
      </button>
    </div>
  );
};

export default WorkoutCompleted; 