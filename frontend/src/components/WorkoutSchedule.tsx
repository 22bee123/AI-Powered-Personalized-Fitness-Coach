import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  description: string;
  workoutType: string;
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

interface WorkoutPlan {
  _id?: string;
  name: string;
  difficulty: string;
  userDetails: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goals: string;
    preferences: string;
    limitations: string;
  };
  rawPlan: string;
  schedule: ScheduleDay[];
  exercises: Exercise[];
  warmup: {
    name: string;
    duration?: string;
    reps?: string;
  }[];
  cooldown: {
    name: string;
    duration: string;
  }[];
  nutrition: string[];
  recovery: string[];
  createdAt: string;
  isFavorite: boolean;
  parsedSchedule?: {
    day: string;
    activities: string;
    exercises: Exercise[];
  }[];
  weekSchedule?: {
    Monday: DailyWorkout;
    Tuesday: DailyWorkout;
    Wednesday: DailyWorkout;
    Thursday: DailyWorkout;
    Friday: DailyWorkout;
    Saturday: DailyWorkout;
    Sunday: DailyWorkout;
  };
}

// Define days of the week in order
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WorkoutSchedule() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user123";

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3000/api/fitness-coach/user-workout-plans/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workout plans: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.plans && data.plans.length > 0) {
          // Process the plans to create a structured schedule
          const processedPlans = data.plans.map((plan: WorkoutPlan) => {
            return {
              ...plan,
              parsedSchedule: processScheduleData(plan)
            };
          });
          
          setWorkoutPlans(processedPlans);
          
          // Set the first plan as active by default
          setActivePlan(processedPlans[0]);
          
          // Set Monday as active by default
          setActiveDay('Monday');
        } else {
          console.log('No workout plans found');
        }
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setError('Failed to load workout plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [userId]);

  // Function to process the schedule and exercises data from the database
  const processScheduleData = (plan: WorkoutPlan) => {
    const result: {
      day: string;
      activities: string;
      exercises: Exercise[];
    }[] = [];

    // First, try to use the structured schedule data if available
    if (plan.schedule && plan.schedule.length > 0) {
      // Map through each day in the schedule
      plan.schedule.forEach(scheduleItem => {
        // Extract the day name
        const day = scheduleItem.day;
        
        // Combine all workout descriptions for this day
        const activities = scheduleItem.workouts
          .map(workout => `${workout.type}: ${workout.description}`)
          .join(', ');
        
        // Find exercises for this day based on workout types and descriptions
        const dayExercises = findExercisesForDay(scheduleItem, plan.exercises);
        
        result.push({
          day,
          activities,
          exercises: dayExercises
        });
      });
    } else {
      // Fallback to parsing from rawPlan if structured data isn't available
      const parsedData = parseRawPlan(plan.rawPlan, plan.exercises);
      result.push(...parsedData);
    }

    // Ensure all days of the week are represented
    daysOfWeek.forEach(day => {
      if (!result.some(entry => entry.day.toLowerCase() === day.toLowerCase())) {
        // If a day is missing, add it with "Rest" as the activity
        result.push({
          day,
          activities: "Rest day",
          exercises: []
        });
      }
    });
    
    // Sort the schedule by day of week
    result.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    return result;
  };

  // Helper function to find exercises for a specific day
  const findExercisesForDay = (scheduleDay: ScheduleDay, allExercises: Exercise[]) => {
    // If it's a rest day, return empty array
    const isRestDay = scheduleDay.workouts.some(w => 
      w.type.toLowerCase() === 'rest' || 
      w.description.toLowerCase().includes('rest')
    );
    
    if (isRestDay && !scheduleDay.workouts.some(w => w.description.toLowerCase().includes('exercise'))) {
      return [];
    }
    
    // Combine all workout descriptions to search for exercise mentions
    const allDescriptions = scheduleDay.workouts.map(w => w.description).join(' ');
    const allTypes = scheduleDay.workouts.map(w => w.type).join(' ');
    const combinedText = `${allTypes} ${allDescriptions}`.toLowerCase();
    
    // Check if all exercises are mentioned
    if (combinedText.includes('all exercises')) {
      return [...allExercises];
    }
    
    // Look for specific exercise mentions in the descriptions
    const matchedExercises = allExercises.filter(exercise => 
      combinedText.includes(exercise.name.toLowerCase())
    );
    
    // If we found specific matches, return those
    if (matchedExercises.length > 0) {
      return matchedExercises;
    }
    
    // Check for focus areas (upper body, lower body, etc.)
    const focusMatches = {
      'upper body': allExercises.filter(e => 
        ['chest', 'shoulder', 'arm', 'back', 'push-up', 'pull-up', 'bench press', 'row'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'lower body': allExercises.filter(e => 
        ['leg', 'squat', 'lunge', 'calf', 'deadlift', 'glute', 'hamstring', 'quad'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'core': allExercises.filter(e => 
        ['core', 'ab', 'plank', 'crunch', 'sit-up', 'twist'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'cardio': allExercises.filter(e => 
        ['run', 'jog', 'sprint', 'jump', 'burpee', 'cardio', 'jumping jack'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'full body': allExercises.filter(e => 
        ['full body', 'compound', 'deadlift', 'squat', 'press'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      )
    };
    
    // Check if any focus areas are mentioned in the descriptions
    for (const [focus, exercises] of Object.entries(focusMatches)) {
      if (combinedText.includes(focus) && exercises.length > 0) {
        return exercises;
      }
    }
    
    // Check for specific muscle groups
    const muscleGroups = [
      'chest', 'back', 'legs', 'shoulders', 'arms', 'biceps', 
      'triceps', 'abs', 'core', 'glutes', 'quads', 'hamstrings'
    ];
    
    for (const muscleGroup of muscleGroups) {
      if (combinedText.includes(muscleGroup)) {
        const muscleExercises = allExercises.filter(e => 
          e.name.toLowerCase().includes(muscleGroup) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(muscleGroup))
        );
        
        if (muscleExercises.length > 0) {
          return muscleExercises;
        }
      }
    }
    
    // Check workout types
    const workoutTypes = scheduleDay.workouts.map(w => w.type.toLowerCase());
    
    if (workoutTypes.includes('strength') || workoutTypes.includes('resistance')) {
      const strengthExercises = allExercises.filter(e => 
        !e.name.toLowerCase().includes('cardio') &&
        !e.name.toLowerCase().includes('run') &&
        !e.name.toLowerCase().includes('jog')
      );
      
      return strengthExercises.length > 0 ? strengthExercises : allExercises.slice(0, 5);
    }
    
    if (workoutTypes.includes('cardio')) {
      const cardioExercises = allExercises.filter(e => 
        ['run', 'jog', 'sprint', 'jump', 'burpee', 'cardio', 'jumping jack', 'mountain climber'].some(term => 
          e.name.toLowerCase().includes(term) ||
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes('cardio'))
        )
      );
      
      return cardioExercises.length > 0 ? cardioExercises : allExercises.slice(0, 3);
    }
    
    // If we still don't have matches, return a subset of exercises as fallback
    // Instead of returning an empty array, return some exercises based on the day of the week
    // This ensures that exercises are always displayed
    return allExercises.slice(0, Math.min(5, allExercises.length));
  };
  
  // Fallback function to parse schedule from raw plan text
  const parseRawPlan = (rawPlan: string, allExercises: Exercise[]) => {
    const result: {
      day: string;
      activities: string;
      exercises: Exercise[];
    }[] = [];
    
    // Extract schedule section
    const scheduleMatch = rawPlan.match(/schedule:?([\s\S]*?)(?:exercises:|warm[- ]?up:|cool[- ]?down:|nutrition:|recovery:|$)/i);
    if (scheduleMatch && scheduleMatch[1]) {
      const scheduleText = scheduleMatch[1].trim();
      
      // Process each line of the schedule
      scheduleText
        .split(/\n/)
        .filter(line => line.trim().length > 0)
        .forEach(line => {
          // Clean up the line, removing bullets/numbers
          const cleanLine = line.trim().replace(/^[*-]\s*/, '');
          
          // Try to extract day and activities
          const dayMatch = cleanLine.match(/^([^:]+):(.*)/);
          if (dayMatch) {
            const dayPart = dayMatch[1].trim();
            const activitiesPart = dayMatch[2].trim();
            
            // Handle cases like "Saturday & Sunday" or multiple days
            const days: string[] = [];
            
            // Check for day ranges or multiple days
            if (dayPart.includes('&') || dayPart.includes(',') || dayPart.includes(' and ')) {
              const dayParts = dayPart.split(/&|,|\sand\s/);
              dayParts.forEach(part => {
                const trimmedPart = part.trim();
                // Find which day of the week this matches
                const matchedDay = daysOfWeek.find(day => 
                  trimmedPart.toLowerCase().includes(day.toLowerCase())
                );
                if (matchedDay) days.push(matchedDay);
              });
            } else {
              // Find which day of the week this matches
              const matchedDay = daysOfWeek.find(day => 
                dayPart.toLowerCase().includes(day.toLowerCase())
              );
              if (matchedDay) days.push(matchedDay);
            }
            
            // For each identified day, create a schedule entry
            days.forEach(day => {
              // Find exercises that match this day's activities
              const dayExercises = findExercisesForActivities(activitiesPart, allExercises);
              
              result.push({
                day,
                activities: activitiesPart,
                exercises: dayExercises
              });
            });
          }
        });
    }
    
    return result;
  };
  
  // Helper function to find exercises that match activities (for rawPlan parsing)
  const findExercisesForActivities = (activities: string, allExercises: Exercise[]) => {
    // If the activities mention "all exercises", return all exercises
    if (activities.toLowerCase().includes('all exercises')) {
      return [...allExercises];
    }
    
    // If it's a rest day, return empty array
    if (activities.toLowerCase().includes('rest') && 
        !activities.toLowerCase().includes('exercise')) {
      return [];
    }
    
    // Look for specific exercise mentions
    const matchedExercises = allExercises.filter(exercise => 
      activities.toLowerCase().includes(exercise.name.toLowerCase())
    );
    
    // If we found specific matches, return those
    if (matchedExercises.length > 0) {
      return matchedExercises;
    }
    
    // Check for focus areas (upper body, lower body, etc.)
    const focusMatches = {
      'upper body': allExercises.filter(e => 
        ['chest', 'shoulder', 'arm', 'back', 'push-up', 'pull-up', 'bench press', 'row'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'lower body': allExercises.filter(e => 
        ['leg', 'squat', 'lunge', 'calf', 'deadlift', 'glute', 'hamstring', 'quad'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'core': allExercises.filter(e => 
        ['core', 'ab', 'plank', 'crunch', 'sit-up', 'twist'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'cardio': allExercises.filter(e => 
        ['run', 'jog', 'sprint', 'jump', 'burpee', 'cardio', 'jumping jack'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      ),
      'full body': allExercises.filter(e => 
        ['full body', 'compound', 'deadlift', 'squat', 'press'].some(term => 
          e.name.toLowerCase().includes(term) || 
          (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        )
      )
    };
    
    // Check if any focus areas are mentioned in the activities
    for (const [focus, exercises] of Object.entries(focusMatches)) {
      if (activities.toLowerCase().includes(focus) && exercises.length > 0) {
        return exercises;
      }
    }
    
    // If we still don't have matches, return a subset of exercises based on the day
    // This ensures that exercises are always displayed
    return allExercises.slice(0, Math.min(5, allExercises.length));
  };

  const handlePlanChange = (planId: string) => {
    const plan = workoutPlans.find(p => p._id === planId);
    if (plan) {
      setActivePlan(plan);
      setActiveDay('Monday'); // Reset to Monday when changing plans
    }
  };

  const handleDayClick = (day: string) => {
    setActiveDay(day);
  };

  const getExercisesForDay = () => {
    if (!activePlan || !activeDay) return [];
    
    // First, try to use the new weekSchedule structure if available
    if (activePlan.weekSchedule && activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule]) {
      const dayWorkout = activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule];
      return dayWorkout.exercises || [];
    }
    
    // Fallback to parsedSchedule if weekSchedule is not available
    const daySchedule = activePlan.parsedSchedule?.find(entry => 
      entry.day.toLowerCase() === activeDay.toLowerCase()
    );
    
    if (!daySchedule) return [];
    
    // If there are exercises for this day, return them
    if (daySchedule.exercises && daySchedule.exercises.length > 0) {
      return daySchedule.exercises;
    }
    
    // If no exercises are found but it's not a rest day, return some default exercises
    if (!daySchedule.activities.toLowerCase().includes('rest')) {
      // Return a subset of all available exercises as a fallback
      return activePlan.exercises.slice(0, Math.min(5, activePlan.exercises.length));
    }
    
    return [];
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
                  {activePlan.parsedSchedule.map((scheduleItem, index) => {
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
                <div className="p-4 text-center text-gray-500">No schedule available</div>
              )}
            </div>
          </div>
          
          {/* Daily Exercises */}
          <div className="col-span-2">
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">
                {activeDay ? `${activeDay}'s Workout` : 'Daily Workout'}
              </h3>
            </div>
            <div className="overflow-y-auto max-h-96 p-4">
              {activeDay && (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {activeDay}'s Workout
                    </h3>
                    
                    {/* Display workout focus and type */}
                    {activePlan.weekSchedule && activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule] ? (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-700 mr-2">Focus:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule].focus}
                          </span>
                          
                          {!activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule].isRestDay && (
                            <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule].workoutType.charAt(0).toUpperCase() + 
                               activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule].workoutType.slice(1)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600">
                          {activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule].description}
                        </p>
                      </div>
                    ) : activePlan.parsedSchedule?.find(s => s.day === activeDay) ? (
                      <div className="mb-4">
                        <p className="text-gray-600">
                          {activePlan.parsedSchedule.find(s => s.day === activeDay)?.activities}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Display exercises */}
                  {getExercisesForDay().length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-medium text-gray-800 mb-2">Exercises for Today:</h4>
                      {getExercisesForDay().map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                              {index + 1}
                            </div>
                            <h4 className="font-semibold text-lg text-gray-900">{exercise.name}</h4>
                            {exercise.muscleGroup && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {exercise.muscleGroup}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {exercise.sets && (
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <span className="block text-sm text-gray-500">Sets</span>
                                <span className="font-medium">{exercise.sets}</span>
                              </div>
                            )}
                            {exercise.reps && (
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <span className="block text-sm text-gray-500">Reps</span>
                                <span className="font-medium">{exercise.reps}</span>
                              </div>
                            )}
                            {exercise.rest && (
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <span className="block text-sm text-gray-500">Rest</span>
                                <span className="font-medium">{exercise.rest}</span>
                              </div>
                            )}
                            {exercise.duration && !exercise.reps && (
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <span className="block text-sm text-gray-500">Duration</span>
                                <span className="font-medium">{exercise.duration}</span>
                              </div>
                            )}
                          </div>
                          
                          {exercise.instructions && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <span className="font-medium block mb-1">Instructions:</span>
                              <p className="text-sm text-gray-700">{exercise.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      {(activePlan.weekSchedule && 
                        activePlan.weekSchedule[activeDay as keyof typeof activePlan.weekSchedule]?.isRestDay) || 
                       activePlan.parsedSchedule?.find(s => s.day === activeDay)?.activities.toLowerCase().includes('rest') ? (
                        <div className="bg-gray-50 p-4 rounded-lg inline-block">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <p className="text-gray-600 font-medium">Rest Day</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Take time to recover and prepare for your next workout!
                          </p>
                        </div>
                      ) : (
                        <div className="bg-blue-50 p-4 rounded-lg inline-block">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="text-blue-600 font-medium">No Specific Exercises</p>
                          <p className="text-sm text-blue-500 mt-1">
                            Try creating a new workout plan with more detailed exercises.
                          </p>
                          <button 
                            onClick={navigateToFitnessCoach}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
                          >
                            Create New Plan
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">
            {activePlan ? `${activePlan.name} • ${activePlan.difficulty.charAt(0).toUpperCase() + activePlan.difficulty.slice(1)} Level` : ''}
          </span>
        </div>
        <button 
          onClick={navigateToFitnessCoach}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Manage Workout Plans
        </button>
      </div>
    </div>
  );
}
