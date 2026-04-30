"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { useApiForm } from "@/hooks/use-api-form";
import type { SignInFormValues } from "@/features/auth/types";
import { emptySignInFormValues } from "@/features/auth/types";
import { validateSignInForm } from "@/features/auth/validators";

export function SignInForm() {
  const router = useRouter();
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<SignInFormValues>(emptySignInFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateSignInForm(values);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const success = await submitForm({
      endpoint: "/api/auth/sign-in",
      payload: values,
      errorMessage: "Unable to sign in.",
      resetValues: emptySignInFormValues,
    });

    if (success) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        id="signInEmail"
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(value) => updateField("email", value)}
        error={errors.email}
      />
      <InputField
        id="signInPassword"
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={(value) => updateField("password", value)}
        error={errors.password}
      />
      <FormError message={formError} />
      <Button type="submit" busy={busy}>
        Sign in
      </Button>
    </form>
  );
}
