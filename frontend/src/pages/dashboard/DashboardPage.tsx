import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  CalendarIcon, 
  ArrowRightOnRectangleIcon,
  BoltIcon,
  FireIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Logo from '../../components/Logo';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for dashboard
  const stats = [
    { name: 'Workouts Completed', value: '12', icon: ChartBarIcon },
    { name: 'Calories Burned', value: '8,540', icon: BoltIcon },
    { name: 'Active Days', value: '18', icon: CalendarIcon },
    { name: 'Fitness Score', value: '82', icon: ChartBarIcon },
  ];

  // Mock workout plan
  const workoutPlan = [
    { day: 'Monday', focus: 'Upper Body', duration: '45 min', exercises: ['Push-ups', 'Pull-ups', 'Shoulder Press', 'Bicep Curls'] },
    { day: 'Tuesday', focus: 'Lower Body', duration: '50 min', exercises: ['Squats', 'Lunges', 'Deadlifts', 'Calf Raises'] },
    { day: 'Wednesday', focus: 'Rest Day', duration: '0 min', exercises: ['Light Stretching', 'Foam Rolling'] },
    { day: 'Thursday', focus: 'Core & Cardio', duration: '40 min', exercises: ['Planks', 'Russian Twists', 'Mountain Climbers', 'HIIT'] },
    { day: 'Friday', focus: 'Full Body', duration: '60 min', exercises: ['Burpees', 'Kettlebell Swings', 'Box Jumps', 'Thrusters'] },
    { day: 'Saturday', focus: 'Active Recovery', duration: '30 min', exercises: ['Swimming', 'Yoga', 'Light Jogging'] },
    { day: 'Sunday', focus: 'Rest Day', duration: '0 min', exercises: ['Meditation', 'Stretching'] },
  ];

  // Mock nutrition schedule
  const nutritionSchedule = [
    { meal: 'Breakfast', time: '7:00 AM', foods: ['Oatmeal with berries', 'Greek yogurt', 'Coffee'], calories: 450 },
    { meal: 'Morning Snack', time: '10:00 AM', foods: ['Apple', 'Handful of almonds'], calories: 200 },
    { meal: 'Lunch', time: '1:00 PM', foods: ['Grilled chicken salad', 'Whole grain bread', 'Olive oil dressing'], calories: 550 },
    { meal: 'Afternoon Snack', time: '4:00 PM', foods: ['Protein shake', 'Banana'], calories: 250 },
    { meal: 'Dinner', time: '7:00 PM', foods: ['Salmon', 'Brown rice', 'Steamed vegetables'], calories: 650 },
    { meal: 'Evening Snack', time: '9:00 PM', foods: ['Cottage cheese', 'Berries'], calories: 150 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 bg-indigo-800">
            <Logo size="medium" className="justify-center" />
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'overview' 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <ChartBarIcon className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ai-coach')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'ai-coach' 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5" />
              AI Coach
            </button>
            <button
              onClick={() => setActiveTab('workout-plan')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'workout-plan' 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
              Workout Plan
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'nutrition' 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <FireIcon className="mr-3 h-5 w-5" />
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'profile' 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`}
            >
              <UserCircleIcon className="mr-3 h-5 w-5" />
              Profile
            </button>
          </nav>
          <div className="p-4 border-t border-indigo-800">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-indigo-100 rounded-md hover:bg-indigo-800"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && (
            <div>
              {/* Hero section */}
              <div className="bg-indigo-700 rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="px-6 py-12 md:px-12 text-white">
                  <h2 className="text-3xl font-bold mb-2">AI-Powered Personalized Fitness Coach</h2>
                  <p className="text-indigo-100 mb-6">
                    A comprehensive fitness application that uses AI to provide personalized workout plans, 
                    nutrition advice, and real-time feedback to users.
                  </p>
                  <button 
                    onClick={() => setActiveTab('ai-coach')}
                    className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-md shadow hover:bg-indigo-50 transition-colors"
                  >
                    Get Started with AI Coach
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Fitness Stats</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.name}
                      className="bg-white overflow-hidden shadow rounded-lg"
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                            <stat.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[1, 2, 3].map((item) => (
                      <li key={item}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              Completed Workout #{item}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Completed
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                30 min Full Body Workout
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <p>
                                {new Date(Date.now() - item * 86400000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-coach' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Fitness Coach</h2>
              <p className="text-gray-600 mb-6">
                Ask your AI coach for personalized workout plans, nutrition advice, and fitness tips.
              </p>
              
              <div className="border rounded-lg p-4 h-96 bg-gray-50 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                        AI
                      </span>
                    </div>
                    <div className="ml-3 bg-indigo-100 rounded-lg py-2 px-4 max-w-md">
                      <p className="text-sm text-gray-900">
                        Hello! I'm your AI Fitness Coach. How can I help you today?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask your AI coach a question..."
                  className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                />
                <button
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Example questions you can ask:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Can you suggest a workout routine for building upper body strength?</li>
                  <li>What should I eat before and after a workout?</li>
                  <li>How can I improve my running endurance?</li>
                  <li>Can you create a meal plan for weight loss?</li>
                  <li>What exercises are good for lower back pain?</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'workout-plan' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Workout Plan</h2>
                  <p className="text-gray-600 mt-1">Your personalized training schedule</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Generate New Plan
                </button>
              </div>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Day</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Focus</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Exercises</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {workoutPlan.map((day) => (
                      <tr key={day.day} className={day.focus.includes('Rest') ? 'bg-gray-50' : ''}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{day.day}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{day.focus}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{day.duration}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <ul className="list-disc pl-5">
                            {day.exercises.map((exercise, idx) => (
                              <li key={idx}>{exercise}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Download PDF
                </button>
                <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Share
                </button>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daily Nutrition Schedule</h2>
                  <p className="text-gray-600 mt-1">Your personalized meal plan (2,250 calories)</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Customize Plan
                </button>
              </div>
              
              <div className="space-y-6">
                {nutritionSchedule.map((meal) => (
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
                  <li>Drink at least 8 glasses of water throughout the day</li>
                  <li>Try to eat your meals at consistent times each day</li>
                  <li>Include protein with each meal to support muscle recovery</li>
                  <li>Consume complex carbohydrates before workouts for energy</li>
                  <li>Adjust portion sizes based on your activity level for the day</li>
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
          )}

          {activeTab === 'profile' && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and fitness information.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.name}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fitness goals</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Not set
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fitness level</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Not set
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
