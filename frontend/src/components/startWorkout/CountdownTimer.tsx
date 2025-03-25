import React from 'react';
import { Exercise } from './types';

interface CountdownTimerProps {
  countdownTimer: number;
  currentExercise: Exercise;
  onSkip: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  countdownTimer,
  currentExercise,
  onSkip
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-8">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Get Ready!</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Your next exercise is <span className="font-semibold">{currentExercise.exerciseName}</span>
        </p>
      </div>
      
      <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-4 sm:mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="5"
            strokeDasharray="283"
            strokeDashoffset={283 - (countdownTimer / 5) * 283}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl sm:text-6xl font-bold text-indigo-600">
            {countdownTimer}
          </div>
        </div>
      </div>
      
      <button
        onClick={onSkip}
        className="py-2 sm:py-3 px-4 sm:px-6 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Skip
      </button>
    </div>
  );
};

export default CountdownTimer; 