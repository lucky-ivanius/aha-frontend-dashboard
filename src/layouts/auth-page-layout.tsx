import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface AuthPageLayoutProps {
  children: ReactNode;
  title: string;
  message: string;
}

export function AuthPageLayout({
  children,
  title,
  message,
}: AuthPageLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [pageLoaded, setPageLoaded] = useState(false);

  // Set page as loaded after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300); // Small delay to prevent flash of content
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated with our backend
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        {/* Only show the message once we're sure it's needed */}
        {!loading && pageLoaded && <p className="text-gray-600">{message}</p>}
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
