import { useState, useEffect } from 'react';

// Define types for our data
interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
}

interface FormData {
  difficulty: string;
  goals: string;
  preferences: string;
  limitations: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
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
  createdAt: string;
  isFavorite: boolean;
}

export default function FitnessCoach() {
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<WorkoutPlan[]>([]);
  const [planName, setPlanName] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    difficulty: '',
    goals: '',
    preferences: '',
    limitations: '',
    age: '',
    gender: '',
    weight: '',
    height: ''
  });
  const [step, setStep] = useState(1);

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user123";

  // Fetch difficulty levels when component mounts
  useEffect(() => {
    const fetchDifficultyLevels = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/fitness-coach/difficulty-levels');
        const data = await response.json();
        setDifficultyLevels(data.levels);
      } catch (error) {
        console.error('Error fetching difficulty levels:', error);
      }
    };

    fetchDifficultyLevels();
  }, []);

  // Fetch saved workout plans
  useEffect(() => {
    const fetchSavedPlans = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/fitness-coach/user-workout-plans/${userId}`);
        const data = await response.json();
        if (data.plans) {
          setSavedPlans(data.plans);
        }
      } catch (error) {
        console.error('Error fetching saved workout plans:', error);
      }
    };

    if (userId) {
      fetchSavedPlans();
    }
  }, [userId]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle difficulty selection
  const handleDifficultySelect = (difficulty: string) => {
    setFormData(prev => ({ ...prev, difficulty }));
    setStep(2);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a default plan name based on difficulty and goals
      const goalSummary = formData.goals ? formData.goals.split(' ').slice(0, 3).join(' ') : '';
      const defaultPlanName = `${formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)} Plan - ${goalSummary}`;
      setPlanName(defaultPlanName);

      const response = await fetch('http://localhost:3000/api/fitness-coach/personalized-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId, // Include userId to save the plan
          name: defaultPlanName // Include a default name
        }),
      });

      const data = await response.json();
      setWorkoutPlan(data.plan);
      
      // If the plan was saved successfully, add it to the saved plans list
      if (data.savedPlan) {
        console.log('Plan saved automatically:', data.savedPlan);
        setSavedPlans(prev => [data.savedPlan, ...prev]);
        // Show success message
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 3000);
      }
      
      setStep(3);
    } catch (error) {
      console.error('Error generating workout plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving workout plan
  const handleSavePlan = async () => {
    if (!workoutPlan || !planName) return;
    
    setSavingPlan(true);
    
    try {
      // First, get the parsed plan data from the backend
      const parseResponse = await fetch('http://localhost:3000/api/fitness-coach/parse-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawPlan: workoutPlan
        }),
      });
      
      const parseData = await parseResponse.json();
      const parsedPlan = parseData.parsedPlan;
      
      // Now save the workout plan with the parsed data
      const response = await fetch('http://localhost:3000/api/fitness-coach/save-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: planName,
          difficulty: formData.difficulty,
          userDetails: {
            age: formData.age,
            gender: formData.gender,
            weight: formData.weight,
            height: formData.height,
            goals: formData.goals,
            preferences: formData.preferences,
            limitations: formData.limitations
          },
          rawPlan: workoutPlan,
          // Include the parsed plan data
          schedule: parsedPlan.schedule || [],
          exercises: parsedPlan.exercises || [],
          warmup: parsedPlan.warmup || [],
          cooldown: parsedPlan.cooldown || [],
          nutrition: parsedPlan.nutrition || [],
          recovery: parsedPlan.recovery || [],
          weekSchedule: parsedPlan.weekSchedule || {}
        }),
      });

      const data = await response.json();
      console.log('Saved workout plan:', data);
      
      // Add the new plan to the saved plans list
      if (data.plan) {
        setSavedPlans(prev => [data.plan, ...prev]);
      }
      
      // Show success message
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
      
    } catch (error) {
      console.error('Error saving workout plan:', error);
    } finally {
      setSavingPlan(false);
    }
  };

  // Handle viewing workout plan details
  const handleViewPlanDetails = async (planId: string) => {
    if (!planId) return;
    
    setLoadingPlanDetails(true);
    
    try {
      const response = await fetch(`http://localhost:3000/api/fitness-coach/workout-plan-details/${planId}`);
      const data = await response.json();
      
      if (data.plan) {
        setSelectedPlan(data.plan);
        setWorkoutPlan(data.plan.rawPlan);
        setStep(4); // New step for viewing saved plan details
      }
    } catch (error) {
      console.error('Error fetching workout plan details:', error);
    } finally {
      setLoadingPlanDetails(false);
    }
  };

  // Handle toggling favorite status
  const handleToggleFavorite = async (planId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/fitness-coach/toggle-favorite/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.plan) {
        // Update the plan in the savedPlans array
        setSavedPlans(prev => 
          prev.map(plan => 
            plan._id === planId 
              ? { ...plan, isFavorite: data.plan.isFavorite } 
              : plan
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };

  // Handle back to saved plans
  const handleBackToSavedPlans = () => {
    setSelectedPlan(null);
    setStep(3);
  };

  // Render difficulty selection step
  const renderDifficultySelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Choose Your Fitness Level</h2>
      <p className="text-gray-600">Select the difficulty level that best matches your current fitness experience.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {difficultyLevels.map((level) => (
          <div 
            key={level.id}
            onClick={() => handleDifficultySelect(level.id)}
            className="border rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{level.name}</h3>
            <p className="text-gray-600">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Render form step
  const renderPersonalInfoForm = () => (
    <div>
      <button 
        onClick={() => setStep(1)} 
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Difficulty Selection
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalize Your Fitness Plan</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 35"
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 70kg or 154lbs"
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 175cm or 5'9&quot;"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">Fitness Goals</label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., lose weight, build muscle, improve endurance"
          />
        </div>
        
        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">Exercise Preferences</label>
          <textarea
            id="preferences"
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., prefer home workouts, enjoy running, have access to dumbbells"
          />
        </div>
        
        <div>
          <label htmlFor="limitations" className="block text-sm font-medium text-gray-700 mb-1">Limitations or Health Concerns</label>
          <textarea
            id="limitations"
            name="limitations"
            value={formData.limitations}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., knee pain, lower back issues, limited mobility"
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Generating Your Plan...' : 'Generate Personalized Workout Plan'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render workout plan step
  const renderWorkoutPlan = () => (
    <div>
      <button 
        onClick={() => setStep(2)} 
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Form
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Personalized Fitness Plan</h2>
        <div className="prose max-w-none">
          {workoutPlan && (
            <div dangerouslySetInnerHTML={{ __html: workoutPlan.replace(/\n/g, '<br />') }} />
          )}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start your fitness journey?</h3>
          <p className="text-gray-600 mb-4">Save this plan and track your progress with AI Fitness Coach.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                type="text"
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Give your plan a name"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSavePlan}
                disabled={savingPlan || !planName}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300 whitespace-nowrap"
              >
                {savingPlan ? 'Saving...' : 'Save to My Workouts'}
              </button>
            </div>
          </div>
          
          {showSavedMessage && (
            <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-md text-center">
              Workout plan saved successfully!
            </div>
          )}
        </div>
      </div>
      
      {savedPlans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Saved Workout Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlans.map(plan => (
              <div key={plan._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(plan.createdAt).toLocaleDateString()} • {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleToggleFavorite(plan._id || '')}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    {plan.isFavorite ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-2">
                  <button 
                    onClick={() => handleViewPlanDetails(plan._id || '')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render saved workout plan details
  const renderSavedPlanDetails = () => (
    <div>
      <button 
        onClick={handleBackToSavedPlans} 
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Saved Plans
      </button>

      {loadingPlanDetails ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : selectedPlan && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
            <button 
              onClick={() => handleToggleFavorite(selectedPlan._id || '')}
              className="text-yellow-500 hover:text-yellow-600"
            >
              {selectedPlan.isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="font-medium">{selectedPlan.difficulty.charAt(0).toUpperCase() + selectedPlan.difficulty.slice(1)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(selectedPlan.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Goals</p>
              <p className="font-medium">{selectedPlan.userDetails?.goals || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="prose max-w-none">
            {workoutPlan && (
              <div dangerouslySetInnerHTML={{ __html: workoutPlan.replace(/\n/g, '<br />') }} />
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Fitness Coach</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        {step === 1 && renderDifficultySelection()}
        {step === 2 && renderPersonalInfoForm()}
        {step === 3 && renderWorkoutPlan()}
        {step === 4 && renderSavedPlanDetails()}
      </div>
    </div>
  );
}
