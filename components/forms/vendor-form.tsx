"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import type { ProjectListItem } from "@/features/projects/types";
import type { VendorFormValues } from "@/features/vendors/types";
import { emptyVendorFormValues } from "@/features/vendors/types";
import { validateVendorForm } from "@/features/vendors/validators";
import { useApiForm } from "@/hooks/use-api-form";

type VendorFormProps = {
  projects: ProjectListItem[];
};

export function VendorForm({ projects }: VendorFormProps) {
  const { values, errors, formError, busy, updateField, setErrors, submitForm } =
    useApiForm<VendorFormValues>(emptyVendorFormValues);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateVendorForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/vendors",
      payload: validation.data,
      errorMessage: "Unable to save vendor.",
      resetValues: emptyVendorFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Create vendor</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Save vendor details under a project before recording purchases or payments.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="vendorProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <InputField
          id="vendorName"
          label="Vendor name"
          name="name"
          placeholder="ABC Cement Supplier"
          value={values.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
        />
        <InputField
          id="vendorContact"
          label="Contact person"
          name="contact_person"
          placeholder="Rahim"
          value={values.contact_person}
          onChange={(value) => updateField("contact_person", value)}
          error={errors.contact_person}
        />
        <InputField
          id="vendorPhone"
          label="Phone"
          name="phone"
          placeholder="01700000000"
          value={values.phone}
          onChange={(value) => updateField("phone", value)}
          error={errors.phone}
        />
        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save vendor
        </Button>
      </form>
    </Card>
  );
}
