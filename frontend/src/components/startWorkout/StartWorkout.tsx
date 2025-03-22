import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

// Types
interface Exercise {
  _id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  completed: boolean;
  duration: number;
}

interface Workout {
  _id: string;
  userId: string;
  workoutPlanId: string;
  day: string;
  focus: string;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  completed: boolean;
  exercises: Exercise[];
  warmupCompleted: boolean;
  cooldownCompleted: boolean;
}

interface WorkoutPlan {
  _id: string;
  userId: string;
  difficulty: string;
  weeklyPlan: {
    [key: string]: {
      focus: string;
      duration: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
      }[];
      warmup: string;
      cooldown: string;
      isCompleted: boolean;
    };
  };
  createdAt: string;
}

const StartWorkout: React.FC = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<number>(5);
  const [countdownInterval, setCountdownInterval] = useState<number | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState<number>(0);
  const [exerciseTimerRunning, setExerciseTimerRunning] = useState<boolean>(false);
  const [exerciseTimerInterval, setExerciseTimerInterval] = useState<number | null>(null);
  const [workoutStage, setWorkoutStage] = useState<'countdown' | 'exercise' | 'completed'>('countdown');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const countdownEndRef = useRef<HTMLAudioElement>(null);
  const exerciseCompleteRef = useRef<HTMLAudioElement>(null);

  // Fetch the latest workout plan and active workout on component mount
  useEffect(() => {
    fetchLatestWorkoutPlan();
    fetchActiveWorkout();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerInterval) {
      const interval = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (timerInterval) {
      window.clearInterval(timerInterval);
    }

    return () => {
      if (timerInterval) window.clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Exercise timer effect
  useEffect(() => {
    if (exerciseTimerRunning) {
      const interval = window.setInterval(() => {
        setExerciseTimer(prevTimer => prevTimer + 1);
      }, 1000);
      setExerciseTimerInterval(interval);
    } else if (exerciseTimerInterval) {
      window.clearInterval(exerciseTimerInterval);
    }

    return () => {
      if (exerciseTimerInterval) window.clearInterval(exerciseTimerInterval);
    };
  }, [exerciseTimerRunning]);

  // Fetch the latest workout plan
  const fetchLatestWorkoutPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/workouts/latest');
      setWorkoutPlan(response.data.workoutPlan);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to load workout plan. Please try again.');
        console.error('Error fetching workout plan:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch workout plan
  const fetchWorkoutPlan = async () => {
    try {
      const response = await api.get('/workout-plans/latest');
      setWorkoutPlan(response.data);
    } catch (err) {
      console.error('Error fetching workout plan:', err);
      setError('Failed to fetch workout plan. Please try again.');
    }
  };

  // Fetch active workout
  const fetchActiveWorkout = async () => {
    try {
      const response = await api.get('/start-workout/active');
      
      if (response.data) {
        setActiveWorkout(response.data.workout);
        
        // If there's an active workout, start the timer from where it left off
        const startTime = new Date(response.data.workout.startTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        setTimer(elapsedSeconds);
        startTimer();
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching active workout:', err);
        setError('Failed to fetch active workout. Please try again.');
      }
    }
  };

  // Start timer when workout begins
  const startTimer = () => {
    if (timerInterval) return;
    
    const interval = window.setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Stop timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Start a new workout for the selected day
  const startNewWorkout = async () => {
    if (!selectedDay || !workoutPlan) return;
    
    try {
      setLoading(true);
      
      const response = await api.post('/start-workout/start', { 
        day: selectedDay,
        workoutPlanId: workoutPlan._id
      });
      
      setActiveWorkout(response.data.workout);
      startTimer();
      setWorkoutStage('countdown');
      setCountdownTimer(5);
      startCountdown();
      setError(null);
    } catch (err) {
      console.error('Error starting workout:', err);
      setError('Failed to start workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle exercise completion status
  const toggleExerciseCompletion = async (exerciseId: string, completed: boolean) => {
    if (!activeWorkout) return;
    
    try {
      await api.put('/start-workout/exercise', {
        workoutId: activeWorkout._id,
        exerciseId,
        completed,
        duration: exerciseTimer
      });
      
      // Update local state
      setActiveWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        
        return {
          ...prevWorkout,
          exercises: prevWorkout.exercises.map(ex => 
            ex._id === exerciseId ? { ...ex, completed, duration: exerciseTimer } : ex
          )
        };
      });
      
      // Play sound if completing an exercise
      if (completed && soundEnabled && exerciseCompleteRef.current) {
        exerciseCompleteRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (err) {
      console.error('Error toggling exercise completion:', err);
      setError('Failed to update exercise status. Please try again.');
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset exercise timer
  const resetExerciseTimer = () => {
    setExerciseTimer(0);
    setExerciseTimerRunning(false);
    
    if (exerciseTimerInterval) {
      clearInterval(exerciseTimerInterval);
      setExerciseTimerInterval(null);
    }
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Go to previous exercise
  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      resetExerciseTimer();
      setWorkoutStage('exercise');
    }
  };

  // Go to next exercise
  const nextExercise = () => {
    if (!activeWorkout) return;
    
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    if (!currentExercise.completed) {
      toggleExerciseCompletion(currentExercise._id, true);
    }
    
    if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExerciseTimer();
      setWorkoutStage('countdown');
      setCountdownTimer(5);
      startCountdown();
    } else {
      // All exercises completed
      setWorkoutStage('completed');
      if (soundEnabled && exerciseCompleteRef.current) {
        exerciseCompleteRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    }
  };

  // Start countdown before exercise
  const startCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    const interval = window.setInterval(() => {
      setCountdownTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setWorkoutStage('exercise');
          if (soundEnabled && countdownEndRef.current) {
            countdownEndRef.current.play().catch(err => console.error('Error playing sound:', err));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };

  // Render workout selection
  const renderWorkoutSelection = () => {
    if (!workoutPlan) return null;
    
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Weekly Workout Plan</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {Object.entries(workoutPlan.weeklyPlan).map(([day, dayPlan]) => {
            const isCompleted = dayPlan.isCompleted;
            const isSelected = selectedDay === day;
            const isRestDay = dayPlan.focus.toLowerCase().includes('rest');
            
            return (
              <div
                key={day}
                onClick={() => !isRestDay && setSelectedDay(day)}
                className={`p-3 sm:p-6 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300 ring-offset-2 shadow-md' 
                    : isCompleted
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : isRestDay
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="font-bold text-lg sm:text-xl">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                  {isCompleted ? (
                    <div className="flex items-center text-green-500 text-xs sm:text-sm font-medium">
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                      Completed
                    </div>
                  ) : isRestDay ? (
                    <div className="text-gray-400 text-xs sm:text-sm font-medium">Rest Day</div>
                  ) : (
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 sm:py-1 rounded">
                      Active
                    </div>
                  )}
                </div>
                
                <div className="text-gray-700 text-sm sm:text-base font-medium">{dayPlan.focus}</div>
                
                {!isRestDay && (
                  <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500">
                    {dayPlan.exercises.length} exercises
                  </div>
                )}
                
                {isSelected && !isRestDay && !isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startNewWorkout();
                    }}
                    className="mt-3 sm:mt-4 w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    <PlayIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Start Workout
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render active workout
  const renderActiveWorkout = () => {
    if (!activeWorkout) return null;
    
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    
    return (
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Main workout area */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with day and timer */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 sm:p-4 flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-base sm:text-xl font-bold truncate">
                {selectedDay && selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Workout
              </h2>
              <span className="ml-2 sm:ml-4 bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleSound}
                className={`p-1.5 sm:p-2 rounded-full ${soundEnabled ? 'bg-white/20' : 'bg-white/10'}`}
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
          
          {/* Main content area */}
          <div className="p-4 sm:p-6">
            {workoutStage === 'countdown' && renderCountdown()}
            {workoutStage === 'exercise' && renderExercise(currentExercise)}
            {workoutStage === 'completed' && renderWorkoutCompleted()}
          </div>
        </div>
        
        {/* Sidebar with exercise list - becomes bottom section on mobile */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-3 sm:p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold">Workout Progress</h3>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ 
                  width: `${(activeWorkout.exercises.filter(e => e.completed).length / activeWorkout.exercises.length) * 100}%` 
                }}
              ></div>
            </div>
            <div className="mt-2 text-xs sm:text-sm text-gray-600 flex justify-between">
              <span>{activeWorkout.exercises.filter(e => e.completed).length} completed</span>
              <span>{activeWorkout.exercises.length} total</span>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-md font-medium mb-2 sm:mb-3">Exercise List</h3>
            <div className="max-h-[250px] sm:max-h-[300px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-2">
              {activeWorkout.exercises.map((exercise, index) => (
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

  // Render exercise
  const renderExercise = (exercise: Exercise) => {
    if (!exercise) return null;
    
    const totalExercises = activeWorkout?.exercises.length || 0;
    const currentNumber = currentExerciseIndex + 1;
    
    return (
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        {/* Exercise image and timer */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative mb-4 sm:mb-6">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
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
            
            {/* Circular timer overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-56 h-56 sm:w-72 sm:h-72" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(79, 70, 229, 0.9)"
                  strokeWidth="5"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (exerciseTimer / 60) * 283}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                {formatTime(exerciseTimer)}
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex space-x-4">
            <button
              onClick={() => setExerciseTimerRunning(!exerciseTimerRunning)}
              className="bg-indigo-600 text-white p-2 sm:p-3 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md"
            >
              {exerciseTimerRunning ? (
                <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Sets</div>
                <div className="font-bold text-lg sm:text-xl">{exercise.sets}</div>
              </div>
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Reps</div>
                <div className="font-bold text-lg sm:text-xl">{exercise.reps}</div>
              </div>
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Rest</div>
                <div className="font-bold text-lg sm:text-xl">{exercise.duration}s</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
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
              onClick={previousExercise}
              disabled={currentExerciseIndex === 0}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium ${
                currentExerciseIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              Previous
            </button>
            <button
              onClick={nextExercise}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm sm:text-base font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentExerciseIndex < (activeWorkout?.exercises.length || 0) - 1 ? (
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

  // Render countdown screen
  const renderCountdown = () => {
    if (!activeWorkout) return null;
    
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    
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
          onClick={() => {
            if (countdownInterval) {
              clearInterval(countdownInterval);
              setCountdownInterval(null);
            }
            setWorkoutStage('exercise');
          }}
          className="py-2 sm:py-3 px-4 sm:px-6 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Skip
        </button>
      </div>
    );
  };

  // Render completed screen
  const renderWorkoutCompleted = () => {
    if (!activeWorkout) return null;
    
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
            <div className="font-bold text-xl sm:text-3xl text-indigo-600">{activeWorkout.exercises.length}</div>
          </div>
        </div>
        
        <button
          onClick={completeWorkout}
          className="py-3 sm:py-4 px-6 sm:px-8 bg-emerald-600 text-white text-sm sm:text-lg font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
        >
          <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Finish & Continue to Next Day
        </button>
      </div>
    );
  };

  // Complete the workout
  const completeWorkout = async () => {
    if (!activeWorkout) return;
    
    try {
      setLoading(true);
      
      await api.put(`/start-workout/complete/${activeWorkout._id}`);
      
      stopTimer();
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      setWorkoutStage('countdown');
      setTimer(0);
      setError(null);
      
      // Refresh workout plan to show updated completion status
      await fetchWorkoutPlan();
      
      // Move to the next day in the workout plan
      if (workoutPlan && selectedDay) {
        const days = Object.keys(workoutPlan.weeklyPlan);
        const currentDayIndex = days.indexOf(selectedDay);
        if (currentDayIndex < days.length - 1) {
          // Move to the next day
          setSelectedDay(days[currentDayIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Error completing workout:', err);
      setError('Failed to complete workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Main render
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Audio elements */}
          <audio ref={countdownEndRef} src="/sounds/countdown-end.mp3" />
          <audio ref={exerciseCompleteRef} src="/sounds/exercise-complete.mp3" />
          
          {activeWorkout ? (
            renderActiveWorkout()
          ) : (
            renderWorkoutSelection()
          )}
        </>
      )}
    </div>
  );
};

export default StartWorkout;
