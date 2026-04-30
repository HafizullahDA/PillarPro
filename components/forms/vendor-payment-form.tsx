"use client";

import { useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type {
  VendorListItem,
  VendorPaymentFormValues,
} from "@/features/vendors/types";
import { emptyVendorPaymentFormValues } from "@/features/vendors/types";
import { validateVendorPaymentForm } from "@/features/vendors/validators";
import { useApiForm } from "@/hooks/use-api-form";

type VendorPaymentFormProps = {
  projects: ProjectListItem[];
  vendors: VendorListItem[];
};

const paymentModes = [
  { value: "UPI", label: "UPI" },
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "Cheque", label: "Cheque" },
];

export function VendorPaymentForm({
  projects,
  vendors,
}: VendorPaymentFormProps) {
  const {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    busy,
    updateField,
    submitForm,
  } = useApiForm<VendorPaymentFormValues>(emptyVendorPaymentFormValues);

  const filteredVendors = useMemo(
    () => vendors.filter((vendor) => vendor.project_id === values.project_id),
    [vendors, values.project_id],
  );

  function updatePaymentField<K extends keyof VendorPaymentFormValues>(
    field: K,
    value: VendorPaymentFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "project_id") {
        next.vendor_id = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateVendorPaymentForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/vendor-payments",
      payload: validation.data,
      errorMessage: "Unable to save payment.",
      resetValues: emptyVendorPaymentFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Add payment</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Saving a payment will also create a payment record in the central transactions table.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="paymentProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updatePaymentField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="paymentVendor"
          label="Vendor"
          name="vendor_id"
          value={values.vendor_id}
          onChange={(value) => updatePaymentField("vendor_id", value)}
          options={filteredVendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
          placeholder={values.project_id ? "Select vendor" : "Select project first"}
          error={errors.vendor_id}
        />
        <InputField
          id="paymentAmount"
          label="Amount paid"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.amount}
          onChange={(value) => updateField("amount", value)}
          error={errors.amount}
        />
        <SelectField
          id="paymentMode"
          label="Mode"
          name="payment_mode"
          value={values.payment_mode}
          onChange={(value) => updateField("payment_mode", value)}
          options={paymentModes}
          error={errors.payment_mode}
        />
        <InputField
          id="paymentReference"
          label="Reference"
          name="payment_reference"
          placeholder="Txn ID / cheque no."
          value={values.payment_reference}
          onChange={(value) => updateField("payment_reference", value)}
          error={errors.payment_reference}
        />
        <InputField
          id="paymentDate"
          label="Date"
          name="payment_date"
          type="date"
          value={values.payment_date}
          onChange={(value) => updateField("payment_date", value)}
          error={errors.payment_date}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save payment
        </Button>
      </form>
    </Card>
  );
}
