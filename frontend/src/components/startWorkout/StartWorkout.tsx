import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  XMarkIcon,
  ClockIcon,
  FireIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

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
    };
  };
  createdAt: string;
}

const StartWorkout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState<number>(0);
  const [exerciseTimerRunning, setExerciseTimerRunning] = useState<boolean>(false);
  const [exerciseTimerInterval, setExerciseTimerInterval] = useState<number | null>(null);

  // Fetch the latest workout plan and active workout on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLatestWorkoutPlan();
      fetchActiveWorkout();
    }
  }, [isAuthenticated]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
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
  }, [isRunning]);

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

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Fetch active workout session
  const fetchActiveWorkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/start-workout/active');
      setActiveWorkout(response.data.workout);
      
      // If there's an active workout, set the timer and start it
      if (response.data.workout) {
        const startTime = new Date(response.data.workout.startTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        setTimer(elapsedSeconds);
        setIsRunning(true);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to load active workout. Please try again.');
        console.error('Error fetching active workout:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Start a new workout
  const startNewWorkout = async () => {
    if (!workoutPlan || !selectedDay) {
      setError('Please select a day to start the workout');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/start-workout/start', {
        workoutPlanId: workoutPlan._id,
        day: selectedDay
      });
      
      setActiveWorkout(response.data.workout);
      setIsRunning(true);
      setTimer(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start workout. Please try again.');
      console.error('Error starting workout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle exercise completion
  const toggleExerciseCompletion = async (exerciseId: string, completed: boolean) => {
    if (!activeWorkout) return;

    try {
      await api.put('/start-workout/exercise', {
        workoutId: activeWorkout._id,
        exerciseId,
        completed,
        duration: exerciseTimer
      });
      
      // Update the local state with the updated exercise
      setActiveWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        
        return {
          ...prevWorkout,
          exercises: prevWorkout.exercises.map(ex => 
            ex._id === exerciseId ? { ...ex, completed, duration: exerciseTimer } : ex
          )
        };
      });
      
      // Reset exercise timer
      setExerciseTimer(0);
      setExerciseTimerRunning(false);
      
    } catch (err: any) {
      setError('Failed to update exercise progress. Please try again.');
      console.error('Error updating exercise:', err);
    }
  };

  // Toggle warmup/cooldown completion
  const toggleWarmupCooldown = async (type: 'warmup' | 'cooldown') => {
    if (!activeWorkout) return;

    const payload = type === 'warmup' 
      ? { warmupCompleted: !activeWorkout.warmupCompleted } 
      : { cooldownCompleted: !activeWorkout.cooldownCompleted };

    try {
      await api.put('/start-workout/warmup-cooldown', {
        workoutId: activeWorkout._id,
        ...payload
      });
      
      // Update the local state
      setActiveWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        
        return {
          ...prevWorkout,
          ...payload
        };
      });
      
    } catch (err: any) {
      setError(`Failed to update ${type}. Please try again.`);
      console.error(`Error updating ${type}:`, err);
    }
  };

  // Complete the workout
  const completeWorkout = async () => {
    if (!activeWorkout) return;

    try {
      await api.put(`/start-workout/complete/${activeWorkout._id}`);
      
      // Stop the timer
      setIsRunning(false);
      
      // Reset the active workout
      setActiveWorkout(null);
      
      // Show success message or redirect
      alert('Workout completed successfully!');
      
    } catch (err: any) {
      setError('Failed to complete workout. Please try again.');
      console.error('Error completing workout:', err);
    }
  };

  // Toggle exercise timer
  const toggleExerciseTimer = () => {
    setExerciseTimerRunning(!exerciseTimerRunning);
  };

  // Reset exercise timer
  const resetExerciseTimer = () => {
    setExerciseTimer(0);
    setExerciseTimerRunning(false);
  };

  // Toggle exercise expansion
  const toggleExerciseExpansion = (exerciseId: string) => {
    if (expandedExercise === exerciseId) {
      setExpandedExercise(null);
    } else {
      setExpandedExercise(exerciseId);
      setExerciseTimer(0);
      setExerciseTimerRunning(false);
    }
  };

  // Format day name
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Render day selection
  const renderDaySelection = () => {
    if (!workoutPlan) return null;

    const days = Object.keys(workoutPlan.weeklyPlan);
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Select a day to start:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {days.map((day) => {
            const dayPlan = workoutPlan.weeklyPlan[day];
            const isRestDay = dayPlan.focus.toLowerCase().includes('rest');
            
            return (
              <button
                key={day}
                onClick={() => !isRestDay && setSelectedDay(day)}
                disabled={isRestDay}
                className={`p-4 rounded-lg border ${
                  selectedDay === day
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                    : isRestDay
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{formatDayName(day)}</div>
                <div className="text-sm mt-1">{dayPlan.focus}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render active workout
  const renderActiveWorkout = () => {
    if (!activeWorkout || !workoutPlan) return null;

    const dayWorkout = workoutPlan.weeklyPlan[activeWorkout.day];
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Workout header */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{formatDayName(activeWorkout.day)} Workout</h3>
              <p className="text-emerald-50">{activeWorkout.focus}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">{formatTime(timer)}</div>
              <div className="text-xs text-emerald-100">Total Time</div>
            </div>
          </div>
        </div>
        
        {/* Warmup section */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                activeWorkout.warmupCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <FireIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Warm-up</h4>
                <p className="text-sm text-gray-600">{dayWorkout.warmup}</p>
              </div>
            </div>
            <button
              onClick={() => toggleWarmupCooldown('warmup')}
              className={`p-2 rounded-full ${
                activeWorkout.warmupCompleted 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {activeWorkout.warmupCompleted ? (
                <CheckCircleSolidIcon className="h-6 w-6" />
              ) : (
                <CheckCircleIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Exercises section */}
        <div className="px-6 py-4">
          <h4 className="font-medium text-gray-900 mb-3">Exercises</h4>
          <div className="space-y-3">
            {activeWorkout.exercises.map((exercise) => (
              <div key={exercise._id} className="border rounded-lg overflow-hidden">
                <div 
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
                    exercise.completed ? 'bg-emerald-50' : 'bg-white'
                  }`}
                  onClick={() => toggleExerciseExpansion(exercise._id)}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      exercise.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {exercise.completed ? (
                        <CheckCircleSolidIcon className="h-5 w-5" />
                      ) : (
                        <span className="font-medium">{activeWorkout.exercises.indexOf(exercise) + 1}</span>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{exercise.exerciseName}</h5>
                      <p className="text-sm text-gray-600">{exercise.sets} sets x {exercise.reps}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {exercise.duration > 0 && (
                      <span className="text-sm text-gray-500 mr-2">
                        {formatTime(exercise.duration)}
                      </span>
                    )}
                    {expandedExercise === exercise._id ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Expanded exercise content */}
                {expandedExercise === exercise._id && (
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-lg font-mono font-medium">{formatTime(exerciseTimer)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={toggleExerciseTimer}
                          className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {exerciseTimerRunning ? (
                            <PauseIcon className="h-5 w-5" />
                          ) : (
                            <PlayIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={resetExerciseTimer}
                          className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExerciseCompletion(exercise._id, !exercise.completed)}
                      className={`w-full py-2 px-4 rounded-md font-medium ${
                        exercise.completed
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {exercise.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Cooldown section */}
        <div className="border-t border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                activeWorkout.cooldownCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Cool-down</h4>
                <p className="text-sm text-gray-600">{dayWorkout.cooldown}</p>
              </div>
            </div>
            <button
              onClick={() => toggleWarmupCooldown('cooldown')}
              className={`p-2 rounded-full ${
                activeWorkout.cooldownCompleted 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {activeWorkout.cooldownCompleted ? (
                <CheckCircleSolidIcon className="h-6 w-6" />
              ) : (
                <CheckCircleIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Complete workout button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={completeWorkout}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Complete Workout
          </button>
        </div>
      </div>
    );
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
            renderActiveWorkout()
          ) : (
            <>
              {renderDaySelection()}
              
              {selectedDay && (
                <button
                  onClick={startNewWorkout}
                  className="w-full sm:w-auto py-3 px-6 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start {formatDayName(selectedDay)} Workout
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StartWorkout;
