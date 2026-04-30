"use client";

import type { FormEvent } from "react";
import { useApiForm } from "@/hooks/use-api-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import type { ProjectFormValues } from "@/features/projects/types";
import { emptyProjectFormValues } from "@/features/projects/types";
import { validateProjectForm } from "@/features/projects/validators";

export function ProjectForm() {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<ProjectFormValues>(emptyProjectFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateProjectForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/projects",
      payload: validation.data,
      errorMessage: "Unable to save project.",
      resetValues: emptyProjectFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Create project</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Fill in the main project details. These fields are saved to Supabase.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <InputField
          id="name"
          label="Project name"
          name="name"
          placeholder="Road widening package A"
          value={values.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
        />

        <InputField
          id="agencyName"
          label="Agency name"
          name="agency_name"
          placeholder="Public Works Department"
          value={values.agency_name}
          onChange={(value) => updateField("agency_name", value)}
          error={errors.agency_name}
        />

        <InputField
          id="advertisedCost"
          label="Advertised cost"
          name="advertised_cost"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.advertised_cost}
          onChange={(value) => updateField("advertised_cost", value)}
          error={errors.advertised_cost}
        />

        <InputField
          id="awardedAmount"
          label="Awarded amount"
          name="awarded_amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.awarded_amount}
          onChange={(value) => updateField("awarded_amount", value)}
          error={errors.awarded_amount}
        />

        <InputField
          id="startDate"
          label="Start date"
          name="start_date"
          type="date"
          value={values.start_date}
          onChange={(value) => updateField("start_date", value)}
          error={errors.start_date}
        />

        <FormError message={formError} />

        <Button type="submit" busy={busy}>
          Save project
        </Button>
      </form>
    </Card>
  );
}
