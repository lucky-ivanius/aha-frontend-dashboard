import { AuthPageLayout } from "@/layouts/auth-page-layout";
import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <AuthPageLayout title="Aha!">
      <SignIn
        forceRedirectUrl="/auth/callback"
        signUpForceRedirectUrl="/auth/callback"
        signInUrl="/auth/sign-in"
        signUpUrl="/auth/sign-up"
      />
    </AuthPageLayout>
  );
}
