import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { app } from '../../firebase/config';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  
  // Cookie management
  const setUserCookie = (user) => {
    if (user) {
      // Store minimal user info in cookie (avoid storing sensitive data)
      Cookies.set('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      }), { expires: 7, secure: true, sameSite: 'strict' });
    } else {
      Cookies.remove('authUser');
    }
  };
  
  // Set persistence type (local or session)
  const setAuthPersistence = async (rememberMe) => {
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
    } catch (error) {
      console.error('Error setting persistence:', error);
    }
  };
  
  // Send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later';
          break;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setUserCookie(user);
    });
    
    // Try to restore user from cookie if not authenticated
    if (!currentUser) {
      const userCookie = Cookies.get('authUser');
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie);
          // This doesn't fully authenticate the user, but provides basic info until Firebase auth completes
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error parsing user cookie:', error);
        }
      }
    }
    
    return unsubscribe;
  }, [auth]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserCookie(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
    setAuthPersistence,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};