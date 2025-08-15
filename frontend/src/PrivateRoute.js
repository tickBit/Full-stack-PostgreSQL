import { useAuth } from './AuthContext';
import { Navigate } from 'react-router';
import PleaseLogin from './components/PleaseLogin';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <PleaseLogin />;
};

export default PrivateRoute;
