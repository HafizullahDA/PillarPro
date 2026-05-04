import {
  getMonthRange,
  getWorkDayValue,
} from "@/features/attendance/calculations";
import type {
  AttendanceInsert,
  AttendanceListItem,
  AttendanceSummaryData,
  WorkerInsert,
  WorkerListItem,
} from "@/features/attendance/types";
import {
  createTransaction,
  deleteTransaction,
} from "@/lib/services/transaction-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type PaginationOptions,
} from "@/lib/utils/pagination";
import { getRelationName } from "@/lib/utils/supabase-relations";

export async function getWorkers(): Promise<WorkerListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workers")
    .select("id, project_id, name, designation, daily_rate, created_at, projects(name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    name: row.name,
    designation: row.designation ?? "",
    daily_rate: Number(row.daily_rate ?? 0),
    created_at: row.created_at,
  }));
}

export async function getWorkersPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<WorkerListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("workers")
    .select("id, project_id, name, designation, daily_rate, created_at, projects(name)", {
      count: "exact",
    })
    .eq("active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      name: row.name,
      designation: row.designation ?? "",
      daily_rate: Number(row.daily_rate ?? 0),
      created_at: row.created_at,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createWorker(payload: WorkerInsert) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workers")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getAttendanceRecords(monthValue?: string): Promise<AttendanceListItem[]> {
  const supabase = createServerSupabaseClient();
  const monthRange = getMonthRange(monthValue);
  const { data, error } = await supabase
    .from("attendance")
    .select("id, project_id, worker_id, status, ot_hours, amount, attendance_date, workers(name), projects(name)")
    .gte("attendance_date", monthRange.from)
    .lte("attendance_date", monthRange.to)
    .order("attendance_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    worker_id: row.worker_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    worker_name: getRelationName(
      row.workers as { name?: string } | { name?: string }[] | null,
    ),
    status: row.status,
    ot_hours: Number(row.ot_hours ?? 0),
    amount: Number(row.amount ?? 0),
    attendance_date: row.attendance_date,
  }));
}

export async function getAttendanceRecordsPage(
  options?: PaginationOptions,
  monthValue?: string,
): Promise<PaginatedResult<AttendanceListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const monthRange = getMonthRange(monthValue);
  const { data, error, count } = await supabase
    .from("attendance")
    .select(
      "id, project_id, worker_id, status, ot_hours, amount, attendance_date, workers(name), projects(name)",
      { count: "exact" },
    )
    .gte("attendance_date", monthRange.from)
    .lte("attendance_date", monthRange.to)
    .order("attendance_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      worker_id: row.worker_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      worker_name: getRelationName(
        row.workers as { name?: string } | { name?: string }[] | null,
      ),
      status: row.status,
      ot_hours: Number(row.ot_hours ?? 0),
      amount: Number(row.amount ?? 0),
      attendance_date: row.attendance_date,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function getAttendanceSummary(): Promise<AttendanceSummaryData> {
  const rows = await getAttendanceRecords();

  return rows.reduce<AttendanceSummaryData>(
    (summary, row) => ({
      totalDaysWorked: summary.totalDaysWorked + getWorkDayValue(row.status),
      totalOtHours: summary.totalOtHours + row.ot_hours,
      totalAmount: Number((summary.totalAmount + row.amount).toFixed(2)),
    }),
    { totalDaysWorked: 0, totalOtHours: 0, totalAmount: 0 },
  );
}

export async function createAttendanceRecord(payload: AttendanceInsert) {
  const supabase = createServerSupabaseClient();

  const { data: worker, error: workerError } = await supabase
    .from("workers")
    .select("daily_rate, name")
    .eq("id", payload.worker_id)
    .single();

  if (workerError) {
    throw new Error(workerError.message);
  }

  const amount = payload.amount > 0 ? payload.amount : 0;
  let transactionId: string | null = null;

  if (amount > 0) {
    const transactionResult = await createTransaction({
      project_id: payload.project_id,
      type: "expense",
      category: "salary_expense",
      amount,
      date: payload.attendance_date,
      reference_id: payload.id,
      linked_id: payload.worker_id,
      worker_id: payload.worker_id,
    });

    if (!transactionResult.success) {
      throw new Error(transactionResult.error);
    }

    transactionId = transactionResult.data.id;
  }

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      worker_id: payload.worker_id,
      attendance_date: payload.attendance_date,
      status: payload.status,
      units_worked: payload.units_worked,
      overtime_units: payload.overtime_units,
      ot_hours: payload.ot_hours,
      amount,
      transaction_id: transactionId,
    })
    .select("id")
    .single();

  if (error) {
    if (transactionId) {
      await deleteTransaction(transactionId);
    }
    throw new Error(error.message);
  }

  return data;
}

export async function deactivateWorker(workerId: string) {
  const supabase = createServerSupabaseClient();
  const normalizedWorkerId = workerId.trim();

  if (!normalizedWorkerId) {
    throw new Error("Worker is required.");
  }

  const { data, error } = await supabase.rpc("delete_worker_cascade", {
    target_worker_id: normalizedWorkerId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data };
}
