import { useAuth } from "@/context/auth-context";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const { getSessionId, signInWithToken } = useAuth();
  const { getToken, signOut: clerkSignOut, isSignedIn } = useClerkAuth();
  const navigate = useNavigate();
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (getSessionId()) return navigate("/dashboard", { replace: true });

      if (isSignedIn) {
        const token = await getToken();
        if (!token) return clerkSignOut({ redirectUrl: "/auth/sign-in" });

        await signInWithToken(token);
      }
    };

    handleCallback();
  }, [
    clerkSignOut,
    getSessionId,
    getToken,
    isSignedIn,
    navigate,
    signInWithToken,
  ]);

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
