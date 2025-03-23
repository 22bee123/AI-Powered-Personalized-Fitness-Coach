import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  CalendarIcon, 
  ArrowRightOnRectangleIcon,
  BoltIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import Logo from '../../components/Logo';
import WorkOut from '../../components/workoutPlans/WorkOut';
import CoachAI from '../../components/coachAI/CoachAI';
import NutritionPlan from '../../components/nutritionPlans/NutritionPlan';
import StartWorkout from '../../components/startWorkout/StartWorkout';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when changing tabs
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [activeTab]);

  // Mock data for dashboard
  const stats = [
    { name: 'Workouts Completed', value: '12', icon: CheckCircleIcon, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Calories Burned', value: '8,540', icon: FireIconSolid, color: 'bg-orange-100 text-orange-600' },
    { name: 'Active Days', value: '18', icon: CalendarIcon, color: 'bg-blue-100 text-blue-600' },
    { name: 'Fitness Score', value: '82', icon: TrophyIcon, color: 'bg-purple-100 text-purple-600' },
  ];

  const navigationItems = [
    { name: 'Dashboard', id: 'overview', icon: ChartBarIcon },
    { name: 'AI Coach', id: 'ai-coach', icon: ChatBubbleLeftRightIcon },
    { name: 'Workout Plan', id: 'workout-plan', icon: ClipboardDocumentListIcon },
    { name: 'Start Workout', id: 'start-workout', icon: PlayIcon },
    { name: 'Nutrition', id: 'nutrition', icon: FireIcon },
    { name: 'Profile', id: 'profile', icon: UserCircleIcon },
  ];

  const renderNavigationItems = (isMobileView = false) => {
    return navigationItems.map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`
          ${isMobileView 
            ? `w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md' 
                  : 'text-indigo-100 hover:bg-indigo-800/50'
              }`
            : `px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`
          }
        `}
      >
        {isMobileView ? (
          <>
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.name}</span>
          </>
        ) : (
          <span className="text-sm">{item.name}</span>
        )}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl z-50 transition-transform duration-300 ease-in-out transform lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b border-indigo-700/50">
            <Logo size="small" className="justify-center" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-700/50 focus:outline-none transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-indigo-200 text-xs">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {renderNavigationItems(true)}
          </nav>
          <div className="p-4 border-t border-indigo-700/50">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-indigo-100 rounded-lg hover:bg-indigo-700/50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop top navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 lg:hidden transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <Logo size="small" />
              </div>
              {/* Desktop navigation */}
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-4">
                {renderNavigationItems()}
              </nav>
            </div>
            
            {/* User menu */}
            <div className="flex items-center">
              <div className="hidden lg:flex items-center mr-4 text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span>Welcome, {user?.name}!</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 rounded-md transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div>
            {/* Hero section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative">
                <div className="absolute inset-0 opacity-10">
                  <svg className="h-full w-full" viewBox="0 0 800 800">
                    <path d="M400 0C250 0 100 150 100 300C100 450 250 600 400 600C550 600 700 450 700 300C700 150 550 0 400 0Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="px-6 py-12 md:px-12 text-white relative z-10">
                  <h2 className="text-3xl font-bold mb-3">AI-Powered Personalized Fitness Coach</h2>
                  <p className="text-indigo-100 mb-8 max-w-2xl">
                    Your comprehensive fitness solution that uses AI to provide personalized workout plans, 
                    nutrition advice, and real-time feedback tailored just for you.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveTab('ai-coach')}
                      className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg shadow-md hover:bg-indigo-50 transition-colors flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      Chat with AI Coach
                    </button>
                    <button 
                      onClick={() => setActiveTab('start-workout')}
                      className="px-6 py-3 bg-indigo-800 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Start Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Your Fitness Stats
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="bg-white overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 rounded-xl p-3 ${stat.color}`}>
                          <stat.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CalendarIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Recent Activity
              </h3>
              <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
                <ul className="divide-y divide-gray-100">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="hover:bg-gray-50 transition-colors">
                      <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-medium text-indigo-600 truncate flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-emerald-500" />
                            Completed Workout #{item}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                              Completed
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-600">
                              <BoltIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-500" />
                              30 min Full Body Workout
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>
                              Completed on <time dateTime="2023-01-01" className="font-medium">January 1, 2023</time>
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

        {activeTab === 'ai-coach' && <CoachAI />}
        {activeTab === 'workout-plan' && <WorkOut />}
        {activeTab === 'start-workout' && <StartWorkout />}
        {activeTab === 'nutrition' && <NutritionPlan />}
        {activeTab === 'profile' && (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">User Profile</h3>
                  <p className="mt-1 text-sm text-gray-500">Personal details and preferences</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Full name</div>
                <div className="text-sm text-gray-900 sm:col-span-2 font-medium">{user?.name}</div>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Email address</div>
                <div className="text-sm text-gray-900 sm:col-span-2 font-medium">{user?.email}</div>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Account created</div>
                <div className="text-sm text-gray-900 sm:col-span-2 font-medium">January 1, 2023</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
