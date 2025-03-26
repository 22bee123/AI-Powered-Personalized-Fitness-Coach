import React, { useState } from 'react';
import { useAuth } from '../../context/ClerkAuthContext';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { generatePlans, UserFormData } from '../../utils/planGenerator';

interface WorkoutFormProps {
  onWorkoutGenerated: (workoutPlan: any) => void;
  setLoading: (loading: boolean) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onWorkoutGenerated, setLoading }) => {
  // We're not using isAuthenticated directly, but we'll keep the auth context for future use
  const { /* isAuthenticated */ } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    difficulty: 'medium',
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
    focusAreas: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    workoutPlan: boolean;
    nutritionPlan: boolean;
    startWorkout: boolean;
  } | null>(null);
  const [generating, setGenerating] = useState(false);

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

  // Generate a workout plan
  const generateWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // Generate both workout and nutrition plans
      const { workoutPlan, nutritionPlan } = await generatePlans(formData);
      
      onWorkoutGenerated(workoutPlan);
      
      // Set success states
      setSuccess({
        workoutPlan: true,
        nutritionPlan: true,
        startWorkout: true
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate plans. Please try again.');
      console.error('Error generating plans:', err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalize Your Workout Plan</h2>
      <p className="text-gray-600 mb-6">Fill out this form to generate a workout plan tailored to your specific needs and goals.</p>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 rounded-md">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-2">Successfully created your personalized plans!</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  Workout Plan
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  Nutrition Plan
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  Start Workout Session
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={generateWorkoutPlan}>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Areas (select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['upper-body', 'lower-body', 'core', 'back', 'chest', 'arms', 'shoulders', 'legs', 'glutes', 'cardio', 'flexibility', 'balance'].map((area) => (
                <div key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`area-${area}`}
                    name="focusAreas"
                    value={area}
                    checked={formData.focusAreas.includes(area)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`area-${area}`} className="ml-2 text-sm text-gray-700">
                    {area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
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
              'Generate Plans'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;