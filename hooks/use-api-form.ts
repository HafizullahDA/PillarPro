"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiFormResponse = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type SubmitFormOptions<TPayload, TValues> = {
  endpoint: string;
  payload: TPayload;
  errorMessage: string;
  resetValues?: TValues;
};

export function useApiForm<TValues>(initialValues: TValues) {
  const router = useRouter();
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField<K extends keyof TValues>(field: K, value: TValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field as string]: "" }));
  }

  function resetForm(nextValues = initialValues) {
    setValues(nextValues);
    setErrors({});
    setFormError("");
  }

  async function submitForm<TPayload>({
    endpoint,
    payload,
    errorMessage,
    resetValues,
  }: SubmitFormOptions<TPayload, TValues>) {
    setBusy(true);
    setFormError("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiFormResponse;

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? errorMessage);
        return false;
      }

      resetForm(resetValues);
      router.refresh();
      return true;
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    setFormError,
    busy,
    updateField,
    resetForm,
    submitForm,
  };
}
