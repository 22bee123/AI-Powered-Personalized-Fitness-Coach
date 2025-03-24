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
  ArrowPathIcon,
  CalendarIcon
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

interface StartWorkoutProps {
  setActiveTab?: (tab: string) => void;
}

const StartWorkout: React.FC<StartWorkoutProps> = ({ setActiveTab }) => {
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
  const [workoutStage, setWorkoutStage] = useState<'countdown' | 'exercise' | 'completed'>('countdown');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showWorkoutSelection, setShowWorkoutSelection] = useState<boolean>(true);
  const countdownEndRef = useRef<HTMLAudioElement>(null);
  const exerciseCompleteRef = useRef<HTMLAudioElement>(null);

  // Fetch the latest workout plan and active workout on component mount
  useEffect(() => {
    fetchLatestWorkoutPlan();
    fetchActiveWorkout();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number | null = null;
    
    if (timerInterval) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timerInterval]);

  // Exercise timer effect
  useEffect(() => {
    let interval: number | null = null;
    
    if (exerciseTimerRunning) {
      interval = window.setInterval(() => {
        setExerciseTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [exerciseTimerRunning]);

  // Fetch the latest workout plan
  const fetchLatestWorkoutPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/workouts/latest');
      
      if (response.data && response.data.workoutPlan) {
        setWorkoutPlan(response.data.workoutPlan);
        
        // Automatically select today's workout day
        if (response.data.workoutPlan) {
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const today = daysOfWeek[new Date().getDay()];
          
          // Check if today's workout exists in the plan
          if (response.data.workoutPlan.weeklyPlan[today]) {
            setSelectedDay(today);
          }
        }
      } else {
        // No workout plan found, but this is not an error
        setWorkoutPlan(null);
      }
    } catch (err: any) {
      // Don't show error for 404 (no workout plan) or when all workouts are completed
      if (err.response?.status !== 404) {
        console.error('Error fetching workout plan:', err);
        // Only set error if we're not in the workout completion page
        if (workoutStage !== 'completed') {
          setError('Failed to load workout plan. Please try again.');
        }
      } else {
        // 404 means no workout plan found, set workoutPlan to null
        setWorkoutPlan(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch workout plan
  const fetchWorkoutPlan = async () => {
    try {
      const response = await api.get('/workouts/latest');
      setWorkoutPlan(response.data.workoutPlan);
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
        
        // Always show the workout selection view first when component mounts
        setShowWorkoutSelection(true);
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
    setTimerInterval(1); // Just set to a truthy value to trigger the effect
  };

  // Stop timer
  const stopTimer = () => {
    setTimerInterval(null);
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
      setShowWorkoutSelection(false);
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
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExerciseTimer();
      setWorkoutStage('countdown');
      setCountdownTimer(5);
      startCountdown();
    } else {
      // All exercises completed
      setWorkoutStage('completed');
    }
  };

  // Start countdown before exercise
  const startCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    // Start playing the countdown sound at regular intervals
    if (soundEnabled && countdownEndRef.current) {
      // Reset and play sound for countdown
      countdownEndRef.current.pause();
      countdownEndRef.current.currentTime = 0;
      
      // Play sound every second of the countdown
      const playTick = () => {
        countdownEndRef.current?.play().catch(err => console.error('Error playing sound:', err));
      };
      
      // Play first tick immediately
      playTick();
    }
    
    const interval = window.setInterval(() => {
      setCountdownTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCountdownInterval(null); // Clear the interval state
          
          // Stop any playing sound
          if (countdownEndRef.current) {
            countdownEndRef.current.pause();
            countdownEndRef.current.currentTime = 0;
          }
          
          // Proceed to exercise phase
          setWorkoutStage('exercise');
          setExerciseTimerRunning(true);
          
          return 0;
        }
        
        // Play tick sound on each countdown number
        if (soundEnabled && countdownEndRef.current && prev > 1) {
          countdownEndRef.current.pause();
          countdownEndRef.current.currentTime = 0;
          countdownEndRef.current.play().catch(err => console.error('Error playing sound:', err));
        }
        
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };

  // Check if all workouts in the plan are completed
  const allWorkoutsCompleted = (): boolean => {
    if (!workoutPlan) return false;
    
    // Check if all non-rest days are completed
    const nonRestDays = Object.values(workoutPlan.weeklyPlan).filter(
      day => !day.focus.toLowerCase().includes('rest')
    );
    
    return nonRestDays.every(day => day.isCompleted);
  };

  // Render workout selection
  const renderWorkoutSelection = () => {
    if (!workoutPlan) return null;
    
    // Get today's day name
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = daysOfWeek[new Date().getDay()];
    
    // Check if all workouts are completed
    if (allWorkoutsCompleted()) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Workouts Completed!</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Congratulations! You've completed all workouts in your current plan. Would you like to create a new workout plan?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab ? setActiveTab('workout-form') : null}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Workout Plan
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Weekly Workout Plan</h1>
              <p className="text-indigo-100 text-sm md:text-base">
                Stay consistent with your training to reach your fitness goals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm md:text-base font-medium">
                Difficulty: {workoutPlan.difficulty}
              </div>
              <div className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm md:text-base font-medium">
                {Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length}/{Object.keys(workoutPlan.weeklyPlan).length} Completed
              </div>
            </div>
          </div>
          
          {/* Weekly progress bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Weekly Progress</span>
              <span className="text-sm font-medium">
                {Math.round((Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length / Object.keys(workoutPlan.weeklyPlan).length) * 100)}%
              </span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-white transition-all duration-500 ease-out"
                style={{width: `${(Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length / Object.keys(workoutPlan.weeklyPlan).length) * 100}%`}}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {Object.keys(workoutPlan.weeklyPlan).map((day, index) => {
                const isCompleted = workoutPlan.weeklyPlan[day].isCompleted;
                return (
                  <div 
                    key={day}
                    className={`h-6 w-6 flex items-center justify-center rounded-full text-xs ${
                      isCompleted
                        ? 'bg-white text-indigo-600'
                        : day === today 
                          ? 'bg-yellow-300 text-indigo-800' 
                          : 'bg-white/30 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Today's workout highlight */}
        {(() => {
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const today = daysOfWeek[new Date().getDay()];
          
          if (workoutPlan.weeklyPlan[today] && 
              !workoutPlan.weeklyPlan[today].isCompleted && 
              !workoutPlan.weeklyPlan[today].focus.toLowerCase().includes('rest')) {
            
            return (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="bg-yellow-300 text-yellow-800 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full inline-block mb-2">Today's Workout</div>
                      <h2 className="text-xl font-bold text-gray-900">{workoutPlan.weeklyPlan[today].focus}</h2>
                      <p className="text-gray-600 mt-1 max-w-md">
                        {workoutPlan.weeklyPlan[today].exercises.length} exercises • {workoutPlan.weeklyPlan[today].duration} • {workoutPlan.weeklyPlan[today].exercises.length} muscle groups
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(today);
                        startNewWorkout();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Start Today's Workout
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Workout days grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(workoutPlan.weeklyPlan).map(([day, dayPlan]) => {
            const isCompleted = dayPlan.isCompleted;
            const isSelected = selectedDay === day;
            const isRestDay = dayPlan.focus.toLowerCase().includes('rest');
              const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const todayIndex = new Date().getDay();
              const today = daysOfWeek[todayIndex];
              const isToday = day === today;
              const isPast = daysOfWeek.indexOf(day) < todayIndex && !isToday;
            
            return (
              <div
                key={day}
                  onClick={() => isToday && !isRestDay && !isCompleted ? setSelectedDay(day) : null}
                  className={`relative rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                  isSelected 
                      ? 'ring-4 ring-indigo-300 ring-offset-2 border-indigo-400 shadow-lg' 
                    : isCompleted
                        ? 'border-green-300 bg-green-50'
                      : isRestDay
                          ? 'border-gray-200 bg-gray-50'
                          : isToday
                            ? 'border-blue-400 bg-blue-50 hover:shadow-lg cursor-pointer transform hover:scale-105'
                            : isPast
                              ? 'border-gray-200 bg-gray-50 opacity-80'
                              : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  {/* Day header */}
                  <div className={`p-4 ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isRestDay 
                        ? 'bg-gray-100' 
                        : isToday 
                          ? 'bg-blue-100' 
                          : isPast 
                            ? 'bg-gray-100' 
                            : 'bg-indigo-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isRestDay 
                              ? 'bg-gray-400 text-white' 
                              : isToday 
                                ? 'bg-blue-500 text-white' 
                                : isPast 
                                  ? 'bg-gray-300 text-gray-700' 
                                  : 'bg-indigo-500 text-white'
                        }`}>
                          {day.charAt(0).toUpperCase()}
                    </div>
                        <div>
                          <div className="font-bold text-gray-900">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                          <div className="text-xs text-gray-500">Day {Object.keys(workoutPlan.weeklyPlan).indexOf(day) + 1}</div>
                        </div>
                      </div>
                      {isToday && (
                        <div className="bg-yellow-300 text-yellow-800 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                          Today
                    </div>
                  )}
                    </div>
                </div>
                
                  {/* Workout details */}
                  <div className="p-4">
                    <div className="mb-3">
                      <div className="text-lg font-semibold text-gray-900">{dayPlan.focus}</div>
                {!isRestDay && (
                        <div className="text-sm text-gray-600 mt-1">
                          {dayPlan.exercises.length} exercises • {dayPlan.duration}
                  </div>
                )}
                    </div>

                    {/* Exercise list preview */}
                    {!isRestDay && dayPlan.exercises.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {dayPlan.exercises.slice(0, 3).map((exercise, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <div className="h-2 w-2 rounded-full bg-indigo-400 mr-2"></div>
                            <span className="text-gray-700 truncate">{exercise.name}</span>
                          </div>
                        ))}
                        {dayPlan.exercises.length > 3 && (
                          <div className="text-xs text-indigo-600 font-medium">
                            +{dayPlan.exercises.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status and action */}
                    <div className="flex items-center justify-between mt-2">
                      {isCompleted ? (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          Completed
                        </div>
                      ) : isRestDay ? (
                        <div className="text-gray-500 text-sm font-medium">Rest Day</div>
                      ) : isToday ? (
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <PlayIcon className="h-5 w-5 mr-1" />
                          Ready to Start
                        </div>
                      ) : isPast ? (
                        <div className="text-gray-500 text-sm font-medium">Missed</div>
                      ) : (
                        <div className="text-gray-500 text-sm font-medium">
                          <ClockIcon className="h-5 w-5 mr-1 inline" />
                          Upcoming
                        </div>
                      )}
                      
                      {isSelected && isToday && !isRestDay && !isCompleted && (
                  <button
                          type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startNewWorkout();
                    }}
                          className="bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start
                  </button>
                )}
                    </div>
                  </div>
                  
                  {/* Bottom indicator */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isToday && !isRestDay 
                        ? 'bg-blue-500' 
                        : 'bg-transparent'
                  }`}></div>
              </div>
            );
          })}
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-indigo-600 font-medium">Total Workouts</div>
                <div className="bg-indigo-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Object.values(workoutPlan.weeklyPlan).filter(day => !day.focus.toLowerCase().includes('rest')).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-600 font-medium">Completed</div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-600 font-medium">Rest Days</div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Object.values(workoutPlan.weeklyPlan).filter(day => day.focus.toLowerCase().includes('rest')).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-600 font-medium">Remaining</div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Object.values(workoutPlan.weeklyPlan).filter(day => !day.isCompleted && !day.focus.toLowerCase().includes('rest')).length}
              </div>
            </div>
          </div>
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
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
                <button
                  onClick={() => {
                    setActiveWorkout(null);
                    stopTimer();
                    setCurrentExerciseIndex(0);
                    setWorkoutStage('countdown');
                    setTimer(0);
                  }}
                  className="mr-3 sm:mr-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Back to workout selection"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold">
                {formatTime(timer)}
              </span>
                </div>
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
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="bg-white/20 w-7 h-7 flex items-center justify-center rounded-full text-lg font-bold mr-2">
                    {selectedDay ? Object.keys(workoutPlan?.weeklyPlan || {}).indexOf(selectedDay) + 1 : ''}
                  </span>
                  <h2 className="text-base sm:text-xl font-bold">
                    {selectedDay && selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Workout
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-white/90 mt-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">
                    {activeWorkout?.exercises.length} Exercises
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">
                    {activeWorkout?.exercises.filter(e => e.completed).length} Completed
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm sm:text-base">
                  {workoutPlan?.weeklyPlan[selectedDay || '']?.focus}
                </div>
              </div>
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
            
            // Stop countdown sound if playing
            if (countdownEndRef.current) {
              countdownEndRef.current.pause();
              countdownEndRef.current.currentTime = 0;
            }
            
            setWorkoutStage('exercise');
            setExerciseTimerRunning(true);
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
      setError(null);
      
      await api.put(`/start-workout/complete/${activeWorkout._id}`);
      
      stopTimer();
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      setWorkoutStage('countdown');
      setTimer(0);
      
      // Refresh workout plan to show updated completion status
      try {
        await fetchLatestWorkoutPlan();
        
        // Move to the next day in the workout plan
        if (workoutPlan && selectedDay) {
          const days = Object.keys(workoutPlan.weeklyPlan);
          const currentDayIndex = days.indexOf(selectedDay);
          if (currentDayIndex < days.length - 1) {
            // Move to the next day
            setSelectedDay(days[currentDayIndex + 1]);
          }
        }
      } catch (planErr) {
        console.error('Error refreshing workout plan after completion:', planErr);
        // Continue with the flow even if refreshing the plan fails
      }
      
      setShowWorkoutSelection(true);
    } catch (err) {
      console.error('Error completing workout:', err);
      // Don't show error message on completion screen
      // Just return to workout selection
      setShowWorkoutSelection(true);
    } finally {
      setLoading(false);
    }
  };

  // Main render
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {error && !loading && (
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
          <audio ref={countdownEndRef} src="/sounds/countdown-end.mp3" preload="auto" />
          <audio ref={exerciseCompleteRef} src="/sounds/exercise-complete1.mp3" preload="auto" />
          
          {activeWorkout && !showWorkoutSelection ? (
            renderActiveWorkout()
          ) : (
            <>
              {workoutPlan ? (
                renderWorkoutSelection()
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Workout Plan Yet</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't created a workout plan yet. Create your personalized workout plan to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab ? setActiveTab('workout-form') : null}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Workout Plan
                  </button>
                </div>
              )}
              {activeWorkout && (
                <div className="bg-indigo-50 border border-indigo-100 mt-6 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-indigo-600 mr-2" />
                      <div className="text-indigo-900 font-medium">
                        You have an active workout in progress
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWorkoutSelection(false)}
                      className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Continue Workout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StartWorkout;

