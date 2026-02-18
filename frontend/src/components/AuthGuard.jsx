import { Navigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';

const AuthGuard = ({ children }) => {
  const isAuthenticated = !!getCookie('token');
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default AuthGuard;