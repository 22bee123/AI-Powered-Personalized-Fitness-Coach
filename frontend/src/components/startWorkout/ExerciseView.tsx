import React from 'react';
import { Exercise, formatTime } from './types';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ExerciseViewProps {
  exercise: Exercise;
  currentNumber: number;
  totalExercises: number;
  exerciseTimer: number;
  exerciseTimerRunning: boolean;
  onToggleTimer: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  currentNumber,
  totalExercises,
  exerciseTimer,
  exerciseTimerRunning,
  onToggleTimer,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
      {/* Exercise image and timer */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="relative mb-4 sm:mb-6">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
            <img 
              src={`/images/${exercise.exerciseName.toLowerCase().replace(/\s+/g, '-')}.jpg`} 
              alt={exercise.exerciseName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-exercise.jpg';
              }}
            />
          </div>
          
          {/* Enhanced Circular timer overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer glow effect */}
              <div className={`absolute inset-0 rounded-full bg-indigo-500 blur-md transform scale-110 transition-opacity duration-500 ease-in-out ${exerciseTimerRunning ? 'opacity-25' : 'opacity-15'}`}></div>
              
              {/* Timer track and progress */}
              <svg className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-lg" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                
                {/* Progress indicator */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.9)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (exerciseTimer / 60) * 283}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                  filter="drop-shadow(0 0 3px rgba(79, 70, 229, 0.6))"
                />
                
                {/* Inner accent circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg tracking-wide">
                  {formatTime(exerciseTimer)}
                </div>
                <span className={`text-xs sm:text-sm text-white/80 font-medium uppercase tracking-wider mt-1 transition-all duration-300 ${exerciseTimerRunning ? 'opacity-100' : 'opacity-70'}`}>
                  {exerciseTimerRunning ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Timer controls */}
        <div className="flex space-x-4 mt-2">
          <button
            onClick={onToggleTimer}
            className={`bg-indigo-600 text-white p-3 sm:p-4 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all ${
              exerciseTimerRunning ? 'scale-110' : 'scale-100'
            }`}
          >
            {exerciseTimerRunning ? (
              <PauseIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : (
              <PlayIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            )}
          </button>
        </div>
      </div>
      
      {/* Exercise details */}
      <div className="w-full md:w-1/2">
        <div className="mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">
            Exercise {currentNumber} of {totalExercises}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{exercise.exerciseName}</h2>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center shadow-sm">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Sets</div>
              <div className="font-bold text-lg sm:text-xl">{exercise.sets}</div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center shadow-sm">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Reps</div>
              <div className="font-bold text-lg sm:text-xl">{exercise.reps}</div>
            </div>
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center shadow-sm">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Rest</div>
              <div className="font-bold text-lg sm:text-xl">{exercise.duration}s</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 shadow-sm">
            <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Instructions</h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              Perform {exercise.sets} sets of {exercise.reps} repetitions with proper form. 
              Rest for {exercise.duration} seconds between sets. Focus on controlled movements.
            </p>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex space-x-3 sm:space-x-4">
          <button
            onClick={onPrevious}
            disabled={currentNumber === 1}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium transition-colors ${
              currentNumber === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            Previous
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm sm:text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
          >
            {currentNumber < totalExercises ? (
              <>
                Next
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
              </>
            ) : (
              <>
                Complete
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseView; 