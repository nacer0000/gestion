import { useState, useEffect } from 'react';
import { authAPI } from '../config/api';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const response = await authAPI.verify();
        if (response.data.valid) {
          const user = response.data.user;
          setUser({
            id: user.id,
            email: user.email,
            role: user.role,
            magasin_id: user.magasin_id,
            createdAt: new Date(user.created_at)
          });
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        magasin_id: userData.magasin_id,
        createdAt: new Date(userData.created_at)
      });
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return { user, loading, login, logout };
};