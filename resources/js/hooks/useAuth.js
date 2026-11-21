import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const token = authService.getToken();

      if (token) {
        try {
          const userData = await authService.getUser();
          if (active) {
            authService.storeAuth(token, userData);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (error) {
          authService.clearAuth();
          if (active) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }

      if (active) setIsLoading(false);
    };

    initAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user: userData } = response;

    authService.storeAuth(token, userData);
    setUser(userData);
    setIsAuthenticated(true);

    return response;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authService.register(name, email, password);
    const { token, user: userData } = response;

    authService.storeAuth(token, userData);
    setUser(userData);
    setIsAuthenticated(true);

    return response;
  }, []);

  const loginAdmin = useCallback(async (email, password) => {
    const response = await authService.loginAdmin(email, password);
    const { token, user: userData } = response;

    authService.storeAuth(token, userData);
    setUser(userData);
    setIsAuthenticated(true);

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginAdmin,
    logout,
    updateUser,
  };
};

export default useAuth;
