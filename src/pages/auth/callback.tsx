import { useEffect, useState, useRef } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export default function AuthCallback() {
  const { signInWithToken, getSessionId } = useAuth();
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (getSessionId()) navigate("/dashboard", { replace: true });

      if (!isLoaded) return;

      try {
        // If user is signed in with Clerk
        if (isSignedIn) {
          // Set flag to prevent duplicate processing
          isProcessingRef.current = true;

          // Get token from Clerk
          const token = await getToken();
          if (!token) {
            throw new Error("Failed to get token from Clerk");
          }

          // Sign in with our backend
          await signInWithToken(token);

          // Redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/auth/sign-in", { replace: true });
        }
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError("Authentication failed. Please try signing in again.");
        navigate("/auth/sign-in", { replace: true });
      }
    };

    handleCallback();
  }, [getSessionId, isSignedIn, isLoaded, getToken, signInWithToken, navigate]);

  // Show loading state
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
            <div className="mt-2">
              <button
                onClick={() => navigate("/auth/sign-in")}
                className="text-blue-600 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mb-4 text-2xl font-bold">
              Completing authentication...
            </h1>
            <p className="text-gray-600">
              Please wait while we authenticate your account.
            </p>
            <div className="mt-4 h-2 w-32 animate-pulse rounded-full bg-blue-500 mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
}
