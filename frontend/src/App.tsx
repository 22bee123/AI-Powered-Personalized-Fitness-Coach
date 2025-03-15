import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FitnessCoach from "./pages/FitnessCoach";
import WorkoutSchedulePage from "./pages/WorkoutSchedulePage";
import { WorkoutPlanProvider } from "./contexts/WorkoutPlanContext";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <WorkoutPlanProvider>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            } />
            
            <Route path="/dashboard" element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />

            <Route path="/fitness-coach" element={
              <>
                <SignedIn>
                  <FitnessCoach />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />
            
            <Route path="/workout-schedule" element={
              <>
                <SignedIn>
                  <WorkoutSchedulePage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />
          </Routes>
        </main>
      </WorkoutPlanProvider>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p> {new Date().getFullYear()} AI Fitness Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}