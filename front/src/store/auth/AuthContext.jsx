import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const role = localStorage.getItem("userRole");
    const storedUserId = localStorage.getItem("userId");

    if (token) {
      setIsAuth(true);
      setUserRole(role);
      setUserId(storedUserId);
    }

    setIsLoading(false);
  }, []);

  const login = (token, role, userId) => {
    localStorage.setItem("jwt", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", userId);
    setIsAuth(true);
    setUserRole(role);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsAuth(false);
    setUserRole(null);
    setUserId(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ isAuth, userRole, userId, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
