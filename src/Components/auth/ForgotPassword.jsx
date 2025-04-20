import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../../firebase/config';

const ForgotPasswordForm = ({ onBack, initialEmail = '', onSuccess, onError }) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const auth = getAuth(app);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address';
      setMessage({ type: 'error', text: errorMsg });
      if (onError) onError(errorMsg);
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      const successMsg = 'Password reset email sent! Check your inbox.';
      setMessage({ type: 'success', text: successMsg });
      if (onSuccess) onSuccess(successMsg);
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMsg = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMsg = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Too many attempts. Try again later';
          break;
      }
      
      setMessage({ type: 'error', text: errorMsg });
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div 
            className={`p-3 text-sm rounded-lg border flex items-center ${
              message.type === 'success' 
                ? 'text-green-600 bg-green-50 border-green-100' 
                : 'text-red-600 bg-red-50 border-red-100'
            }`}
          >
            <svg 
              className={`w-5 h-5 mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              )}
            </svg>
            {message.text}
          </div>
        )}
        
        {/* Email Field */}
        <div className="relative">
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
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
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        {/* Submit Button */}
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
            ) : (
              'Send Reset Link'
            )}
          </button>
        </div>
        
        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to sign in
          </button>
        </div>
      </form>
      
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

export default ForgotPasswordForm;