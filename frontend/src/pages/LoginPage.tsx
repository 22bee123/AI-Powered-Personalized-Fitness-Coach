import { SignedIn, SignedOut, UserButton, SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
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
      
      {/* Right side - Sign In component */}
      <div className="w-full md:w-1/2 p-8 md:p-12 bg-white rounded-lg shadow-sm border">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Join AI Fitness Coach
          </h2>
          <SignedOut>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                  footerActionLink: 
                    "text-blue-600 hover:text-blue-800",
                  card: "shadow-none"
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
}