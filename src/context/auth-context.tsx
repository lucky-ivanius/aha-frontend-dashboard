import { apiClient } from "@/api/client";
import { User } from "@/types/user";
import { useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCookies } from "react-cookie";

interface AuthContextType {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  signOut: () => Promise<void>;
  updateUser: (data: { name: string }) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sessionName = "aha_sid";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies<typeof sessionName, { sid: string | null }>([
    sessionName,
  ]);

  // Function to sign in with a token from Clerk
  const signInWithToken = async (token: string) => {
    setLoading(true);
    try {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      const authResponse = await apiClient.signIn(token);

      if (!authResponse.ok || authResponse.status === 401) {
        setUser(null);
        if (isSignedIn) await clerkSignOut();
      }

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
      setLoading(true);

      try {
        if (!isLoaded) return;

        if (!cookies.sid) return;

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
  }, [isLoaded, cookies.sid]);

  const signOut = async () => {
    try {
      await apiClient.signOut();
      if (isSignedIn) await clerkSignOut();
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
        sessionId: cookies.sid,
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
