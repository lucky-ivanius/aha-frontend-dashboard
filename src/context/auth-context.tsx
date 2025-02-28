import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { apiClient } from "@/api/client";
import { User } from "@/types/user";

interface AuthContextType {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  getSessionId: () => string | null;
  signOut: () => Promise<void>;
  updateUser: (data: { name: string }) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sign in with a token from Clerk
  const signInWithToken = async (token: string) => {
    setLoading(true);
    try {
      const authResponse = await apiClient.signIn(token);

      if (!authResponse.ok) {
        throw new Error("Failed to sign in with token");
      }

      sessionStorage.setItem("sid", authResponse.data.sessionToken);

      const userResponse = await apiClient.getCurrentUser();

      setUser(userResponse.data);
    } catch (error) {
      console.error("Failed to sign in with token:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if the user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      setLoading(true);
      try {
        const response = await apiClient.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoaded]);

  const getSessionId = () => {
    return sessionStorage.getItem("sid") || null;
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem("sid");
      await apiClient.signOut();
      await clerkSignOut();
      setUser(null);
    } catch (error) {
      console.error("signOut failed:", error);
    }
  };

  const updateUser = async (data: { name: string }) => {
    try {
      const response = await apiClient.updateCurrentUser(data);
      if (user && response.ok) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        isAuthenticated: !!user,
        getSessionId,
        signOut,
        updateUser,
        signInWithToken,
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
