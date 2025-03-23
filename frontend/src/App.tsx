import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ClerkAuthProvider } from './context/ClerkAuthContext';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

// Get Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// Custom styled sign-in and sign-up pages
const CustomSignIn = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full p-6",
            card: "rounded-none shadow-none",
            header: "text-center mb-6",
            headerTitle: "text-3xl font-extrabold text-gray-900 mt-4 mb-2",
            headerSubtitle: "text-sm text-gray-600",
            formButtonPrimary: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md",
            formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
            formFieldLabel: "block text-sm font-medium text-gray-700 mb-1",
            footer: "text-center mt-4",
            footerActionText: "text-sm text-gray-600",
            footerActionLink: "text-indigo-600 hover:text-indigo-500"
          }
        }}
        routing="path"
        path="/login"
        redirectUrl="/dashboard"
        signUpUrl="/signup"
      />
    </div>
  </div>
);

const CustomSignUp = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full p-6",
            card: "rounded-none shadow-none",
            header: "text-center mb-6",
            headerTitle: "text-3xl font-extrabold text-gray-900 mt-4 mb-2",
            headerSubtitle: "text-sm text-gray-600",
            formButtonPrimary: "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md",
            formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
            formFieldLabel: "block text-sm font-medium text-gray-700 mb-1",
            footer: "text-center mt-4",
            footerActionText: "text-sm text-gray-600",
            footerActionLink: "text-indigo-600 hover:text-indigo-500"
          }
        }}
        routing="path"
        path="/signup"
        redirectUrl="/dashboard"
        signInUrl="/login"
      />
    </div>
  </div>
);

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ClerkAuthProvider>
        <Router>
          <Routes>
            <Route path="/login/*" element={<CustomSignIn />} />
            <Route path="/signup/*" element={<CustomSignUp />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}

export default App;
