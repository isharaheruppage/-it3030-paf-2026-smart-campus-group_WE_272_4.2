import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const STORAGE_KEY = "smart-campus-booking-auth";
const TOKEN_KEY = "smart-campus-booking-token";

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

function buildCurrentUserFromToken(token) {
  const decoded = jwtDecode(token);
  const email = decoded.sub || "";
  const normalizedRoles = decoded.roles
    ? decoded.roles.split(",").map((role) => role.replace(/^ROLE_/, ""))
    : [];

  return {
    id: decoded.userId || email,
    name: decoded.name || email.split("@")[0] || email,
    email,
    role: normalizedRoles[0] || "USER",
    roles: normalizedRoles,
    token
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (savedToken) {
      try {
        setCurrentUser(buildCurrentUserFromToken(savedToken));
        return;
      } catch (error) {
        console.error("Invalid saved token", error);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(buildCurrentUserFromToken(token));
  };

  const loginAs = (role) => {
    const selectedUser = DEMO_USERS[role];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser));
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(selectedUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
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
