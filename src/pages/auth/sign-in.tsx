import { Button } from "@/components/ui/button";
import { AuthPageLayout } from "@/layouts/auth-page-layout";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { NavLink } from "react-router-dom";

export default function SignInPage() {
  const { isLoaded } = useAuth();

  return (
    <AuthPageLayout
      title="Aha!"
      message={isLoaded ? "Continue to your dashboard!" : ""}
    >
      <SignIn
        forceRedirectUrl="/auth/callback"
        signUpForceRedirectUrl="/auth/callback"
        signInUrl="/auth/sign-in"
        signUpUrl="/auth/sign-up"
      />
      {isLoaded && (
        <span className="text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <NavLink to="/auth/sign-up">
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:text-blue-800"
            >
              Sign up here
            </Button>
          </NavLink>
        </span>
      )}
    </AuthPageLayout>
  );
}
