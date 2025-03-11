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

export default function FitnessCoach() {
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
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
      const response = await fetch('http://localhost:3000/api/fitness-coach/personalized-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setWorkoutPlan(data.plan);
      setStep(3);
    } catch (error) {
      console.error('Error generating workout plan:', error);
    } finally {
      setLoading(false);
    }
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
  const renderForm = () => (
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Save to My Workouts
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Fitness Coach</h1>
      <p className="text-gray-600 mb-8">Get a personalized workout plan tailored to your fitness level and goals.</p>
      
      {step === 1 && renderDifficultySelection()}
      {step === 2 && renderForm()}
      {step === 3 && renderWorkoutPlan()}
    </div>
  );
}
