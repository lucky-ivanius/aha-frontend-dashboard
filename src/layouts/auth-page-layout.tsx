import { useAuth } from "@/context/auth-context";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
        <p className="text-gray-600">{message}</p>
      </div>
      <div className="flex justify-center w-full max-w-md">{children}</div>
    </div>
  );
}
