import { SignUp } from "@clerk/clerk-react";
import { AuthPageLayout } from "@/layouts/auth-page-layout";

export default function SignUpPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      message="Sign up to get started with your dashboard"
    >
      <SignUp
        forceRedirectUrl="/auth/callback"
        signInUrl="/auth/sign-in"
        signInForceRedirectUrl="/auth/callback"
      />
    </AuthPageLayout>
  );
}
