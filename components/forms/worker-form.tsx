"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type { WorkerFormValues } from "@/features/attendance/types";
import { emptyWorkerFormValues } from "@/features/attendance/types";
import { validateWorkerForm } from "@/features/attendance/validators";
import { useApiForm } from "@/hooks/use-api-form";

type WorkerFormProps = {
  projects: ProjectListItem[];
};

export function WorkerForm({ projects }: WorkerFormProps) {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<WorkerFormValues>(emptyWorkerFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateWorkerForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/workers",
      payload: validation.data,
      errorMessage: "Unable to save worker.",
      resetValues: emptyWorkerFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Create worker</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Add a worker first, then use the attendance form to calculate daily salary expense.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="workerProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <InputField
          id="workerName"
          label="Name"
          name="name"
          placeholder="Abdul Karim"
          value={values.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
        />
        <InputField
          id="workerDesignation"
          label="Designation"
          name="designation"
          placeholder="Mason"
          value={values.designation}
          onChange={(value) => updateField("designation", value)}
          error={errors.designation}
        />
        <InputField
          id="workerRate"
          label="Rate / day"
          name="daily_rate"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.daily_rate}
          onChange={(value) => updateField("daily_rate", value)}
          error={errors.daily_rate}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save worker
        </Button>
      </form>
    </Card>
  );
}
