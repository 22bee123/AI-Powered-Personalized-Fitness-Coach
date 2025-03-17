import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center">
      {/* Left side - Hero content */}
      <div className="w-full md:w-1/2 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Transform Your Fitness Journey with AI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Get personalized workout plans, nutrition advice, and real-time feedback 
          tailored to your unique goals and preferences.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 text-blue-600"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900">AI-Powered Personalization</h3>
              <p className="text-sm text-gray-600">Workouts and nutrition plans that adapt to your progress</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 text-blue-600"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900">Real-time Feedback</h3>
              <p className="text-sm text-gray-600">Get immediate guidance on your form and technique</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4 text-blue-600"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900">Progress Tracking</h3>
              <p className="text-sm text-gray-600">Visualize your improvements and stay motivated</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign In form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 bg-white rounded-lg shadow-sm border">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Sign In to AI Fitness Coach
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
              <button 
                onClick={clearError} 
                className="ml-2 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;