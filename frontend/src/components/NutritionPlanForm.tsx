import React, { useState } from 'react';
import { useWorkoutPlan } from '../contexts/WorkoutPlanContext';
import { useNutritionPlan } from '../contexts/NutritionPlanContext';

interface NutritionPlanFormProps {
  onSuccess?: () => void;
}

const NutritionPlanForm: React.FC<NutritionPlanFormProps> = ({ onSuccess }) => {
  const { activePlan: activeWorkoutPlan } = useWorkoutPlan();
  const { fetchNutritionPlansByWorkout } = useNutritionPlan();
  
  // Form state
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user123";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWorkoutPlan?._id) {
      setError('Please select a workout plan first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare the request data
      const nutritionPlanData = {
        userId,
        name: name || 'Personalized Nutrition Plan',
        workoutPlanId: activeWorkoutPlan._id,
        allergies,
        dietaryRestrictions,
        preferences,
        // Include user details from the workout plan
        age: activeWorkoutPlan.userDetails?.age,
        gender: activeWorkoutPlan.userDetails?.gender,
        weight: activeWorkoutPlan.userDetails?.weight,
        height: activeWorkoutPlan.userDetails?.height,
        goals: activeWorkoutPlan.userDetails?.goals,
        limitations: activeWorkoutPlan.userDetails?.limitations,
      };
      
      // Call the API to generate a personalized nutrition plan
      const response = await fetch('http://localhost:3000/api/fitness-coach/personalized-nutrition-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutritionPlanData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate nutrition plan');
      }
      
      // Removed the unused 'data' variable
      setSuccess('Nutrition plan generated successfully!');
      
      // Refresh the nutrition plans list
      if (activeWorkoutPlan._id) {
        await fetchNutritionPlansByWorkout(activeWorkoutPlan._id);
      }
      
      // Reset form
      setName('');
      setAllergies('');
      setDietaryRestrictions('');
      setPreferences('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate nutrition plan');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Nutrition Plan</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Plan Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Nutrition Plan"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
            Food Allergies
          </label>
          <textarea
            id="allergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="List any food allergies (e.g., nuts, dairy, gluten)"
            className="w-full p-2 border border-gray-300 rounded-md h-20"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Restrictions
          </label>
          <textarea
            id="dietaryRestrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="List any dietary restrictions (e.g., vegetarian, vegan, keto)"
            className="w-full p-2 border border-gray-300 rounded-md h-20"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
            Food Preferences
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="List any food preferences or cuisines you enjoy"
            className="w-full p-2 border border-gray-300 rounded-md h-20"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Nutrition Plan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NutritionPlanForm;
