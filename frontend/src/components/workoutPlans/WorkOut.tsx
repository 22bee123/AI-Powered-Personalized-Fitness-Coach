import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/ClerkAuthContext';
import api from '../../utils/api';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import WorkoutForm from './WorkoutForm';
import { generatePlans } from '../../utils/planGenerator';

// Types for workout plan
interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

interface DayWorkout {
  focus: string;
  duration: string;
  exercises: Exercise[];
  warmup: string;
  cooldown: string;
}

interface WeeklyPlan {
  monday: DayWorkout;
  tuesday: DayWorkout;
  wednesday: DayWorkout;
  thursday: DayWorkout;
  friday: DayWorkout;
  saturday: DayWorkout;
  sunday: DayWorkout;
  [key: string]: DayWorkout;
}

interface WorkoutPlan {
  _id: string;
  userId: string;
  difficulty: string;
  weeklyPlan: WeeklyPlan;
  createdAt: string;
}

const WorkOut: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Fetch the latest workout plan on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLatestWorkoutPlan();
    }
  }, [isAuthenticated]);

  // Fetch the latest workout plan
  const fetchLatestWorkoutPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/workouts/latest');
      setWorkoutPlan(response.data.workoutPlan);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        // Only show error if it's not a "not found" error
        setError('Failed to load workout plan. Please try again.');
        console.error('Error fetching workout plan:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate a new workout plan
  const generateWorkoutPlan = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      // Generate both workout and nutrition plans with minimal data
      const { workoutPlan } = await generatePlans({
        difficulty,
        age: '',
        gender: '',
        height: '',
        weight: '',
        fitnessLevel: 'beginner',
        fitnessGoals: [],
        healthConditions: [],
        preferredWorkoutDuration: '30-45',
        workoutDaysPerWeek: '3-4',
        equipmentAccess: 'limited',
        focusAreas: []
      });
      
      setWorkoutPlan(workoutPlan);
      setSuccess('Workout and nutrition plans generated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate plans. Please try again.');
      console.error('Error generating plans:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Handle workout plan generation from form
  const handleWorkoutGenerated = (workoutPlan: WorkoutPlan) => {
    setWorkoutPlan(workoutPlan);
    setShowForm(false);
    setSuccess('Workout and nutrition plans generated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Format day name to capitalize first letter
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Render difficulty selector
  const renderDifficultySelector = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Difficulty Level
        </label>
        <div className="flex space-x-4">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                difficulty === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render workout plan table
  const renderWorkoutPlan = () => {
    if (!workoutPlan) return null;

    const days = Object.keys(workoutPlan.weeklyPlan);
    
    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Day</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Focus</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Exercises</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Warm-up & Cool-down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {days.map((day) => {
              const dayPlan = workoutPlan.weeklyPlan[day];
              return (
                <tr key={day} className={dayPlan.focus.toLowerCase().includes('rest') ? 'bg-gray-50' : ''}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {formatDayName(day)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{dayPlan.focus}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{dayPlan.duration}</td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      {dayPlan.exercises.map((exercise, idx) => (
                        <li key={idx}>
                          {exercise.name} - {exercise.sets} sets x {exercise.reps}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="mb-2">
                      <span className="font-medium">Warm-up:</span> {dayPlan.warmup}
                    </div>
                    <div>
                      <span className="font-medium">Cool-down:</span> {dayPlan.cooldown}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Workout Plan</h2>
          <p className="text-gray-600 mt-1">Your personalized training schedule</p>
        </div>
      </div>

      {/* Toggle between quick generation and detailed form */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setShowForm(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            !showForm
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Quick Generate
        </button>
        <button
          onClick={() => setShowForm(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            showForm
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Personalized Form
        </button>
      </div>

      {/* Show either quick generation or detailed form */}
      {showForm ? (
        <WorkoutForm onWorkoutGenerated={handleWorkoutGenerated} setLoading={setLoading} />
      ) : (
        <>
          {/* Difficulty selector */}
          {renderDifficultySelector()}

          {/* Generate button */}
          <div className="mb-6">
            <button
              onClick={generateWorkoutPlan}
              disabled={generating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {generating ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Plan'
              )}
            </button>
          </div>
        </>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Workout plan table */}
      {!loading && workoutPlan && renderWorkoutPlan()}

      {/* No workout plan message */}
      {!loading && !workoutPlan && !generating && !showForm && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You don't have a workout plan yet.</p>
          <p className="text-gray-500">Select a difficulty level and click "Generate New Plan" to create one.</p>
          <p className="text-gray-500 mt-2">Or click "Personalized Form" for a more tailored workout plan.</p>
        </div>
      )}

      {/* Action buttons */}
      {workoutPlan && (
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Download PDF
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Share
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkOut;