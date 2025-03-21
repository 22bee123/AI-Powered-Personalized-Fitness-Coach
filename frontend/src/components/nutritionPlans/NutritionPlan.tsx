import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { generatePlans, UserFormData } from '../../utils/planGenerator';

interface NutritionItem {
  meal: string;
  time: string;
  foods: string[];
  calories: number;
}

interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionPlanData {
  _id: string;
  userId: string;
  dailyPlan: NutritionItem[];
  totalCalories: number;
  macros: Macros;
  nutritionTips: string[];
  createdAt: string;
}

interface NutritionPlanProps {
  onFormToggle?: () => void;
}

const NutritionPlan: React.FC<NutritionPlanProps> = ({ onFormToggle }) => {
  // We're keeping useAuth for future use, but not using user directly
  const { /* user */ } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    fitnessGoals: [] as string[],
    healthConditions: [] as string[],
    preferredWorkoutDuration: '30-45',
    workoutDaysPerWeek: '3-4',
    equipmentAccess: 'limited',
    focusAreas: [] as string[],
    difficulty: 'medium'
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // Fetch the latest nutrition plan on component mount
  useEffect(() => {
    fetchLatestNutritionPlan();
  }, []);

  // Fetch the latest nutrition plan
  const fetchLatestNutritionPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nutrition/latest');
      setNutritionPlan(response.data.nutritionPlan);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No nutrition plan found is not an error, just means we need to generate one
        setNutritionPlan(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch nutrition plan');
        console.error('Error fetching nutrition plan:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        [name]: [...formData[name as keyof typeof formData] as string[], value]
      });
    } else {
      setFormData({
        ...formData,
        [name]: (formData[name as keyof typeof formData] as string[]).filter(item => item !== value)
      });
    }
  };

  // Generate a nutrition plan
  const generateNutritionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Generate both workout and nutrition plans
      const { nutritionPlan } = await generatePlans(formData);
      
      setNutritionPlan(nutritionPlan);
      setSuccess('Workout and nutrition plans generated successfully!');
      setShowForm(false);
      
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

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (onFormToggle) {
      onFormToggle();
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalize Your Nutrition Plan</h2>
        <p className="text-gray-600 mb-6">Fill out this form to generate a nutrition plan tailored to your specific needs and goals.</p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-md flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        
        <form onSubmit={generateNutritionPlan}>
          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your height in cm"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your weight in kg"
                />
              </div>
            </div>
          </div>
          
          {/* Fitness Profile Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fitness Profile</h3>
            
            <div className="mb-4">
              <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Current Fitness Level
              </label>
              <select
                id="fitnessLevel"
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="beginner">Beginner - New to regular exercise</option>
                <option value="intermediate">Intermediate - Exercise 1-3 times per week</option>
                <option value="advanced">Advanced - Exercise 4+ times per week</option>
                <option value="athletic">Athletic - Competitive sports/training</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Goals (select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['weight-loss', 'muscle-gain', 'endurance', 'strength', 'flexibility', 'toning', 'general-fitness', 'sports-performance'].map((goal) => (
                  <div key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`goal-${goal}`}
                      name="fitnessGoals"
                      value={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`goal-${goal}`} className="ml-2 text-sm text-gray-700">
                      {goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Conditions (select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['none', 'back-pain', 'knee-issues', 'shoulder-issues', 'heart-condition', 'diabetes', 'hypertension', 'pregnancy', 'arthritis'].map((condition) => (
                  <div key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`condition-${condition}`}
                      name="healthConditions"
                      value={condition}
                      checked={formData.healthConditions.includes(condition)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`condition-${condition}`} className="ml-2 text-sm text-gray-700">
                      {condition === 'none' ? 'None' : condition.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Workout Preferences Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="preferredWorkoutDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Workout Duration (minutes)
                </label>
                <select
                  id="preferredWorkoutDuration"
                  name="preferredWorkoutDuration"
                  value={formData.preferredWorkoutDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="15-30">15-30 minutes</option>
                  <option value="30-45">30-45 minutes</option>
                  <option value="45-60">45-60 minutes</option>
                  <option value="60+">60+ minutes</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="workoutDaysPerWeek" className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Days Per Week
                </label>
                <select
                  id="workoutDaysPerWeek"
                  name="workoutDaysPerWeek"
                  value={formData.workoutDaysPerWeek}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="1-2">1-2 days</option>
                  <option value="3-4">3-4 days</option>
                  <option value="5-6">5-6 days</option>
                  <option value="7">Every day</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="equipmentAccess" className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Access
                </label>
                <select
                  id="equipmentAccess"
                  name="equipmentAccess"
                  value={formData.equipmentAccess}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="none">None (bodyweight only)</option>
                  <option value="limited">Limited (basic home equipment)</option>
                  <option value="full-gym">Full gym access</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={toggleForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Generating...
                </>
              ) : (
                'Generate Nutrition Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Nutrition Plan Found</h2>
          <p className="text-gray-600 mb-6">Generate a personalized nutrition plan based on your profile and goals.</p>
          <button
            onClick={toggleForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Nutrition Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Nutrition Schedule</h2>
          <p className="text-gray-600 mt-1">Your personalized meal plan ({nutritionPlan.totalCalories} calories)</p>
        </div>
        <button 
          onClick={toggleForm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Customize Plan
        </button>
      </div>
      
      {/* Macros Section */}
      <div className="mb-6 bg-indigo-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Daily Macronutrients</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm text-center">
            <div className="text-indigo-600 font-bold text-xl">{nutritionPlan.macros.protein}g</div>
            <div className="text-gray-500 text-sm">Protein</div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm text-center">
            <div className="text-indigo-600 font-bold text-xl">{nutritionPlan.macros.carbs}g</div>
            <div className="text-gray-500 text-sm">Carbs</div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm text-center">
            <div className="text-indigo-600 font-bold text-xl">{nutritionPlan.macros.fats}g</div>
            <div className="text-gray-500 text-sm">Fats</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {nutritionPlan.dailyPlan.map((meal) => (
          <div key={meal.meal} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">{meal.meal}</h3>
              <span className="text-sm text-gray-500">{meal.time}</span>
            </div>
            <div className="flex justify-between items-start">
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {meal.foods.map((food, idx) => (
                  <li key={idx}>{food}</li>
                ))}
              </ul>
              <div className="bg-indigo-100 px-3 py-1 rounded-full text-sm font-medium text-indigo-800">
                {meal.calories} cal
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-indigo-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nutrition Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          {nutritionPlan.nutritionTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 flex justify-end space-x-4">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Download PDF
        </button>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Generate Shopping List
        </button>
      </div>
    </div>
  );
};

export default NutritionPlan;