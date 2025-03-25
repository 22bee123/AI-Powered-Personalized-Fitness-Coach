import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { WorkoutPlan, Workout } from './types';
import WorkoutSelection from './WorkoutSelection';
import ActiveWorkout from './ActiveWorkout';

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
        setWorkoutPlan(null);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching workout plan:', err);
        if (workoutStage !== 'completed') {
          setError('Failed to load workout plan. Please try again.');
        }
      } else {
        setWorkoutPlan(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch active workout
  const fetchActiveWorkout = async () => {
    try {
      const response = await api.get('/start-workout/active');
      
      if (response.data) {
        setActiveWorkout(response.data.workout);
        setTimer(0); // Start with a fresh timer
        startTimer();
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
    setTimerInterval(1);
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
      setTimer(0); // Reset timer to 0
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
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExerciseTimer();
      setWorkoutStage('countdown');
      setCountdownTimer(5);
      startCountdown();
    } else {
      setWorkoutStage('completed');
    }
  };

  // Start countdown before exercise
  const startCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    if (soundEnabled && countdownEndRef.current) {
      countdownEndRef.current.pause();
      countdownEndRef.current.currentTime = 0;
      countdownEndRef.current.play().catch(err => console.error('Error playing sound:', err));
    }
    
    const interval = window.setInterval(() => {
      setCountdownTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCountdownInterval(null);
          
          if (countdownEndRef.current) {
            countdownEndRef.current.pause();
            countdownEndRef.current.currentTime = 0;
          }
          
          setWorkoutStage('exercise');
          setExerciseTimerRunning(true);
          
          return 0;
        }
        
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

  // Complete the workout
  const completeWorkout = async () => {
    if (!activeWorkout || !workoutPlan || !selectedDay) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await api.put(`/start-workout/complete/${activeWorkout._id}`);
      await api.post('/workout-complete', {
        workoutPlanId: workoutPlan._id,
        day: selectedDay,
        focus: workoutPlan.weeklyPlan[selectedDay].focus,
        totalDuration: timer,
        exercisesCompleted: activeWorkout.exercises.length
      });
      
      stopTimer();
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      setWorkoutStage('countdown');
      setTimer(0);
      
      try {
        await fetchLatestWorkoutPlan();
        
        if (workoutPlan && selectedDay) {
          const days = Object.keys(workoutPlan.weeklyPlan);
          const currentDayIndex = days.indexOf(selectedDay);
          
          setWorkoutPlan(prevPlan => {
            if (!prevPlan || !selectedDay) return null;
            
            const updatedPlan = {...prevPlan};
            if (updatedPlan.weeklyPlan[selectedDay]) {
              updatedPlan.weeklyPlan[selectedDay].isCompleted = true;
            }
            return updatedPlan;
          });
          
          if (currentDayIndex < days.length - 1) {
            setSelectedDay(days[currentDayIndex + 1]);
          }
        }
      } catch (planErr) {
        console.error('Error refreshing workout plan after completion:', planErr);
      }
      
      setShowWorkoutSelection(true);
    } catch (err) {
      console.error('Error completing workout:', err);
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
            <ActiveWorkout
              workout={activeWorkout}
              selectedDay={selectedDay}
              workoutStage={workoutStage}
              timer={timer}
              currentExerciseIndex={currentExerciseIndex}
              exerciseTimer={exerciseTimer}
              exerciseTimerRunning={exerciseTimerRunning}
              countdownTimer={countdownTimer}
              soundEnabled={soundEnabled}
              dayNumber={workoutPlan && selectedDay ? Object.keys(workoutPlan.weeklyPlan).indexOf(selectedDay) + 1 : undefined}
              onBack={() => {
                setActiveWorkout(null);
                stopTimer();
                setCurrentExerciseIndex(0);
                setWorkoutStage('countdown');
                setTimer(0);
              }}
              onToggleSound={toggleSound}
              onToggleExerciseTimer={() => setExerciseTimerRunning(!exerciseTimerRunning)}
              onSkipCountdown={() => {
                if (countdownInterval) {
                  clearInterval(countdownInterval);
                  setCountdownInterval(null);
                }
                if (countdownEndRef.current) {
                  countdownEndRef.current.pause();
                  countdownEndRef.current.currentTime = 0;
                }
                setWorkoutStage('exercise');
                setExerciseTimerRunning(true);
              }}
              onPreviousExercise={previousExercise}
              onNextExercise={nextExercise}
              onCompleteWorkout={completeWorkout}
            />
          ) : (
            <>
              {workoutPlan ? (
                <WorkoutSelection
                  workoutPlan={workoutPlan}
                  selectedDay={selectedDay}
                  activeWorkout={activeWorkout}
                  setSelectedDay={setSelectedDay}
                  onStartWorkout={startNewWorkout}
                  onContinueWorkout={() => setShowWorkoutSelection(false)}
                  setActiveTab={setActiveTab}
                />
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StartWorkout;

