"use client";

import { useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import {
  calculateAttendanceAmount,
  getWorkDayValue,
} from "@/features/attendance/calculations";
import type {
  AttendanceFormValues,
  WorkerListItem,
} from "@/features/attendance/types";
import { emptyAttendanceFormValues } from "@/features/attendance/types";
import { validateAttendanceForm } from "@/features/attendance/validators";
import type { ProjectListItem } from "@/features/projects/types";
import { useApiForm } from "@/hooks/use-api-form";
import { formatCurrency } from "@/lib/utils/formatters";

type AttendanceFormProps = {
  projects: ProjectListItem[];
  workers: WorkerListItem[];
};

const statusOptions = [
  { value: "present", label: "Present" },
  { value: "half-day", label: "Half-day" },
  { value: "absent", label: "Absent" },
  { value: "overtime", label: "Overtime" },
];

export function AttendanceForm({ projects, workers }: AttendanceFormProps) {
  const {
    values,
    setValues,
    errors,
    setErrors,
    formError,
    busy,
    updateField,
    submitForm,
  } = useApiForm<AttendanceFormValues>(emptyAttendanceFormValues);

  const filteredWorkers = useMemo(
    () => workers.filter((worker) => worker.project_id === values.project_id),
    [workers, values.project_id],
  );

  const selectedWorker = filteredWorkers.find((worker) => worker.id === values.worker_id);
  const dailyRate = selectedWorker?.daily_rate ?? 0;
  const previewAmount = calculateAttendanceAmount({
    dailyRate,
    status: values.status,
    otHours: Number(values.ot_hours || 0),
  });

  function updateAttendanceField<K extends keyof AttendanceFormValues>(
    field: K,
    value: AttendanceFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "project_id") {
        next.worker_id = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateAttendanceForm(values);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    await submitForm({
      endpoint: "/api/attendance",
      payload: {
        ...validation.data,
        daily_rate: dailyRate,
      },
      errorMessage: "Unable to save attendance.",
      resetValues: emptyAttendanceFormValues,
    });
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Mark attendance</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Daily amount is calculated automatically and saved to the transactions table as salary expense.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SelectField
          id="attendanceProject"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={(value) => updateAttendanceField("project_id", value)}
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          error={errors.project_id}
        />
        <SelectField
          id="attendanceWorker"
          label="Worker"
          name="worker_id"
          value={values.worker_id}
          onChange={(value) => updateAttendanceField("worker_id", value)}
          options={filteredWorkers.map((worker) => ({
            value: worker.id,
            label: `${worker.name} - ${worker.designation}`,
          }))}
          placeholder={values.project_id ? "Select worker" : "Select project first"}
          error={errors.worker_id}
        />
        <SelectField
          id="attendanceStatus"
          label="Status"
          name="status"
          value={values.status}
          onChange={(value) => updateField("status", value)}
          options={statusOptions}
          error={errors.status}
        />
        <InputField
          id="attendanceOtHours"
          label="OT hours"
          name="ot_hours"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={values.ot_hours}
          onChange={(value) => updateField("ot_hours", value)}
          error={errors.ot_hours}
        />
        <InputField
          id="attendanceDate"
          label="Attendance date"
          name="attendance_date"
          type="date"
          value={values.attendance_date}
          onChange={(value) => updateField("attendance_date", value)}
          error={errors.attendance_date}
        />

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Auto calculation
          </p>
          <p className="mt-1 text-base font-semibold text-[color:var(--foreground)]">
            {formatCurrency(previewAmount)}
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Work day value: {getWorkDayValue(values.status)}
          </p>
        </div>

        <FormError message={formError} />
        <Button type="submit" busy={busy}>
          Save attendance
        </Button>
      </form>
    </Card>
  );
}
