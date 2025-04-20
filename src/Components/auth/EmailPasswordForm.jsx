import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../../firebase/config';
import { useAuth } from './AuthContext';
import ForgotPasswordForm from './ForgotPassword';

const EmailPasswordForm = ({ isRegistering, toggleForm, onSuccess, onError, onEmailChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { setAuthPersistence } = useAuth();
  const auth = getAuth(app);

  // Handle email change with parent component callback
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (onEmailChange) onEmailChange(e);
  };

  // Form validation
  const validateForm = () => {
    setError(null);
    
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }
    
    // Password validation
    if (password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }
    
    // Additional validation for registration
    if (isRegistering && password !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return false;
    }
    
    return true;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Set persistence before signing in
      await setAuthPersistence(rememberMe);
      
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMsg = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMsg = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Too many failed login attempts. Try again later';
          break;
      }
      
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMsg = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMsg = 'Email already in use. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Invalid email format';
          break;
        case 'auth/weak-password':
          errorMsg = 'Password is too weak';
          break;
      }
      
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (onSuccess) onSuccess('Google sign-in successful!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMsg = 'Google sign-in failed. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  // Handle back from forgot password
  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
    setError(null);
  };

  // Handle password reset success
  const handleResetSuccess = (message) => {
    if (onSuccess) onSuccess(message);
  };

  // Handle password reset error
  const handleResetError = (message) => {
    if (onError) onError(message);
  };

  // Show forgot password form if requested
  if (showForgotPassword) {
    return (
      <ForgotPasswordForm 
        onBack={handleBackFromForgotPassword} 
        initialEmail={email}
        onSuccess={handleResetSuccess}
        onError={handleResetError}
      />
    );
  }

  return (
    <div className="w-full bg-white font-Archivo rounded-xl shadow-lg p-8">
      {/* App Logo/Branding */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-gray-600">
          {isRegistering ? 'Start your journey with us' : 'Sign in to continue to your account'}
        </p>
      </div>
      
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {/* Email Field */}
        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        {/* Confirm Password Field (Only for Registration) */}
        {isRegistering && (
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Confirm password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        )}
        
        {/* Remember Me and Forgot Password (Only for Login) */}
        {!isRegistering && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>
          </div>
        )}
        
        {/* Primary Action Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg text-base transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isRegistering ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>
      
      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      {/* Google Sign In Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex justify-center items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg text-base transition-all shadow-sm hover:shadow"
        >
          {googleLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isRegistering ? 'Sign up with Google' : 'Sign in with Google'}
            </>
          )}
        </button>
      </div>
      
      {/* Toggle Form */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
          <button
            type="button"
            onClick={toggleForm}
            className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            {isRegistering ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          One account. All our services.
        </p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="text-xs text-gray-600 hover:text-gray-800">Terms</a>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-800">Privacy</a>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-800">Help</a>
        </div>
      </div>
    </div>
  );
};

export default EmailPasswordForm;