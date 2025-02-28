import { SignIn } from "@clerk/clerk-react";
import { AuthPageLayout } from "@/layouts/auth-page-layout";

export default function SignInPage() {
  return (
    <AuthPageLayout
      title="Welcome back!"
      message="Please sign in to access your dashboard"
    >
      <SignIn
        forceRedirectUrl="/auth/callback"
        signUpForceRedirectUrl="/auth/callback"
        signInUrl="/auth/sign-in"
        signUpUrl="/auth/sign-up"
      />
    </AuthPageLayout>
  );
}
