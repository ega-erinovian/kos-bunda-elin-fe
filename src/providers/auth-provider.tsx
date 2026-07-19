"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      sessionStorage.setItem("user", JSON.stringify(u));
    } else {
      sessionStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
