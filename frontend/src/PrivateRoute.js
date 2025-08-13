import { useAuth } from './AuthContext';
import { Navigate } from 'react-router';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <Navigate to="/" />;
};

export default PrivateRoute;
