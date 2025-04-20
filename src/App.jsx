import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Components/auth/AuthContext';
import AuthPage from './pages/AuthPage';
import PasswordResetConfirmation from './Components/auth/PasswordResetConfirmation';


// Private Route component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/reset-password" element={<PasswordResetConfirmation />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboaard" 
            element={
              <PrivateRoute>
                <AuthPage />
              </PrivateRoute>
            } 
          />
          
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;