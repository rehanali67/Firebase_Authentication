import React, { useState } from 'react';
import EmailPasswordForm from '../Components/auth/EmailPasswordForm';
import { useAuth } from '../Components/auth/AuthContext';
import { UserCircle } from 'lucide-react';

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const { currentUser, logout } = useAuth();
  
  // Handle form toggle between login and register
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setStatusMessage(null); // Clear any messages when switching forms
  };
  
  // Handle successful authentication
  const handleSuccess = (message) => {
    setStatusMessage({
      type: 'success',
      text: message
    });
  };
  
  // Handle authentication errors
  const handleError = (message) => {
    setStatusMessage({
      type: 'error',
      text: message
    });
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      // Logout is handled by AuthContext, which will update currentUser state
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to sign out. Please try again.'
      });
    }
  };
  
  // If user is already logged in, show dashboard with user details
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-blue-100 mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  document.getElementById('fallback-avatar').style.display = 'block';
                }}
              />
            ) : (
              <div id="fallback-avatar" className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                <UserCircle size={64} className="text-blue-500" />
              </div>
            )}
            
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentUser.displayName || 'Welcome!'}
            </h1>
            <p className="text-gray-600 mt-1">{currentUser.email}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {currentUser.uid}
                </span>
              </div>
              
              {currentUser.emailVerified !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Email verified:</span>
                  <span className={`text-sm font-medium ${currentUser.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                    {currentUser.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              
              {currentUser.metadata && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last login:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(currentUser.metadata.lastSignInTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {statusMessage && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <svg
            className={`w-5 h-5 ${statusMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {statusMessage.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            )}
          </svg>
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
      
      <div className="w-full max-w-md">
        <EmailPasswordForm
          isRegistering={isRegistering}
          toggleForm={toggleForm}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default AuthPage;