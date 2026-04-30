"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { MiscExpenseFormValues } from "@/features/misc-expenses/types";
import { emptyMiscExpenseFormValues } from "@/features/misc-expenses/types";
import { validateMiscExpenseForm } from "@/features/misc-expenses/validators";
import type { ProjectListItem } from "@/features/projects/types";
import { useApiForm } from "@/hooks/use-api-form";

type MiscExpenseFormProps = {
  projects: ProjectListItem[];
};

const categoryOptions = [
  { value: "Fuel", label: "Fuel" },
  { value: "Equipment", label: "Equipment (hourly)" },
  { value: "Tendering/CDRS", label: "Tendering/CDRS" },
  { value: "Site expenses", label: "Site expenses" },
];

export function MiscExpenseForm({ projects }: MiscExpenseFormProps) {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<MiscExpenseFormValues>(emptyMiscExpenseFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateMiscExpenseForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/misc-expenses",
      payload: validation.data,
      errorMessage: "Unable to save miscellaneous record.",
      resetValues: emptyMiscExpenseFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Add miscellaneous record
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Each record is saved as an expense and pushed into the central transactions table.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="miscProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="miscCategory"
          label="Category"
          name="category"
          value={values.category}
          onChange={(value) => updateField("category", value)}
          options={categoryOptions}
          error={errors.category}
        />
        <InputField
          id="miscAmount"
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.amount}
          onChange={(value) => updateField("amount", value)}
          error={errors.amount}
        />
        <InputField
          id="miscDate"
          label="Date"
          name="expense_date"
          type="date"
          value={values.expense_date}
          onChange={(value) => updateField("expense_date", value)}
          error={errors.expense_date}
        />
        <InputField
          id="miscDescription"
          label="Description"
          name="description"
          placeholder="Diesel for site generator"
          value={values.description}
          onChange={(value) => updateField("description", value)}
          error={errors.description}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save record
        </Button>
      </form>
    </Card>
  );
}
