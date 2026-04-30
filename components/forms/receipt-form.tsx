"use client";

import { useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { BillListItem, ReceiptFormValues } from "@/features/receivables/types";
import { emptyReceiptFormValues } from "@/features/receivables/types";
import { validateReceiptForm } from "@/features/receivables/validators";
import type { ProjectListItem } from "@/features/projects/types";
import { useApiForm } from "@/hooks/use-api-form";

type ReceiptFormProps = {
  projects: ProjectListItem[];
  bills: BillListItem[];
};

const paymentModeOptions = [
  { value: "UPI", label: "UPI" },
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "Cheque", label: "Cheque" },
];

export function ReceiptForm({ projects, bills }: ReceiptFormProps) {
  const {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    busy,
    updateField,
    submitForm,
  } = useApiForm<ReceiptFormValues>(emptyReceiptFormValues);

  const filteredBills = useMemo(
    () => bills.filter((bill) => bill.project_id === values.project_id),
    [bills, values.project_id],
  );

  function updateReceiptField<K extends keyof ReceiptFormValues>(field: K, value: ReceiptFormValues[K]) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "project_id") {
        next.bill_id = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateReceiptForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/receipts",
      payload: validation.data,
      errorMessage: "Unable to save payment.",
      resetValues: emptyReceiptFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Add payment</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Received payments reduce outstanding receivables and are stored in the master ledger.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="receiptProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateReceiptField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="receiptBill"
          label="Bill"
          name="bill_id"
          value={values.bill_id}
          onChange={(value) => updateReceiptField("bill_id", value)}
          options={filteredBills.map((bill) => ({
            value: bill.id,
            label: `${bill.bill_number} - ${bill.bill_type}`,
          }))}
          placeholder={values.project_id ? "Select bill" : "Select project first"}
          error={errors.bill_id}
        />
        <InputField
          id="receiptAmount"
          label="Amount received"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.amount}
          onChange={(value) => updateField("amount", value)}
          error={errors.amount}
        />
        <InputField
          id="receiptDate"
          label="Date"
          name="receipt_date"
          type="date"
          value={values.receipt_date}
          onChange={(value) => updateField("receipt_date", value)}
          error={errors.receipt_date}
        />
        <SelectField
          id="receiptMode"
          label="Mode"
          name="payment_mode"
          value={values.payment_mode}
          onChange={(value) => updateField("payment_mode", value)}
          options={paymentModeOptions}
          error={errors.payment_mode}
        />
        <InputField
          id="receiptReference"
          label="Reference"
          name="payment_reference"
          placeholder="Bank ref / cheque no."
          value={values.payment_reference}
          onChange={(value) => updateField("payment_reference", value)}
          error={errors.payment_reference}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save payment
        </Button>
      </form>
    </Card>
  );
}
