import { createContext, useContext, useState, useEffect } from "react";
import { getUser, saveUser, clearUser } from "../utils/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 added

  // load user from localStorage on app start
  useEffect(() => {
    const storedUser = getUser();

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false); // 🔥 important
  }, []);

  // login function
  const login = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  // logout function
  const logout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};