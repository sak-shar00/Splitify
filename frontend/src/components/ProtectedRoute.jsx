import { Navigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getCookie('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;