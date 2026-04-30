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
  VendorPurchaseFormValues,
} from "@/features/vendors/types";
import { emptyVendorPurchaseFormValues } from "@/features/vendors/types";
import { validateVendorPurchaseForm } from "@/features/vendors/validators";
import { formatCurrency } from "@/lib/utils/formatters";
import { useApiForm } from "@/hooks/use-api-form";

type VendorPurchaseFormProps = {
  projects: ProjectListItem[];
  vendors: VendorListItem[];
};

export function VendorPurchaseForm({
  projects,
  vendors,
}: VendorPurchaseFormProps) {
  const {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    busy,
    updateField,
    submitForm,
  } = useApiForm<VendorPurchaseFormValues>(emptyVendorPurchaseFormValues);

  const filteredVendors = useMemo(
    () => vendors.filter((vendor) => vendor.project_id === values.project_id),
    [vendors, values.project_id],
  );

  const quantity = Number(values.quantity || 0);
  const rate = Number(values.rate || 0);
  const previewAmount = quantity > 0 && rate > 0 ? quantity * rate : 0;

  function updatePurchaseField<K extends keyof VendorPurchaseFormValues>(
    field: K,
    value: VendorPurchaseFormValues[K],
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
    const validation = validateVendorPurchaseForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/vendor-purchases",
      payload: validation.data,
      errorMessage: "Unable to save purchase.",
      resetValues: emptyVendorPurchaseFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Add purchase</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Saving a purchase will also create an expense record in the central transactions table.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="purchaseProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updatePurchaseField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="purchaseVendor"
          label="Vendor"
          name="vendor_id"
          value={values.vendor_id}
          onChange={(value) => updatePurchaseField("vendor_id", value)}
          options={filteredVendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
          placeholder={values.project_id ? "Select vendor" : "Select project first"}
          error={errors.vendor_id}
        />
        <InputField
          id="purchaseMaterial"
          label="Material"
          name="material"
          placeholder="Cement"
          value={values.material}
          onChange={(value) => updateField("material", value)}
          error={errors.material}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            id="purchaseQuantity"
            label="Quantity"
            name="quantity"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={values.quantity}
            onChange={(value) => updateField("quantity", value)}
            error={errors.quantity}
          />
          <InputField
            id="purchaseRate"
            label="Rate"
            name="rate"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={values.rate}
            onChange={(value) => updateField("rate", value)}
            error={errors.rate}
          />
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Amount
          </p>
          <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
            {formatCurrency(previewAmount)}
          </p>
        </div>
        <InputField
          id="purchaseDate"
          label="Date"
          name="purchase_date"
          type="date"
          value={values.purchase_date}
          onChange={(value) => updateField("purchase_date", value)}
          error={errors.purchase_date}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save purchase
        </Button>
      </form>
    </Card>
  );
}
