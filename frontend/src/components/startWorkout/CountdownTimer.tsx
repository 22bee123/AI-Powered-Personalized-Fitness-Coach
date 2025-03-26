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
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-800">Get Ready!</h2>
        <p className="text-gray-600 text-base sm:text-lg">
          Next: <span className="font-semibold text-indigo-600">{currentExercise.exerciseName}</span>
        </p>
      </div>
      
      <div className="relative w-40 h-40 sm:w-56 sm:h-56 mb-6 sm:mb-10">
        {/* Background pulse animation */}
        <div className={`absolute inset-0 rounded-full bg-indigo-500 opacity-20 blur-lg transform scale-110 animate-pulse`}></div>
        
        {/* Main timer SVG */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(224, 224, 224, 0.6)"
            strokeWidth="6"
          />
          
          {/* Progress indicator with gradient */}
          <defs>
            <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#countdown-gradient)"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - (countdownTimer / 5) * 283}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
          
          {/* Inner accent circle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(79, 70, 229, 0.1)"
            strokeWidth="1"
          />
        </svg>
        
        {/* Timer number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl sm:text-7xl font-bold text-indigo-600 drop-shadow-sm">
            {countdownTimer}
          </div>
        </div>
      </div>
      
      <button
        onClick={onSkip}
        className="py-3 px-6 bg-indigo-600 text-white text-base font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105"
      >
        Skip Countdown
      </button>
    </div>
  );
};

export default CountdownTimer; 