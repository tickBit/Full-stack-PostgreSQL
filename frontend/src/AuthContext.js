import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);

  }, [isLoggedIn, username, token]);

  const login = ( name, token ) => {
    setIsLoggedIn(true);
    setUsername(name);
    setToken(token);
  };

  const logout = () => {
    
    setIsLoggedIn(false);
    setUsername('');
    setToken('');

    //localStorage.removeItem('isLoggedIn');
    //localStorage.removeItem('username');
    //localStorage.removeItem('token');

  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
