import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { 
  PlayIcon, 
  PauseIcon, 
  ChevronLeftIcon,
  WifiIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowPathIcon,
  Battery100Icon
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
        <h2 className="text-xl font-semibold mb-4">Select a Day to Start</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(workoutPlan.weeklyPlan).map(([day, dayPlan]) => {
            const isCompleted = dayPlan.isCompleted;
            const isSelected = selectedDay === day;
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                disabled={isCompleted}
                className={`p-4 rounded-lg border flex flex-col items-center transition-colors
                  ${isSelected 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300 ring-offset-2' 
                      : isCompleted
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                <div className="text-sm mt-1">{dayPlan.focus}</div>
                {isCompleted && (
                  <div className="mt-2 flex items-center text-green-500 text-sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Completed
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {selectedDay && (
          <div className="flex justify-center">
            <button
              onClick={startNewWorkout}
              disabled={loading}
              className="w-full sm:w-auto py-3 px-6 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Workout
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render active workout
  const renderActiveWorkout = () => {
    if (!activeWorkout) return null;
    
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    
    return (
      <div className="flex flex-col items-center">
        {/* Phone-style UI */}
        <div className="w-full max-w-md bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl shadow-xl overflow-hidden border border-gray-300">
          {/* Status bar */}
          <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-xs">
            <div>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div className="font-semibold">
              {selectedDay && selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Workout
            </div>
            <div className="flex items-center">
              <WifiIcon className="h-3 w-3 mr-1" />
              <Battery100Icon className="h-4 w-4" />
            </div>
          </div>
          
          {/* Main content area */}
          <div className="bg-white h-[500px] relative">
            {workoutStage === 'countdown' && renderCountdown()}
            {workoutStage === 'exercise' && renderExercise(currentExercise)}
            {workoutStage === 'completed' && renderWorkoutCompleted()}
          </div>
        </div>
        
        {/* Sound toggle button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-full flex items-center ${
              soundEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {soundEnabled ? (
              <>
                <BoltIcon className="h-4 w-4 mr-2" />
                Sound On
              </>
            ) : (
              <>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Sound Off
              </>
            )}
          </button>
        </div>
        
        {/* Scrollable list of all exercises */}
        <div className="mt-6 w-full max-w-md bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">All Exercises</h3>
          <div className="max-h-60 overflow-y-auto pr-2">
            {activeWorkout.exercises.map((exercise, index) => (
              <div 
                key={exercise._id} 
                className={`mb-2 p-3 rounded-lg border flex justify-between items-center ${
                  index === currentExerciseIndex 
                    ? 'bg-blue-50 border-blue-300' 
                    : exercise.completed 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{exercise.exerciseName}</div>
                    <div className="text-sm text-gray-500">
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  </div>
                </div>
                <div>
                  {exercise.completed ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  ) : index === currentExerciseIndex ? (
                    <PlayIcon className="h-6 w-6 text-blue-500" />
                  ) : (
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
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
      <div className="h-full flex flex-col">
        {/* Exercise header */}
        <div className="p-4 text-center">
          <div className="text-sm text-gray-500">
            Exercise {currentNumber} of {totalExercises}
          </div>
          <h2 className="text-xl font-bold mt-1">{exercise.exerciseName}</h2>
        </div>
        
        {/* Exercise image and timer */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
            
            {/* Circular timer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-56 h-56" viewBox="0 0 100 100">
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
                  strokeDashoffset={283 - (exerciseTimer / 60) * 283}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute text-2xl font-bold">
                {formatTime(exerciseTimer)}
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setExerciseTimerRunning(!exerciseTimerRunning)}
              className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {exerciseTimerRunning ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Exercise details */}
        <div className="bg-gray-50 p-4 rounded-t-3xl border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Sets</div>
              <div className="font-bold text-lg">{exercise.sets}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Reps</div>
              <div className="font-bold text-lg">{exercise.reps}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Rest</div>
              <div className="font-bold text-lg">{exercise.duration}s</div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex space-x-3">
            <button
              onClick={previousExercise}
              disabled={currentExerciseIndex === 0}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center font-medium ${
                currentExerciseIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
            </button>
            <button
              onClick={nextExercise}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
              <ChevronRightIcon className="h-5 w-5 ml-1" />
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
      <div className="flex flex-col h-full max-w-xs mx-auto bg-gradient-to-b from-purple-400 to-indigo-500 rounded-3xl overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="px-4 py-2 flex justify-between items-center text-white text-xs">
          <div>9:41</div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>
        
        {/* Header */}
        <div className="px-4 py-2 flex justify-between items-center">
          <button className="text-white p-2 rounded-full">
            <span className="flex items-center">
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back
            </span>
          </button>
          <button 
            onClick={() => {
              setWorkoutStage('exercise');
              if (countdownInterval) clearInterval(countdownInterval);
            }}
            className="text-white p-2 rounded-full"
          >
            Skip
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-between px-6 py-8 text-white">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">Starting in</h3>
            <div className="text-7xl font-bold font-mono my-4">
              00:{countdownTimer.toString().padStart(2, '0')}
            </div>
            <p className="text-sm opacity-90">
              Prepare for training!
            </p>
          </div>
          
          <div className="w-full">
            <div className="relative">
              <img 
                src="/images/workout-preparation.png" 
                alt="Workout preparation" 
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Fallback if image doesn't exist */}
              <div className="absolute inset-0 flex items-center justify-center text-center opacity-70">
                <p>Get ready for: {currentExercise.exerciseName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render completed screen
  const renderWorkoutCompleted = () => {
    if (!activeWorkout) return null;
    
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
        <p className="text-gray-600 mb-6">
          Great job! You've completed your workout.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-xs mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-gray-500">Total Time:</div>
            <div className="font-bold text-xl">{formatTime(timer)}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-gray-500">Exercises Completed:</div>
            <div className="font-bold text-xl">{activeWorkout.exercises.length}</div>
          </div>
        </div>
        
        <button
          onClick={completeWorkout}
          className="w-full py-3 px-6 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
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
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Start Workout</h2>
          <p className="text-gray-600 mt-1">Track your workout progress in real-time</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <XMarkIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeWorkout ? (
            <div className="h-[650px] mx-auto bg-gray-100 p-4 rounded-lg">
              {/* Audio elements */}
              <audio ref={countdownEndRef} src="/sounds/countdown-end.mp3" />
              <audio ref={exerciseCompleteRef} src="/sounds/exercise-complete.mp3" />
              
              {renderActiveWorkout()}
            </div>
          ) : (
            <>
              {renderWorkoutSelection()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StartWorkout;
