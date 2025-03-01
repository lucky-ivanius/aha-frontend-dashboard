import { ReactNode } from "react";

interface AuthPageLayoutProps {
  children: ReactNode;
  title: string;
  message?: string;
}

export function AuthPageLayout({
  children,
  title,
  message,
}: AuthPageLayoutProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        {message && <p className="mt-2 text-gray-600">{message}</p>}
      </div>
      <div className="flex flex-col justify-center items-center w-full max-w-md gap-y-4">
        {children}
      </div>
    </div>
  );
}
