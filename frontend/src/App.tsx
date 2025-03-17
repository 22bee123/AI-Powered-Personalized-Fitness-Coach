import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import Navbar from './components/Navbar/Navbar.tsx';
import Home from './Pages/Home/Home.tsx';
import SignIn from './Pages/SignIn/SignIn.tsx';
import SignUp from './Pages/SignUp/SignUp.tsx';
import Dashboard from './Pages/Dashboard/Dashboard.tsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.tsx';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <footer className="bg-white py-6 border-t">
            <div className="container mx-auto px-4 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} AI Fitness Coach. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}