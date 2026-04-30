import {
  calculateAttendanceAmount,
  getWorkDayValue,
} from "@/features/attendance/calculations";
import type {
  AttendanceFormValues,
  AttendanceInsert,
  WorkerFormValues,
  WorkerInsert,
} from "@/features/attendance/types";

const allowedStatuses = new Set(["present", "half-day", "absent", "overtime"]);

export class WorkerAttendanceValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  errors: Record<string, string>;
};

export function validateWorkerForm(
  values: WorkerFormValues,
): ValidationSuccess<WorkerInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const projectId = values.project_id.trim();
  const name = values.name.trim();
  const designation = values.designation.trim();
  const dailyRate = Number(values.daily_rate);

  if (!projectId) errors.project_id = "Project is required.";
  if (!name) errors.name = "Worker name is required.";
  if (!designation) errors.designation = "Designation is required.";
  if (!values.daily_rate.trim() || Number.isNaN(dailyRate) || dailyRate <= 0) {
    errors.daily_rate = "Enter a valid rate/day.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      project_id: projectId,
      name,
      designation,
      role: designation,
      daily_rate: dailyRate,
    },
  };
}

export function validateAttendanceForm(
  values: AttendanceFormValues,
): ValidationSuccess<Omit<AttendanceInsert, "amount">> | ValidationFailure {
  const errors: Record<string, string> = {};
  const projectId = values.project_id.trim();
  const workerId = values.worker_id.trim();
  const status = values.status.trim();
  const otHours = Number(values.ot_hours || 0);
  const attendanceDate = values.attendance_date.trim();

  if (!projectId) errors.project_id = "Project is required.";
  if (!workerId) errors.worker_id = "Worker is required.";
  if (!allowedStatuses.has(status)) {
    errors.status = "Choose present, half-day, absent, or overtime.";
  }
  if (Number.isNaN(otHours) || otHours < 0) {
    errors.ot_hours = "OT hours cannot be negative.";
  }
  if (!attendanceDate) {
    errors.attendance_date = "Attendance date is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: projectId,
      worker_id: workerId,
      attendance_date: attendanceDate,
      status: status as AttendanceInsert["status"],
      ot_hours: otHours,
      units_worked: getWorkDayValue(status),
      overtime_units: otHours,
    },
  };
}

export function parseWorkerPayload(input: unknown): WorkerInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateWorkerForm({
    project_id: String(object.project_id ?? ""),
    name: String(object.name ?? ""),
    designation: String(object.designation ?? ""),
    daily_rate: String(object.daily_rate ?? ""),
  });

  if (!result.success) {
    throw new WorkerAttendanceValidationError(
      "Please fix the highlighted fields.",
      result.errors,
    );
  }

  return result.data;
}

export function parseAttendancePayload(input: unknown): AttendanceInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const dailyRate = Number(object.daily_rate ?? 0);
  const result = validateAttendanceForm({
    project_id: String(object.project_id ?? ""),
    worker_id: String(object.worker_id ?? ""),
    status: String(object.status ?? ""),
    ot_hours: String(object.ot_hours ?? "0"),
    attendance_date: String(object.attendance_date ?? ""),
  });

  if (!result.success) {
    throw new WorkerAttendanceValidationError(
      "Please fix the highlighted fields.",
      result.errors,
    );
  }

  return {
    ...result.data,
    amount: calculateAttendanceAmount({
      dailyRate,
      status: result.data.status,
      otHours: result.data.ot_hours,
    }),
  };
}
