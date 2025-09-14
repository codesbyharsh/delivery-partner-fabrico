import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API = "http://localhost:5000/api/rider"; 

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load saved user
  useEffect(() => {
    const saved = localStorage.getItem("rider");
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      if (res.data && res.data._id) {
        const rider = {
          id: res.data._id,
          username: res.data.username,
          name: res.data.name,
        };
        setCurrentUser(rider);
        localStorage.setItem("rider", JSON.stringify(rider));
        return { success: true };
      }
      return { success: false, error: "Invalid response" };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Login failed" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rider");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
