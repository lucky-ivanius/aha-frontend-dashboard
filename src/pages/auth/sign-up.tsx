import { Button } from "@/components/ui/button";
import { AuthPageLayout } from "@/layouts/auth-page-layout";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { NavLink } from "react-router-dom";

export default function SignUpPage() {
  const { isLoaded } = useAuth();

  return (
    <AuthPageLayout
      title={isLoaded ? "Create your account" : "Aha!"}
      message={isLoaded ? "Sign up to get started with your dashboard" : ""}
    >
      <SignUp
        forceRedirectUrl="/auth/callback"
        signInUrl="/auth/sign-in"
        signInForceRedirectUrl="/auth/callback"
      />
      {isLoaded && (
        <span className="text-gray-600 text-sm">
          Already have an account?{" "}
          <NavLink to="/auth/sign-in">
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:text-blue-800"
            >
              Sign in
            </Button>
          </NavLink>
        </span>
      )}
    </AuthPageLayout>
  );
}
