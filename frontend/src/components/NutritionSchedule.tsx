import { useState, useEffect } from 'react';
import { useNutritionPlan } from '../contexts/NutritionPlanContext';
import { useWorkoutPlan } from '../contexts/WorkoutPlanContext';
import NutritionPlanForm from './NutritionPlanForm';

interface Meal {
  name: string;
  description?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
  ingredients?: string[];
  instructions?: string;
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// Define days of the week in order
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function NutritionSchedule() {
  const { nutritionPlans, activePlan, setActivePlan, loading, error, fetchNutritionPlansByWorkout, fetchUserNutritionPlans } = useNutritionPlan();
  const { activePlan: activeWorkoutPlan } = useWorkoutPlan();
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [localLoading, setLocalLoading] = useState(loading);
  const [userProfile, setUserProfile] = useState<{
    gender?: string;
    weight?: string;
    height?: string;
    age?: string;
    goals?: string;
  } | null>(null);
  
  // Default user ID for development
  const userId = "user123";
  
  // Debug logging for component state
  console.log('NutritionSchedule: Component rendered with state:', { 
    nutritionPlansCount: nutritionPlans.length,
    hasActivePlan: !!activePlan,
    loading,
    localLoading,
    error,
    activeDay,
    userId,
    userProfile
  });
  
  // Fetch user profile data from the active workout plan
  useEffect(() => {
    if (activeWorkoutPlan?.userDetails) {
      console.log('NutritionSchedule: Setting user profile from workout plan:', activeWorkoutPlan.userDetails);
      setUserProfile({
        gender: activeWorkoutPlan.userDetails.gender,
        weight: activeWorkoutPlan.userDetails.weight,
        height: activeWorkoutPlan.userDetails.height,
        age: activeWorkoutPlan.userDetails.age,
        goals: activeWorkoutPlan.userDetails.goals
      });
    } else {
      console.log('NutritionSchedule: No user details available in active workout plan');
    }
  }, [activeWorkoutPlan]);

  // Use a timeout to prevent getting stuck in loading state
  useEffect(() => {
    if (loading) {
      setLocalLoading(true);
      // Set a timeout to force loading to false after 5 seconds
      const timer = setTimeout(() => {
        console.log('NutritionSchedule: Loading timeout reached, forcing loading state to false');
        setLocalLoading(false);
        
        // If we still don't have nutrition plans, try to fetch them again or use default
        if (nutritionPlans.length === 0) {
          console.log('NutritionSchedule: No nutrition plans after timeout, trying to fetch again');
          fetchUserNutritionPlans(userId);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setLocalLoading(false);
    }
  }, [loading, nutritionPlans.length, fetchUserNutritionPlans]);
  
  if (activePlan) {
    console.log('NutritionSchedule: Active plan details:', {
      name: activePlan.name,
      hasWeekSchedule: !!activePlan.weekSchedule,
      weekScheduleDays: activePlan.weekSchedule ? Object.keys(activePlan.weekSchedule) : []
    });
  }

  useEffect(() => {
    // Set Monday as active by default when plans are loaded
    if (nutritionPlans.length > 0 && !activeDay) {
      console.log('NutritionSchedule: Setting Monday as active day');
      setActiveDay('Monday');
    }
  }, [nutritionPlans, activeDay]);

  useEffect(() => {
    // Fetch nutrition plans for the active workout plan
    if (activeWorkoutPlan?._id) {
      console.log('NutritionSchedule: Fetching nutrition plans for workout plan:', activeWorkoutPlan._id);
      fetchNutritionPlansByWorkout(activeWorkoutPlan._id);
    } else {
      console.log('NutritionSchedule: No active workout plan available');
    }
  }, [activeWorkoutPlan, fetchNutritionPlansByWorkout]);

  // Initial fetch of nutrition plans
  useEffect(() => {
    console.log('NutritionSchedule: Initial fetch of nutrition plans for user:', userId);
    fetchUserNutritionPlans(userId);
  }, [fetchUserNutritionPlans]);

  const handlePlanChange = (planId: string) => {
    const plan = nutritionPlans.find(p => p._id === planId);
    if (plan) {
      setActivePlan(plan);
      setActiveDay('Monday'); // Reset to Monday when changing plans
    }
  };

  const handleDayClick = (day: string) => {
    setActiveDay(day);
  };

  const renderMeals = () => {
    if (!activePlan || !activeDay) return null;
    
    // Get meals for the active day
    const dailyNutrition = activePlan.weekSchedule[activeDay];
    
    if (!dailyNutrition || !dailyNutrition.meals || dailyNutrition.meals.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-gray-600">No meals scheduled for this day.</p>
        </div>
      );
    }
    
    // Group meals by time of day
    const mealsByTime: Record<string, Meal[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    dailyNutrition.meals.forEach(meal => {
      if (mealsByTime[meal.timeOfDay]) {
        mealsByTime[meal.timeOfDay].push(meal);
      }
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(mealsByTime).map(([timeOfDay, meals]) => {
          if (meals.length === 0) return null;
          
          return (
            <div key={timeOfDay} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold text-lg capitalize mb-3">{timeOfDay}</h3>
              <div className="space-y-4">
                {meals.map((meal, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold text-md">{meal.name}</h4>
                    {meal.description && (
                      <p className="text-gray-600 text-sm mt-1">{meal.description}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      {meal.calories && (
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="font-medium">Calories:</span> {meal.calories}
                        </div>
                      )}
                      {meal.protein && (
                        <div className="bg-green-50 p-2 rounded">
                          <span className="font-medium">Protein:</span> {meal.protein}
                        </div>
                      )}
                      {meal.carbs && (
                        <div className="bg-yellow-50 p-2 rounded">
                          <span className="font-medium">Carbs:</span> {meal.carbs}
                        </div>
                      )}
                      {meal.fats && (
                        <div className="bg-red-50 p-2 rounded">
                          <span className="font-medium">Fats:</span> {meal.fats}
                        </div>
                      )}
                    </div>
                    
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm">Ingredients:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                          {meal.ingredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {meal.instructions && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm">Instructions:</h5>
                        <p className="text-sm text-gray-700 mt-1">{meal.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNutritionGuidelines = () => {
    if (!activePlan) return null;
    
    return (
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">Nutrition Guidelines</h3>
        {activePlan.guidelines.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {activePlan.guidelines.map((guideline, index) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No guidelines available.</p>
        )}
      </div>
    );
  };

  const renderHydrationTips = () => {
    if (!activePlan) return null;
    
    return (
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">Hydration</h3>
        {activePlan.hydration.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {activePlan.hydration.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No hydration tips available.</p>
        )}
      </div>
    );
  };

  const renderSupplements = () => {
    if (!activePlan || activePlan.supplements.length === 0) return null;
    
    return (
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">Supplements</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {activePlan.supplements.map((supplement, index) => (
            <li key={index}>{supplement}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleGenerateNutritionPlan = () => {
    setShowNutritionForm(true);
  };

  const handleNutritionFormSuccess = () => {
    setShowNutritionForm(false);
    // Refresh nutrition plans after successful creation
    fetchUserNutritionPlans(userId);
  };

  if (localLoading) {
    console.log('NutritionSchedule: Loading state is true');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500">Loading nutrition plans...</p>
      </div>
    );
  }

  if (error) {
    console.log('NutritionSchedule: Error state:', error);
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Nutrition Plans</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mr-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (nutritionPlans.length === 0 || !activePlan) {
    console.log('NutritionSchedule: No nutrition plans available');
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {showNutritionForm ? (
          <NutritionPlanForm 
            onSuccess={handleNutritionFormSuccess} 
            userProfile={userProfile}
          />
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Nutrition Plans Yet</h2>
            <p className="text-gray-600 mb-6">You haven't created any nutrition plans for this workout yet. Generate your personalized nutrition plan to get started!</p>
            <button 
              onClick={handleGenerateNutritionPlan}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create Nutrition Plan
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-teal-700 p-4">
        <h2 className="text-xl font-bold text-white">My Nutrition Schedule</h2>
      </div>
      
      {nutritionPlans.length > 1 && (
        <div className="p-4 border-b">
          <label htmlFor="nutritionPlanSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Nutrition Plan
          </label>
          <select
            id="nutritionPlanSelect"
            value={activePlan?._id || ''}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            {nutritionPlans.map(plan => (
              <option key={plan._id} value={plan._id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
        {/* Weekly Schedule */}
        <div className="border-r">
          <div className="p-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-800">Weekly Meal Plan</h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            <ul className="divide-y">
              {daysOfWeek.map((day, index) => {
                const isActive = activeDay === day;
                const dailyNutrition = activePlan.weekSchedule[day];
                const mealCount = dailyNutrition?.meals?.length || 0;
                
                return (
                  <li 
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`p-3 cursor-pointer transition-colors ${isActive ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'}`}
                  >
                    <div className="font-medium text-gray-900">{day}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {mealCount > 0 ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {mealCount} meal{mealCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        'No meals scheduled'
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="p-3 border-t">
            <button 
              onClick={handleGenerateNutritionPlan}
              className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Create New Nutrition Plan
            </button>
          </div>
        </div>
        
        {/* Meal Details */}
        <div className="col-span-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {showNutritionForm ? (
            <div className="p-4">
              <NutritionPlanForm 
                onSuccess={handleNutritionFormSuccess} 
                userProfile={userProfile}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowNutritionForm(false)}
                  className="text-gray-600 hover:text-gray-800 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-800">
                  {activeDay}'s Nutrition Plan
                </h3>
              </div>
              <div className="p-4">
                {renderMeals()}
                {renderNutritionGuidelines()}
                {renderHydrationTips()}
                {renderSupplements()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
