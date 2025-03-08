"use client";

import { useState } from 'react';
import { useUser } from '../context/UserContext';
import axiosInstance from '../services/axiosInstance';

const SignupModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSignup = async () => {
    setError('');
    setIsLoading(true);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/signup', {
        username,
        email,
        password
      });

      const data = response.data;
      setError('');
      
      const loginResponse = await axiosInstance.post('/users/login', {
        username,
        password
      });

      const loginData = loginResponse.data;
      login({
        id: loginData.id,
        username: loginData.username,
        email: loginData.email,
      }, loginData.token);
      onClose();
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message.includes('username')) {
        setError('This username is already taken');
      } else if (error.message.includes('email')) {
        setError('This email is already registered');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-md w-full max-w-lg z-60" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-4">Sign Up</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button 
          onClick={handleSignup} 
          disabled={isLoading}
          className={`w-full p-4 rounded-md text-white transition
            ${isLoading 
              ? 'bg-teal-500/50 cursor-not-allowed' 
              : 'bg-teal-500 hover:bg-teal-600'}`}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
