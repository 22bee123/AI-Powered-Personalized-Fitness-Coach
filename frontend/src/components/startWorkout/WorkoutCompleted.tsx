import React from 'react';
import { Workout, formatTime } from './types';
import { CheckCircleIcon, ArrowPathIcon, FireIcon, ClockIcon } from '@heroicons/react/24/outline';

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
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
      {/* Success animation */}
      <div className="relative mb-4 sm:mb-6">
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 blur-md animate-pulse transform scale-150"></div>
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center relative z-10 shadow-lg">
          <CheckCircleIcon className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
        </div>
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-800">Workout Complete!</h2>
      <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-10 max-w-md">
        Congratulations! You've successfully completed your workout. You're making great progress!
      </p>
      
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-10 w-full max-w-sm sm:max-w-md">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 transition-transform hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="text-gray-500 text-xs sm:text-sm mb-1">Total Time</div>
          <div className="font-bold text-xl sm:text-3xl text-indigo-600">{formatTime(timer)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 transition-transform hover:scale-105">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
              <FireIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="text-gray-500 text-xs sm:text-sm mb-1">Exercises</div>
          <div className="font-bold text-xl sm:text-3xl text-emerald-600">{workout.exercises.length}</div>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        className="py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-base sm:text-lg font-medium rounded-xl shadow-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-105"
      >
        <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        Complete & Continue
      </button>
    </div>
  );
};

export default WorkoutCompleted; 