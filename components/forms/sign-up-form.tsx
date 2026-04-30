"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { useApiForm } from "@/hooks/use-api-form";
import type { SignUpFormValues } from "@/features/auth/types";
import { emptySignUpFormValues } from "@/features/auth/types";
import { validateSignUpForm } from "@/features/auth/validators";

export function SignUpForm() {
  const router = useRouter();
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<SignUpFormValues>(emptySignUpFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateSignUpForm(values);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const success = await submitForm({
      endpoint: "/api/auth/sign-up",
      payload: values,
      errorMessage: "Unable to create account.",
      resetValues: emptySignUpFormValues,
    });

    if (success) {
      router.push("/sign-in?message=Check your email to verify your PillarPro account.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        id="signUpName"
        label="Name"
        name="name"
        placeholder="Your full name"
        value={values.name}
        onChange={(value) => updateField("name", value)}
        error={errors.name}
      />
      <InputField
        id="signUpEmail"
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(value) => updateField("email", value)}
        error={errors.email}
      />
      <InputField
        id="signUpPassword"
        label="Password"
        name="password"
        type="password"
        placeholder="Minimum 8 characters"
        value={values.password}
        onChange={(value) => updateField("password", value)}
        error={errors.password}
      />
      <InputField
        id="signUpConfirmPassword"
        label="Confirm password"
        name="confirm_password"
        type="password"
        placeholder="Repeat your password"
        value={values.confirm_password}
        onChange={(value) => updateField("confirm_password", value)}
        error={errors.confirm_password}
      />
      <FormError message={formError} />
      <Button type="submit" busy={busy}>
        Create account
      </Button>
    </form>
  );
}
