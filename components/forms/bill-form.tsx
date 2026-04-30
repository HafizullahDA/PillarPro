"use client";

import { useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type { BillFormValues } from "@/features/receivables/types";
import { emptyBillFormValues } from "@/features/receivables/types";
import { validateBillForm } from "@/features/receivables/validators";
import { useApiForm } from "@/hooks/use-api-form";
import { formatCurrency } from "@/lib/utils/formatters";

type BillFormProps = {
  projects: ProjectListItem[];
};

const billTypeOptions = [
  { value: "running", label: "Running" },
  { value: "final", label: "Final" },
];

export function BillForm({ projects }: BillFormProps) {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<BillFormValues>(emptyBillFormValues);

  const previewNetPayable = useMemo(() => {
    const gross = Number(values.gross_amount || 0);
    const deductions = Number(values.deductions || 0);
    const result = gross - deductions;
    return result > 0 ? result : 0;
  }, [values.deductions, values.gross_amount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateBillForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/bills",
      payload: validation.data,
      errorMessage: "Unable to save bill.",
      resetValues: emptyBillFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Add bill</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Bills create receivable ledger entries and increase outstanding amount.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="billProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <InputField
          id="billNumber"
          label="Bill number"
          name="bill_number"
          placeholder="RA-001"
          value={values.bill_number}
          onChange={(value) => updateField("bill_number", value)}
          error={errors.bill_number}
        />
        <SelectField
          id="billType"
          label="Bill type"
          name="bill_type"
          value={values.bill_type}
          onChange={(value) => updateField("bill_type", value)}
          options={billTypeOptions}
          error={errors.bill_type}
        />
        <InputField
          id="billDate"
          label="Bill date"
          name="bill_date"
          type="date"
          value={values.bill_date}
          onChange={(value) => updateField("bill_date", value)}
          error={errors.bill_date}
        />
        <InputField
          id="grossAmount"
          label="Gross amount"
          name="gross_amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.gross_amount}
          onChange={(value) => updateField("gross_amount", value)}
          error={errors.gross_amount}
        />
        <InputField
          id="deductions"
          label="Deductions"
          name="deductions"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.deductions}
          onChange={(value) => updateField("deductions", value)}
          error={errors.deductions}
        />
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Net payable
          </p>
          <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
            {formatCurrency(previewNetPayable)}
          </p>
        </div>
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save bill
        </Button>
      </form>
    </Card>
  );
}
