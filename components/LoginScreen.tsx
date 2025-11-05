import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getProfileNameFromEmail = (email: string) => {
      const namePart = email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return namePart.replace(/[._]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Please fill in all fields.');
        return;
    }
    
    try {
        if (isLoginView) {
            // Login logic
            const storedUser = localStorage.getItem(`user-${email}`);
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.password === password) {
                    // Use stored name, with fallback for older accounts
                    onLoginSuccess({ name: user.name || getProfileNameFromEmail(email) });
                } else {
                    setError('Invalid password.');
                }
            } else {
                setError('No account found with this email.');
            }
        } else {
            // Sign-up logic
            if (!name.trim()) {
                setError('Please enter your name.');
                return;
            }
            if (localStorage.getItem(`user-${email}`)) {
                setError('An account with this email already exists.');
                return;
            }
            const profileName = name.trim();
            const newUser = { name: profileName, email, password };
            localStorage.setItem(`user-${email}`, JSON.stringify(newUser));
            onLoginSuccess({ name: profileName });
        }
    } catch (e) {
        setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleGuestLogin = () => {
      onLoginSuccess({ name: 'Guest' });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-8 max-w-sm mx-auto w-full bg-gray-800/50 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700/50">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
          {isLoginView ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-400 mb-8">
          {isLoginView ? 'Log in to continue.' : 'Sign up to get started.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
             {!isLoginView && (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    aria-label="Your Name"
                    required
                />
             )}
             <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-gray-700/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                aria-label="Email Address"
            />
             <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-gray-700/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                aria-label="Password"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 text-lg"
            >
                {isLoginView ? 'Log In' : 'Sign Up'}
            </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button
          onClick={handleGuestLogin}
          className="w-full bg-gray-700/60 text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-600/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
        >
          Continue as Guest
        </button>

         <p className="text-xs text-gray-500 mt-6">
            {isLoginView ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-semibold text-purple-400 hover:underline focus:outline-none">
                {isLoginView ? 'Sign Up' : 'Log In'}
            </button>
        </p>
         <p className="text-xs text-gray-600 mt-4 italic">
          Note: This is a demo login and is not secure. Do not use real passwords.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;