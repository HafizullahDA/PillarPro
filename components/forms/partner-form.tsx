"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type { PartnerFormValues } from "@/features/partners/types";
import { emptyPartnerFormValues } from "@/features/partners/types";
import { validatePartnerForm } from "@/features/partners/validators";
import { useApiForm } from "@/hooks/use-api-form";

type PartnerFormProps = {
  projects: ProjectListItem[];
};

export function PartnerForm({ projects }: PartnerFormProps) {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<PartnerFormValues>(emptyPartnerFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validatePartnerForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/partners",
      payload: validation.data,
      errorMessage: "Unable to save partner.",
      resetValues: emptyPartnerFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Add partner</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Save a partner under a project before recording partner account entries.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="partnerProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <InputField
          id="partnerName"
          label="Partner name"
          name="name"
          placeholder="Md. Hasan"
          value={values.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save partner
        </Button>
      </form>
    </Card>
  );
}
