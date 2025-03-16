import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutPlan } from '../contexts/WorkoutPlanContext';
import NutritionPlanLoader from './NutritionPlanLoader';

interface Exercise {
  name: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  duration?: string;
  instructions?: string;
  muscleGroup?: string;
}

interface DailyWorkout {
  day: string;
  focus: string;
  description?: string;
  workoutType?: string;
  exercises: Exercise[];
  isRestDay: boolean;
}

interface ScheduleDay {
  day: string;
  workouts: {
    type: string;
    description: string;
  }[];
}

interface ParsedScheduleItem {
  day: string;
  activities: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  _id?: string;
  name: string;
  difficulty: string;
  userDetails?: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goals: string;
    preferences: string;
    limitations: string;
  };
  rawPlan?: string;
  schedule: ScheduleDay[];
  exercises: Exercise[];
  warmup?: {
    name: string;
    duration?: string;
    reps?: string;
  }[];
  cooldown?: {
    name: string;
    duration: string;
  }[];
  nutrition?: string[];
  recovery?: string[];
  createdAt?: string;
  isFavorite?: boolean;
  parsedSchedule?: ParsedScheduleItem[];
  weekSchedule?: {
    [key: string]: DailyWorkout;
  };
}

// Define days of the week in order
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WorkoutSchedule() {
  // Use the shared context instead of local state for plans
  const { workoutPlans, activePlan, setActivePlan, loading, error } = useWorkoutPlan();
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const navigate = useNavigate();

  useEffect(() => {
    if (activePlan) {
      console.log('Active plan in WorkoutSchedule:', activePlan.name);
      console.log('Active plan weekSchedule:', activePlan.weekSchedule ? Object.keys(activePlan.weekSchedule) : 'None');
      
      // Set default active day if not already set
      if (!activeDay) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setActiveDay(today);
        console.log('Setting active day to today:', today);
      }
    } else {
      console.log('No active plan in WorkoutSchedule');
    }
  }, [activePlan, activeDay]);

  useEffect(() => {
    // Set Monday as active by default when plans are loaded
    if (workoutPlans.length > 0 && !activeDay) {
      setActiveDay('Monday');
    }
    
    // Process the active plan to ensure parsedSchedule is available
    if (activePlan && (!activePlan.parsedSchedule || activePlan.parsedSchedule.length === 0)) {
      const processedPlan = {...activePlan, exercises: activePlan.exercises || []};
      processedPlan.parsedSchedule = processScheduleData(processedPlan);
      setActivePlan(processedPlan);
    }
  }, [workoutPlans, activeDay, activePlan]);

  // Process schedule data to create a more usable format for the UI
  const processScheduleData = (plan: WorkoutPlan): ParsedScheduleItem[] => {
    const parsedSchedule: ParsedScheduleItem[] = [];
    
    // If the plan has a weekSchedule property, use that
    if (plan.weekSchedule) {
      daysOfWeek.forEach(day => {
        if (plan.weekSchedule && plan.weekSchedule[day]) {
          const dailyWorkout = plan.weekSchedule[day];
          parsedSchedule.push({
            day,
            activities: dailyWorkout.focus,
            exercises: dailyWorkout.exercises || []
          });
        }
      });
    } else {
      // Otherwise, parse from the schedule property
      plan.schedule.forEach(scheduleDay => {
        const day = scheduleDay.day;
        const activities = scheduleDay.workouts.map(w => w.type).join(', ');
        
        // Find exercises for this day based on workout types
        const dayExercises = plan.exercises.filter(ex => {
          // Match exercises based on the workout type or muscle group
          // This is a simplified matching logic
          return scheduleDay.workouts.some(w => 
            ex.muscleGroup?.toLowerCase().includes(w.type.toLowerCase()) ||
            w.description.toLowerCase().includes(ex.name.toLowerCase())
          );
        });
        
        parsedSchedule.push({
          day,
          activities,
          exercises: dayExercises.length > 0 ? dayExercises : []
        });
      });
    }
    
    // Ensure all days of the week are represented
    daysOfWeek.forEach(day => {
      if (!parsedSchedule.some(item => item.day === day)) {
        parsedSchedule.push({
          day,
          activities: "Rest day",
          exercises: []
        });
      }
    });
    
    // Sort by day of week
    parsedSchedule.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    return parsedSchedule;
  };

  const handlePlanChange = (planId: string) => {
    const plan = workoutPlans.find(p => p._id === planId);
    if (plan) {
      // Process the plan to ensure parsedSchedule is available
      const processedPlan = {...plan, exercises: plan.exercises || []};
      if (!processedPlan.parsedSchedule || processedPlan.parsedSchedule.length === 0) {
        processedPlan.parsedSchedule = processScheduleData(processedPlan);
      }
      setActivePlan(processedPlan);
      setActiveDay('Monday'); // Reset to Monday when changing plans
    }
  };

  const handleDayClick = (day: string) => {
    setActiveDay(day);
  };

  const renderExercises = () => {
    if (!activePlan || !activeDay) return null;
    
    console.log(`Rendering exercises for ${activeDay}`);
    
    // Get exercises for the active day
    let exercises: Exercise[] = [];
    let dailyWorkout: DailyWorkout | null = null;
    
    // First check if we have a weekSchedule with the active day
    if (activePlan.weekSchedule && activePlan.weekSchedule[activeDay]) {
      dailyWorkout = activePlan.weekSchedule[activeDay];
      exercises = dailyWorkout.exercises || [];
      
      // Debug log to see what exercises we have
      console.log(`Found ${exercises.length} exercises for ${activeDay} in weekSchedule:`, exercises);
    } 
    // Fallback to parsedSchedule if no exercises found in weekSchedule
    else if (activePlan.parsedSchedule) {
      const scheduleItem = activePlan.parsedSchedule.find((s: ParsedScheduleItem) => s.day === activeDay);
      if (scheduleItem) {
        exercises = scheduleItem.exercises;
        console.log(`Found ${exercises.length} exercises for ${activeDay} in parsedSchedule:`, exercises);
      }
    }
    
    if (exercises.length === 0) {
      // Check if it's a rest day
      const isRestDay = activePlan.parsedSchedule?.some((s: ParsedScheduleItem) => 
        s.day === activeDay && s.activities.toLowerCase().includes('rest')
      ) || (dailyWorkout && dailyWorkout.isRestDay === true);
      
      console.log(`Is ${activeDay} a rest day?`, isRestDay);
      
      if (isRestDay) {
        return (
          <div className="p-4 text-center">
            <p className="text-lg font-semibold">Rest Day</p>
            <p className="text-gray-600">Take time to recover and prepare for your next workout.</p>
          </div>
        );
      }
      
      return (
        <div className="p-4 text-center">
          <p className="text-gray-600">No exercises scheduled for this day.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {exercises.map((exercise: Exercise, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            {exercise.sets && exercise.reps && (
              <p className="text-gray-700">
                {exercise.sets} sets × {exercise.reps} reps
              </p>
            )}
            {exercise.duration && (
              <p className="text-gray-700">Duration: {exercise.duration}</p>
            )}
            {exercise.rest && (
              <p className="text-gray-700">Rest: {exercise.rest}</p>
            )}
            {exercise.instructions && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{exercise.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const navigateToFitnessCoach = () => {
    navigate('/fitness-coach');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Workout Plans</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mr-2"
        >
          Retry
        </button>
        <button 
          onClick={navigateToFitnessCoach}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Create New Plan
        </button>
      </div>
    );
  }

  if (workoutPlans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">No Workout Plans Yet</h2>
        <p className="text-gray-600 mb-6">You haven't created any workout plans yet. Generate your personalized fitness plan to get started!</p>
        <button 
          onClick={navigateToFitnessCoach}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Create Workout Plan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'workout'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Workout Schedule
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'nutrition'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nutrition Plan
        </button>
      </div>

      {activeTab === 'workout' ? (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
            <h2 className="text-xl font-bold text-white">My Workout Schedule</h2>
          </div>
          
          {workoutPlans.length > 1 && (
            <div className="p-4 border-b">
              <label htmlFor="planSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Workout Plan
              </label>
              <select
                id="planSelect"
                value={activePlan?._id || ''}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                {workoutPlans.map(plan => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} ({plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {activePlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
              {/* Weekly Schedule */}
              <div className="border-r">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="font-medium text-gray-800">Weekly Schedule</h3>
                </div>
                <div className="overflow-y-auto max-h-96">
                  {activePlan.parsedSchedule && activePlan.parsedSchedule.length > 0 ? (
                    <ul className="divide-y">
                      {activePlan.parsedSchedule.map((scheduleItem: ParsedScheduleItem, index: number) => {
                        const isActive = activeDay === scheduleItem.day;
                        const isRestDay = scheduleItem.activities.toLowerCase().includes('rest');
                        
                        return (
                          <li 
                            key={index}
                            onClick={() => handleDayClick(scheduleItem.day)}
                            className={`p-3 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                          >
                            <div className="font-medium text-gray-900">{scheduleItem.day}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {isRestDay ? (
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {scheduleItem.activities}
                                </span>
                              ) : (
                                scheduleItem.activities
                              )}
                            </div>
                            {!isRestDay && scheduleItem.exercises.length > 0 && (
                              <div className="mt-1 text-xs text-blue-600">
                                {scheduleItem.exercises.length} exercise{scheduleItem.exercises.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No schedule available</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t">
                  <button 
                    onClick={navigateToFitnessCoach}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Create New Workout Plan
                  </button>
                </div>
              </div>
              
              {/* Exercise Details */}
              <div className="col-span-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="font-medium text-gray-800">
                    {activeDay}'s Workout {activePlan.weekSchedule && activePlan.weekSchedule[activeDay || ''] ? 
                      `- ${activePlan.weekSchedule[activeDay || ''].focus}` : ''}
                  </h3>
                </div>
                <div className="p-4">
                  {renderExercises()}
                  
                  {/* Warm-up Section */}
                  {activePlan.warmup && activePlan.warmup.length > 0 && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Warm-up</h3>
                      <ul className="space-y-2">
                        {activePlan.warmup.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {(item.duration || item.reps) && (
                                <span className="text-gray-600 ml-2">
                                  {item.duration ? `${item.duration}` : `${item.reps}`}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Cool-down Section */}
                  {activePlan.cooldown && activePlan.cooldown.length > 0 && (
                    <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Cool-down</h3>
                      <ul className="space-y-2">
                        {activePlan.cooldown.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.duration && (
                                <span className="text-gray-600 ml-2">{item.duration}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Recovery Tips */}
                  {activePlan.recovery && activePlan.recovery.length > 0 && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Recovery Tips</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {activePlan.recovery.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <NutritionPlanLoader />
      )}
    </div>
  );
}
