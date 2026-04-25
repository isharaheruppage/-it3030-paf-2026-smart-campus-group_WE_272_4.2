import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "smart-campus-booking-auth";

const DEMO_USERS = {
  USER: {
    id: 2,
    name: "Student User",
    email: "student@smartcampus.local",
    role: "USER"
  },
  ADMIN: {
    id: 1,
    name: "Admin User",
    email: "admin@smartcampus.local",
    role: "ADMIN"
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const loginAs = (role) => {
    const selectedUser = DEMO_USERS[role];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
    setCurrentUser(selectedUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        loginAs,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
