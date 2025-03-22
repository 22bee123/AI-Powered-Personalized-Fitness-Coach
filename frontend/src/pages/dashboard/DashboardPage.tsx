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
  XMarkIcon
} from '@heroicons/react/24/outline';
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
    { name: 'Workouts Completed', value: '12', icon: ChartBarIcon },
    { name: 'Calories Burned', value: '8,540', icon: BoltIcon },
    { name: 'Active Days', value: '18', icon: CalendarIcon },
    { name: 'Fitness Score', value: '82', icon: ChartBarIcon },
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
            ? `w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === item.id 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-800'
              }`
            : `px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === item.id
                  ? 'bg-indigo-100 text-indigo-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white shadow-xl z-50 transition-transform duration-300 ease-in-out transform lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-4 bg-indigo-800">
            <Logo size="small" className="justify-center" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-indigo-200 hover:text-white focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {renderNavigationItems(true)}
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

      {/* Desktop top navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and mobile menu button */}
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <Logo size="small" />
              </div>
              {/* Desktop navigation */}
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-8">
                {renderNavigationItems()}
              </nav>
            </div>
            
            {/* User menu */}
            <div className="flex items-center">
              <div className="hidden lg:flex items-center mr-4 text-sm font-medium text-gray-700">
                Welcome, {user?.name}!
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
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
                              Completed on <time dateTime="2023-01-01">January 1, 2023</time>
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Account created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    January 1, 2023
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
