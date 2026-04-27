import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pickit_token");
    }
    return null;
  });

  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("pickit_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("pickit_token");
    setToken(null);
  };

  const isLoading = !!token && isUserLoading;

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
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
