import { apiClient } from "@/api/client";
import { User } from "@/types/user";
import { useClerk } from "@clerk/clerk-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

const sessionName = "sid";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sign in with a token from Clerk
  const signInWithToken = async (token: string) => {
    const signInResponse = await apiClient.signIn(token);
    if (!signInResponse.ok)
      return clerkSignOut({ redirectUrl: "/auth/sign-in" });

    localStorage.setItem(sessionName, signInResponse.data.sessionToken);

    const currentUserResponse = await apiClient.getCurrentUser();
    if (currentUserResponse.status === 401) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(currentUserResponse.data);
    setLoading(false);
  };

  // Check if the user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      if (!getSessionId()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUserResponse = await apiClient.getCurrentUser();
      if (currentUserResponse.status === 401) {
        localStorage.removeItem(sessionName);
        await apiClient.signOut();
        setUser(null);
        setLoading(false);
        return clerkSignOut({ redirectUrl: "/auth/sign-in" });
      }

      setUser(currentUserResponse.data);
      setLoading(false);
    };

    checkAuth();
  }, [clerkSignOut]);

  const getSessionId = () => {
    return localStorage.getItem(sessionName);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(sessionName);
      await apiClient.signOut();
      await clerkSignOut({ redirectUrl: "/auth/sign-in" });
      setUser(null);
    } catch (error) {
      console.error("signOut failed:", error);
    }
  };

  const updateUser = async (data: { name: string }) => {
    const response = await apiClient.updateCurrentUser(data);
    if (response.status === 401) return signOut();
    if (user) setUser({ ...user, ...data });
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
