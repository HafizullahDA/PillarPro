import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/forms/sign-in-form";

type SignInPageProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="PillarPro Access"
      title="Sign in"
      description="Use your verified email and password to access PillarPro."
      footerText="Need a new account?"
      footerLinkHref="/sign-up"
      footerLinkLabel="Create one"
    >
      {params?.message ? (
        <p className="mb-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          {params.message}
        </p>
      ) : null}
      <SignInForm />
    </AuthShell>
  );
}
