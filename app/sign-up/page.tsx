import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/forms/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="PillarPro Access"
      title="Create your account"
      description="Sign up with your name, email, and password. We’ll send a verification email before you can access the ERP."
      footerText="Already have an account?"
      footerLinkHref="/sign-in"
      footerLinkLabel="Sign in"
    >
      <SignUpForm />
    </AuthShell>
  );
}
