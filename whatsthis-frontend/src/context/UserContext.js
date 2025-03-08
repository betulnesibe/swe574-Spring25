"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async (retries = 1) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          setUser(null);
          return;
        }

        // Set token in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Instead of decoding token, use the stored user data
          const storedUserData = localStorage.getItem('userData');
          if (!storedUserData) {
            throw new Error('No user data found');
          }

          const userData = JSON.parse(storedUserData);
          if (!userData.id) {
            throw new Error('Invalid user data');
          }

          const response = await axiosInstance.get(`/users/${userData.id}`);
          
          if (response.data) {
            setUser(response.data);
            setToken(token);
          } else {
            throw new Error('No user data returned');
          }
        } catch (error) {
          console.error('Session restoration error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          delete axiosInstance.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        if (retries > 0) {
          setTimeout(() => restoreSession(retries - 1), 1000);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, setUser, setToken, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
