import { ClerkProvider } from "@clerk/clerk-react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute, PublicRoute } from "@/layouts/auth-layout";

import "./clerk.css";

// Pages
import AuthCallback from "@/pages/auth/callback";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import Dashboard from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import EditProfilePage from "@/pages/profile/edit";
import PasswordPage from "@/pages/profile/password";

// Get Clerk publishable key from environment variable
// You can set this in .env.local file (e.g., VITE_CLERK_PUBLISHABLE_KEY=pk_test_...)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        variables: {
          colorPrimary: "hsl(240, 5.9%, 10%)",
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/auth/sign-in" element={<SignInPage />} />
              <Route path="/auth/sign-up" element={<SignUpPage />} />
              {/* Auth callback route - handles Clerk redirect */}
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/password" element={<PasswordPage />} />
            </Route>

            {/* Redirect to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
