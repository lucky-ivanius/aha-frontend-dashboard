import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => signOut();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="transparent"
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-1 sm:space-x-2 py-1 px-2"
            >
              <Avatar className="h-10 w-10 sm:h-8 sm:w-8">
                <AvatarImage src="" alt={user?.name || "User"} />
                <AvatarFallback className="text-xs sm:text-sm">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block">{user?.name}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
