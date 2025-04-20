import React from 'react';
import { useAuth } from './AuthContext';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome!</h2>
      
      <div className="flex items-center justify-center mb-4">
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt="Profile" 
            className="h-16 w-16 rounded-full border-2 border-blue-500"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
      
      <div className="mb-4 text-center">
        {currentUser.displayName && (
          <p className="font-semibold text-lg">{currentUser.displayName}</p>
        )}
        <p className="text-gray-600">{currentUser.email}</p>
      </div>
      
      <div className="mt-6">
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
