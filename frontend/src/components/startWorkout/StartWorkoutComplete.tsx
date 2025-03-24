import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

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

interface WorkoutStats {
  totalWorkoutDays: number;
  completedDays: number;
  completionPercentage: number;
  totalDuration: number;
  restDays: number;
  remainingDays: number;
}

interface StartWorkoutCompleteProps {
  workoutPlan: WorkoutPlan;
  setActiveTab?: (tab: string) => void;
}

const StartWorkoutComplete: React.FC<StartWorkoutCompleteProps> = ({ workoutPlan, setActiveTab }) => {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workout stats when the component mounts or workoutPlan changes
  useEffect(() => {
    if (workoutPlan && workoutPlan._id) {
      fetchWorkoutStats(workoutPlan._id);
    }
  }, [workoutPlan]);

  // Fetch stats from the API
  const fetchWorkoutStats = async (workoutPlanId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/workout-complete/stats/${workoutPlanId}`);
      
      if (response.data && response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching workout stats:', err);
      // Don't set error - fallback to calculating from workoutPlan
    } finally {
      setLoading(false);
    }
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

  // Get stats from the local workoutPlan if API stats are not available
  const getLocalStats = (): WorkoutStats => {
    if (!workoutPlan) {
      return {
        totalWorkoutDays: 0,
        completedDays: 0,
        completionPercentage: 0,
        totalDuration: 0,
        restDays: 0,
        remainingDays: 0
      };
    }
    
    const totalWorkoutDays = Object.values(workoutPlan.weeklyPlan).filter(
      day => !day.focus.toLowerCase().includes('rest')
    ).length;
    
    const completedDays = Object.values(workoutPlan.weeklyPlan).filter(
      day => day.isCompleted
    ).length;
    
    const restDays = Object.values(workoutPlan.weeklyPlan).filter(
      day => day.focus.toLowerCase().includes('rest')
    ).length;
    
    return {
      totalWorkoutDays,
      completedDays,
      completionPercentage: (completedDays / totalWorkoutDays) * 100,
      totalDuration: 0, // We don't have this data locally
      restDays,
      remainingDays: totalWorkoutDays - completedDays
    };
  };

  // Use API stats if available, otherwise fall back to local calculation
  const displayStats = stats || getLocalStats();

  // If all workouts are completed, show a message
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

  // Otherwise, render stats cards
  return (
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
            {displayStats.totalWorkoutDays}
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
            {displayStats.completedDays}
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
            {displayStats.restDays}
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
            {displayStats.remainingDays}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartWorkoutComplete;
