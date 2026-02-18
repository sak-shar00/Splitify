import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user, 
        token: action.payload.token,
        error: null 
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, token: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: !!getCookie('token'),
  user: null,
  token: getCookie('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = getCookie('token');
    const userData = getCookie('user');
    if (token) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: userData ? JSON.parse(userData) : {} } });
    }
  }, []);

  const login = (token, user) => {
    setCookie('token', token);
    setCookie('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
  };

  const logout = () => {
    deleteCookie('token');
    deleteCookie('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const setLoading = (loading) => {
    dispatch({ type: loading ? 'LOGIN_START' : 'LOGIN_ERROR', payload: null });
  };

  const setError = (error) => {
    dispatch({ type: 'LOGIN_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      setLoading,
      setError,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};