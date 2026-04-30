"use client";

import { useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type {
  PartnerListItem,
  PartnerTransactionFormValues,
} from "@/features/partners/types";
import { emptyPartnerTransactionFormValues } from "@/features/partners/types";
import { validatePartnerTransactionForm } from "@/features/partners/validators";
import { useApiForm } from "@/hooks/use-api-form";

type PartnerTransactionFormProps = {
  projects: ProjectListItem[];
  partners: PartnerListItem[];
};

const entryTypeOptions = [
  { value: "paid_by_partner", label: "Paid by partner" },
  { value: "received_by_partner", label: "Received by partner" },
];

const paymentModeOptions = [
  { value: "UPI", label: "UPI" },
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "Cheque", label: "Cheque" },
];

export function PartnerTransactionForm({
  projects,
  partners,
}: PartnerTransactionFormProps) {
  const {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    busy,
    updateField,
    submitForm,
  } = useApiForm<PartnerTransactionFormValues>(emptyPartnerTransactionFormValues);

  const filteredPartners = useMemo(
    () => partners.filter((partner) => partner.project_id === values.project_id),
    [partners, values.project_id],
  );

  function updateTransactionField<K extends keyof PartnerTransactionFormValues>(
    field: K,
    value: PartnerTransactionFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "project_id") {
        next.partner_id = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validatePartnerTransactionForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/partner-transactions",
      payload: validation.data,
      errorMessage: "Unable to save partner transaction.",
      resetValues: emptyPartnerTransactionFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Record partner transaction
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Paid by partner increases balance. Received by partner decreases balance.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="partnerTransactionProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateTransactionField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="partnerTransactionPartner"
          label="Partner"
          name="partner_id"
          value={values.partner_id}
          onChange={(value) => updateTransactionField("partner_id", value)}
          options={filteredPartners.map((partner) => ({
            value: partner.id,
            label: partner.name,
          }))}
          placeholder={values.project_id ? "Select partner" : "Select project first"}
          error={errors.partner_id}
        />
        <SelectField
          id="partnerEntryType"
          label="Transaction type"
          name="entry_type"
          value={values.entry_type}
          onChange={(value) => updateField("entry_type", value)}
          options={entryTypeOptions}
          error={errors.entry_type}
        />
        <InputField
          id="partnerAmount"
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
          id="partnerDate"
          label="Date"
          name="transaction_date"
          type="date"
          value={values.transaction_date}
          onChange={(value) => updateField("transaction_date", value)}
          error={errors.transaction_date}
        />
        <SelectField
          id="partnerMode"
          label="Mode"
          name="payment_mode"
          value={values.payment_mode}
          onChange={(value) => updateField("payment_mode", value)}
          options={paymentModeOptions}
          error={errors.payment_mode}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save transaction
        </Button>
      </form>
    </Card>
  );
}
