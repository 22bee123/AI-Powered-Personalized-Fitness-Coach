import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

// API base URL
const API_BASE_URL = 'http://localhost:3000/api/fitness-coach';

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

interface DailyNutrition {
  day: string;
  meals: Meal[];
  totalCalories?: string;
  totalProtein?: string;
  totalCarbs?: string;
  totalFats?: string;
  waterIntake?: string;
  notes?: string;
}

interface NutritionPlan {
  _id?: string;
  userId: string;
  name: string;
  workoutPlanId?: string;
  userDetails?: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goals: string;
    preferences: string;
    limitations: string;
    allergies: string;
    dietaryRestrictions: string;
  };
  rawPlan?: string;
  weekSchedule: {
    [key: string]: DailyNutrition;
  };
  guidelines: string[];
  hydration: string[];
  supplements: string[];
  createdAt?: string;
}

export default function NutritionPlanLoader() {
  const { user } = useUser();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNutritionPlan = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching nutrition plan for user: ${user.id}`);
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/user-nutrition-plans/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch nutrition plan: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Nutrition plan data:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setNutritionPlan(data[0]);
        } else {
          console.log('No nutrition plan found, creating default');
          // Create a default plan
          await fetch(`${API_BASE_URL}/create-test-nutrition-plan/${user.id}`, {
            method: 'POST'
          });
          
          // Fetch the newly created plan
          const newResponse = await fetch(`${API_BASE_URL}/user-nutrition-plans/${user.id}`);
          const newData = await newResponse.json();
          
          if (Array.isArray(newData) && newData.length > 0) {
            setNutritionPlan(newData[0]);
          } else {
            throw new Error('Failed to create and fetch a default nutrition plan');
          }
        }
      } catch (err) {
        console.error('Error fetching nutrition plan:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionPlan();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500">Loading nutrition plan...</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Nutrition Plan</h2>
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

  if (!nutritionPlan) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-yellow-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Nutrition Plan Available</h2>
          <p className="text-gray-600 mb-6">We couldn't find a nutrition plan for you.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mr-2"
        >
          Create Plan
        </button>
      </div>
    );
  }

  // Render the nutrition plan directly
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{nutritionPlan.name}</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Guidelines</h3>
        <ul className="list-disc pl-5">
          {nutritionPlan.guidelines.map((guideline, index) => (
            <li key={index} className="mb-1">{guideline}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Hydration</h3>
        <ul className="list-disc pl-5">
          {nutritionPlan.hydration.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Supplements</h3>
        <ul className="list-disc pl-5">
          {nutritionPlan.supplements.map((supplement, index) => (
            <li key={index} className="mb-1">{supplement}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Weekly Meal Plan</h3>
        {Object.entries(nutritionPlan.weekSchedule).map(([day, dailyPlan]) => (
          <div key={day} className="mb-6 p-4 border rounded-lg">
            <h4 className="text-lg font-semibold mb-2">{day}</h4>
            
            {dailyPlan.meals.map((meal, index) => (
              <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                <h5 className="font-medium">{meal.name} ({meal.timeOfDay})</h5>
                {meal.description && <p className="text-sm text-gray-600 mb-1">{meal.description}</p>}
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {meal.calories && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Calories: {meal.calories}
                    </span>
                  )}
                  {meal.protein && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Protein: {meal.protein}
                    </span>
                  )}
                  {meal.carbs && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Carbs: {meal.carbs}
                    </span>
                  )}
                  {meal.fats && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Fats: {meal.fats}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
