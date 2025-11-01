"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  rollNo: string | null;
  login: (rollNo: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rollNo, setRollNo] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("student_roll_no");
    if (stored) {
      setRollNo(stored);
    }
    setIsLoaded(true);
  }, []);

  const login = (newRollNo: string) => {
    localStorage.setItem("student_roll_no", newRollNo);
    setRollNo(newRollNo);
  };

  const logout = () => {
    localStorage.removeItem("student_roll_no");
    setRollNo(null);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        rollNo,
        login,
        logout,
        isAuthenticated: !!rollNo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
