"use client";

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  AttendanceListItem,
  WorkerListItem,
} from "@/features/attendance/types";
import type { ProjectListItem } from "@/features/projects/types";
import { formatCurrency } from "@/lib/utils/formatters";

type AttendanceRegisterProps = {
  projects: ProjectListItem[];
  workers: WorkerListItem[];
  attendanceRows: AttendanceListItem[];
  selectedProjectId: string;
  selectedMonth: string;
  monthLabel: string;
  userName: string;
};

type DraftStatus = "present" | "absent" | "half-day" | "overtime";

type DraftEntry = {
  workerId: string;
  date: string;
  status: DraftStatus;
  otHours: string;
};

type WorkerFormState = {
  project_id: string;
  name: string;
  designation: string;
  daily_rate: string;
};

const statusLabels: Record<DraftStatus, string> = {
  present: "P",
  absent: "A",
  "half-day": "HD",
  overtime: "OT",
};

const statusNames: Record<DraftStatus, string> = {
  present: "Present",
  absent: "Absent",
  "half-day": "Half Day",
  overtime: "Overtime",
};

const statusStyles: Record<DraftStatus, string> = {
  present: "border-[#1f7a46] bg-[#1f7a46] text-white",
  absent: "border-[#b42318] bg-[#b42318] text-white",
  "half-day": "border-[#b76b1f] bg-[#b76b1f] text-white",
  overtime: "border-[#2454a6] bg-[#2454a6] text-white",
};

const softStatusStyles: Record<DraftStatus, string> = {
  present: "border-[#9ed5b3] bg-[#ecf9f0] text-[#14532d]",
  absent: "border-[#f0b8b3] bg-[#fff1f0] text-[#9f241b]",
  "half-day": "border-[#f0c896] bg-[#fff7e8] text-[#8a4b0f]",
  overtime: "border-[#b8c9ef] bg-[#eff5ff] text-[#1f4b99]",
};

const statusOptions: DraftStatus[] = ["present", "absent", "half-day", "overtime"];

const emptyWorkerForm = (projectId: string): WorkerFormState => ({
  project_id: projectId,
  name: "",
  designation: "",
  daily_rate: "",
});

export function AttendanceRegister({
  projects,
  workers,
  attendanceRows,
  selectedProjectId,
  selectedMonth,
  monthLabel,
  userName,
}: AttendanceRegisterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const days = useMemo(() => buildMonthDays(selectedMonth), [selectedMonth]);
  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialSelectedDate(selectedMonth, days),
  );
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});
  const [selectedCellKey, setSelectedCellKey] = useState("");
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerForm, setWorkerForm] = useState<WorkerFormState>(
    emptyWorkerForm(selectedProjectId),
  );
  const [workerErrors, setWorkerErrors] = useState<Record<string, string>>({});
  const [workerBusy, setWorkerBusy] = useState(false);
  const [registerBusy, setRegisterBusy] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [workerError, setWorkerError] = useState("");

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;

  const filteredWorkers = useMemo(
    () =>
      selectedProjectId
        ? workers.filter((worker) => worker.project_id === selectedProjectId)
        : workers,
    [selectedProjectId, workers],
  );

  const filteredAttendance = useMemo(
    () =>
      selectedProjectId
        ? attendanceRows.filter((row) => row.project_id === selectedProjectId)
        : attendanceRows,
    [attendanceRows, selectedProjectId],
  );

  const workerById = useMemo(
    () => new Map(filteredWorkers.map((worker) => [worker.id, worker])),
    [filteredWorkers],
  );

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceListItem>();
    for (const row of filteredAttendance) {
      map.set(buildCellKey(row.worker_id, row.attendance_date), row);
    }
    return map;
  }, [filteredAttendance]);

  const daySummary = useMemo(() => {
    const rows = filteredWorkers.map((worker) => {
      const key = buildCellKey(worker.id, selectedDate);
      const existing = attendanceMap.get(key);
      const draft = drafts[key];
      const status = existing ? normalizeStatus(existing.status) : draft?.status ?? null;

      return { worker, key, existing, draft, status };
    });

    return {
      rows,
      present: rows.filter((row) => row.status && row.status !== "absent").length,
      absent: rows.filter((row) => row.status === "absent").length,
      unmarked: rows.filter((row) => !row.status).length,
      cost: rows.reduce((total, row) => {
        if (row.existing) return total + row.existing.amount;
        if (row.draft) {
          return (
            total +
            calculateDraftAmount(
              row.worker.daily_rate,
              row.draft.status,
              Number(row.draft.otHours || 0),
            )
          );
        }
        return total;
      }, 0),
    };
  }, [attendanceMap, drafts, filteredWorkers, selectedDate]);

  const registerRows = useMemo(
    () =>
      filteredWorkers.map((worker, index) => {
        const workerAttendance = filteredAttendance.filter((row) => row.worker_id === worker.id);
        const workerDrafts = Object.values(drafts).filter((draft) => draft.workerId === worker.id);
        const totalUnits =
          workerAttendance.reduce((total, row) => total + getStatusUnits(normalizeStatus(row.status)), 0) +
          workerDrafts.reduce((total, draft) => total + getStatusUnits(draft.status), 0);
        const amount =
          workerAttendance.reduce((total, row) => total + row.amount, 0) +
          workerDrafts.reduce(
            (total, draft) =>
              total +
              calculateDraftAmount(worker.daily_rate, draft.status, Number(draft.otHours || 0)),
            0,
          );

        return {
          index: index + 1,
          worker,
          totalUnits,
          amount,
        };
      }),
    [drafts, filteredAttendance, filteredWorkers],
  );

  const selectedDraft = selectedCellKey ? drafts[selectedCellKey] : undefined;
  const selectedExistingRow = selectedCellKey ? attendanceMap.get(selectedCellKey) : undefined;
  const pendingCount = Object.keys(drafts).length;

  function handleProjectChange(projectId: string) {
    setDrafts({});
    setSelectedCellKey("");
    setWorkerForm(emptyWorkerForm(projectId));
    setWorkerErrors({});
    setRegisterError("");
    const nextParams = new URLSearchParams();
    nextParams.set("project", projectId);
    nextParams.set("month", selectedMonth);
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleMonthChange(month: string) {
    if (!month) return;

    setDrafts({});
    setSelectedCellKey("");
    setRegisterError("");
    const nextParams = new URLSearchParams();
    nextParams.set("project", selectedProjectId);
    nextParams.set("month", month);
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleDateChange(date: string) {
    if (!days.some((day) => day.date === date)) return;
    setSelectedDate(date);
    setSelectedCellKey("");
    setRegisterError("");
  }

  function moveSelectedDate(direction: -1 | 1) {
    const currentIndex = days.findIndex((day) => day.date === selectedDate);
    const nextDay = days[currentIndex + direction];
    if (nextDay) {
      handleDateChange(nextDay.date);
    }
  }

  function updateDraft(workerId: string, status: DraftStatus) {
    const key = buildCellKey(workerId, selectedDate);

    if (attendanceMap.has(key)) {
      setSelectedCellKey(key);
      return;
    }

    setDrafts((current) => ({
      ...current,
      [key]: {
        workerId,
        date: selectedDate,
        status,
        otHours: current[key]?.otHours ?? "0",
      },
    }));
    setSelectedCellKey(key);
    setRegisterError("");
  }

  function clearDraft(workerId: string) {
    const key = buildCellKey(workerId, selectedDate);
    setDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSelectedCellKey("");
  }

  async function handleSaveRegister() {
    const draftEntries = Object.values(drafts).filter((draft) => {
      const worker = workerById.get(draft.workerId);
      return worker && selectedProjectId && !attendanceMap.has(buildCellKey(draft.workerId, draft.date));
    });

    if (!draftEntries.length) {
      setRegisterError("Mark attendance for at least one worker before saving.");
      return;
    }

    setRegisterBusy(true);
    setRegisterError("");

    try {
      for (const draft of draftEntries) {
        const worker = workerById.get(draft.workerId);
        if (!worker) continue;

        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: selectedProjectId,
            worker_id: draft.workerId,
            status: draft.status,
            ot_hours: draft.status === "overtime" ? draft.otHours || "0" : "0",
            attendance_date: draft.date,
            daily_rate: worker.daily_rate,
          }),
        });

        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to save attendance.");
        }
      }

      window.location.reload();
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Failed to save attendance.");
    } finally {
      setRegisterBusy(false);
    }
  }

  async function handleCreateWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!workerForm.project_id) nextErrors.project_id = "Project is required.";
    if (!workerForm.name.trim()) nextErrors.name = "Worker name is required.";
    if (!workerForm.designation.trim()) nextErrors.designation = "Designation is required.";
    if (!workerForm.daily_rate.trim() || Number(workerForm.daily_rate) <= 0) {
      nextErrors.daily_rate = "Enter a valid rate/day.";
    }

    if (Object.keys(nextErrors).length) {
      setWorkerErrors(nextErrors);
      return;
    }

    setWorkerBusy(true);
    setWorkerErrors({});
    setWorkerError("");

    try {
      const response = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: workerForm.project_id,
          name: workerForm.name.trim(),
          designation: workerForm.designation.trim(),
          daily_rate: workerForm.daily_rate,
        }),
      });

      const result = (await response.json()) as { error?: string; fieldErrors?: Record<string, string> };
      if (!response.ok) {
        setWorkerErrors(result.fieldErrors ?? {});
        setWorkerError(result.error ?? "Unable to save worker.");
        return;
      }

      window.location.reload();
    } catch {
      setWorkerError("Network error. Please check your connection and try again.");
    } finally {
      setWorkerBusy(false);
    }
  }

  async function handleRemoveWorker(workerId: string) {
    const confirmed = window.confirm(
      "Remove this worker? Workers with saved attendance cannot be removed.",
    );

    if (!confirmed) return;

    setRegisterError("");

    try {
      const response = await fetch(`/api/workers?id=${workerId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to remove worker.");
      }

      window.location.reload();
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Failed to remove worker.");
    }
  }

  function handleExport() {
    const header = [
      "S.No",
      "Worker Name",
      ...days.map((day) => day.label),
      "Total",
      "Rate",
      "Amount",
    ];

    const rows = registerRows.map((row) => [
      String(row.index),
      row.worker.name,
      ...days.map((day) => {
        const key = buildCellKey(row.worker.id, day.date);
        const existing = attendanceMap.get(key);
        const draft = drafts[key];
        if (existing) return mapStatusToExport(existing.status);
        if (draft) return statusLabels[draft.status];
        return "";
      }),
      row.totalUnits.toFixed(1),
      row.worker.daily_rate.toFixed(2),
      row.amount.toFixed(2),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-register-${monthLabel.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_22px_70px_rgba(64,42,16,0.14)]">
      <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
              Daily Crew Attendance
            </p>
            <h2 className="mt-1 truncate text-xl font-bold text-[color:var(--foreground)]">
              {selectedProject?.name ?? "No project selected"}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Mark one site day at a time for {monthLabel}.
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-xs font-bold text-[color:var(--primary)]">
            {getInitials(userName)}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FieldShell label="Project">
            <select
              value={selectedProjectId}
              onChange={(event) => handleProjectChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--foreground)] outline-none focus:border-[color:var(--primary)]"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Month">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => handleMonthChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--foreground)] outline-none focus:border-[color:var(--primary)]"
            />
          </FieldShell>
        </div>
      </div>

      <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DashboardStat label="Workers" value={String(filteredWorkers.length)} />
          <DashboardStat label="On Site" value={String(daySummary.present)} valueClassName="text-[color:var(--primary)]" />
          <DashboardStat label="Unmarked" value={String(daySummary.unmarked)} />
          <DashboardStat label="Day Cost" value={formatCurrency(daySummary.cost)} />
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-white/70 p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveSelectedDate(-1)}
              disabled={days[0]?.date === selectedDate}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-lg font-bold text-[color:var(--foreground)] disabled:opacity-40"
              aria-label="Previous day"
            >
              ‹
            </button>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Attendance date</span>
              <input
                type="date"
                value={selectedDate}
                min={days[0]?.date}
                max={days[days.length - 1]?.date}
                onChange={(event) => handleDateChange(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-center text-sm font-bold text-[color:var(--foreground)] outline-none focus:border-[color:var(--primary)]"
              />
            </label>
            <button
              type="button"
              onClick={() => moveSelectedDate(1)}
              disabled={days[days.length - 1]?.date === selectedDate}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-lg font-bold text-[color:var(--foreground)] disabled:opacity-40"
              aria-label="Next day"
            >
              ›
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => {
              const active = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => handleDateChange(day.date)}
                  className={`min-w-[58px] rounded-2xl border px-2 py-2 text-center transition ${
                    active
                      ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  }`}
                >
                  <span className="block text-sm font-bold">{day.day}</span>
                  <span className="block text-[10px] font-semibold uppercase">{day.weekday}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {daySummary.rows.length ? (
            daySummary.rows.map(({ worker, existing, draft, status, key }) => (
              <article
                key={worker.id}
                className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_10px_32px_rgba(64,42,16,0.08)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-muted)] text-sm font-bold text-[color:var(--primary)]">
                    {getInitials(worker.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-[color:var(--foreground)]">
                          {worker.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                          {worker.designation || "Worker"} · {formatCurrency(worker.daily_rate)}/day
                        </p>
                      </div>
                      {status ? (
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${softStatusStyles[status]}`}>
                          {statusNames[status]}
                        </span>
                      ) : (
                        <span className="rounded-full border border-[color:var(--border)] bg-white px-2.5 py-1 text-[11px] font-bold text-[color:var(--muted)]">
                          Not marked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => {
                    const selected = status === option;
                    const locked = Boolean(existing);
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={locked}
                        onClick={() => updateDraft(worker.id, option)}
                        className={`min-h-12 rounded-2xl border px-3 text-sm font-bold transition disabled:cursor-not-allowed ${
                          selected
                            ? statusStyles[option]
                            : "border-[color:var(--border)] bg-white text-[color:var(--foreground)]"
                        } ${locked && !selected ? "opacity-50" : ""}`}
                      >
                        {statusNames[option]}
                      </button>
                    );
                  })}
                </div>

                {draft?.status === "overtime" ? (
                  <label className="mt-3 block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      Overtime Hours
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={draft.otHours}
                      onChange={(event) => updateSelectedDraftOtHoursForKey(key, event.target.value, setDrafts)}
                      className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none focus:border-[color:var(--primary)]"
                    />
                  </label>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-3 text-xs text-[color:var(--muted)]">
                  <span>
                    {existing
                      ? `Saved · ${formatCurrency(existing.amount)}`
                      : draft
                        ? `Draft · ${formatCurrency(calculateDraftAmount(worker.daily_rate, draft.status, Number(draft.otHours || 0)))}`
                        : "Tap a status to mark this worker"}
                  </span>
                  {existing ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCellKey(key)}
                      className="font-bold text-[color:var(--primary)]"
                    >
                      Details
                    </button>
                  ) : draft ? (
                    <button
                      type="button"
                      onClick={() => clearDraft(worker.id)}
                      className="font-bold text-[color:var(--danger)]"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="font-bold text-[color:var(--danger)]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-white/60 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                No workers found for this project yet.
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Add a worker below to start marking attendance.
              </p>
            </div>
          )}
        </div>

        {selectedDraft ? (
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm text-[color:var(--foreground)]">
            Draft selected for {formatDateLabel(selectedDraft.date)}. Save the register to post it to attendance and transactions.
          </div>
        ) : selectedExistingRow ? (
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm text-[color:var(--foreground)]">
            Saved entry for {selectedExistingRow.worker_name} on {formatDateLabel(selectedExistingRow.attendance_date)} · {statusNames[normalizeStatus(selectedExistingRow.status)]} · {formatCurrency(selectedExistingRow.amount)}.
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowWorkerForm((current) => !current)}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-dashed border-[color:var(--primary)] bg-white px-4 text-sm font-bold text-[color:var(--primary)]"
        >
          {showWorkerForm ? "Close Worker Form" : "Add New Worker"}
        </button>

        {showWorkerForm ? (
          <form onSubmit={handleCreateWorker} className="rounded-3xl border border-[color:var(--border)] bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FieldShell label="Project" error={workerErrors.project_id}>
                <select
                  value={workerForm.project_id}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, project_id: event.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none focus:border-[color:var(--primary)]"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Worker Name" error={workerErrors.name}>
                <input
                  value={workerForm.name}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="John Doe"
                  className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]"
                />
              </FieldShell>
              <FieldShell label="Designation" error={workerErrors.designation}>
                <input
                  value={workerForm.designation}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, designation: event.target.value }))
                  }
                  placeholder="Mason"
                  className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]"
                />
              </FieldShell>
              <FieldShell label="Rate / Day" error={workerErrors.daily_rate}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={workerForm.daily_rate}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, daily_rate: event.target.value }))
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]"
                />
              </FieldShell>
            </div>
            {workerError ? <p className="mt-3 text-sm font-medium text-[color:var(--danger)]">{workerError}</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={workerBusy}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[color:var(--primary)] px-5 text-sm font-semibold text-[color:var(--primary-foreground)] disabled:opacity-60"
              >
                {workerBusy ? "Saving Worker..." : "Save Worker"}
              </button>
              <button
                type="button"
                onClick={() => setShowWorkerForm(false)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white px-5 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Close
              </button>
            </div>
          </form>
        ) : null}

        <details className="rounded-3xl border border-[color:var(--border)] bg-white/70 p-4">
          <summary className="cursor-pointer text-sm font-bold text-[color:var(--foreground)]">
            Month review and export
          </summary>
          <div className="mt-4 space-y-3">
            {registerRows.map((row) => (
              <div key={row.worker.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[color:var(--foreground)]">{row.worker.name}</p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {row.totalUnits.toFixed(1)} days · {formatCurrency(row.amount)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[color:var(--muted)]">
                    {formatCurrency(row.worker.daily_rate)}/day
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {days.map((day) => {
                    const key = buildCellKey(row.worker.id, day.date);
                    const existing = attendanceMap.get(key);
                    const draft = drafts[key];
                    const status = existing ? normalizeStatus(existing.status) : draft?.status;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleDateChange(day.date)}
                        className={`h-7 w-7 rounded-full border text-[9px] font-bold ${
                          status
                            ? statusStyles[status]
                            : "border-[color:var(--border)] bg-white text-[color:var(--muted)]"
                        }`}
                        title={`${formatDateLabel(day.date)} ${status ? statusNames[status] : "not marked"}`}
                      >
                        {status ? statusLabels[status] : day.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
            >
              Export CSV
            </button>
          </div>
        </details>

        {registerError ? <p className="text-sm font-medium text-[color:var(--danger)]">{registerError}</p> : null}
      </div>

      <div className="sticky bottom-0 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={handleSaveRegister}
          disabled={registerBusy || !pendingCount}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[color:var(--primary)] px-4 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerBusy
            ? "Saving Attendance..."
            : pendingCount
              ? `Save ${pendingCount} Attendance ${pendingCount === 1 ? "Entry" : "Entries"}`
              : "No Draft Attendance"}
        </button>
      </div>
    </section>
  );
}

function DashboardStat({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white/80 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{label}</p>
      <p className={`mt-1 truncate text-xl font-bold text-[color:var(--foreground)] ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function FieldShell({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs font-medium text-[color:var(--danger)]">{error}</span> : null}
    </label>
  );
}

function buildMonthDays(monthValue: string) {
  const parsedMonth = parseMonthValue(monthValue);
  const baseDate = parsedMonth ?? new Date();
  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, month, day));
    const weekday = date
      .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
      .toUpperCase();

    return {
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day: String(day).padStart(2, "0"),
      weekday,
      label: `${String(day).padStart(2, "0")} ${weekday}`,
    };
  });
}

function getInitialSelectedDate(monthValue: string, days: ReturnType<typeof buildMonthDays>) {
  const today = new Date().toISOString().slice(0, 10);
  if (today.startsWith(`${monthValue}-`) && days.some((day) => day.date === today)) {
    return today;
  }
  return days[0]?.date ?? today;
}

function buildCellKey(workerId: string, date: string) {
  return `${workerId}__${date}`;
}

function updateSelectedDraftOtHoursForKey(
  key: string,
  otHours: string,
  setDrafts: Dispatch<SetStateAction<Record<string, DraftEntry>>>,
) {
  setDrafts((current) => ({
    ...current,
    [key]: { ...current[key], otHours },
  }));
}

function normalizeStatus(status: string): DraftStatus {
  if (status === "present" || status === "absent" || status === "half-day" || status === "overtime") {
    return status;
  }
  return "absent";
}

function mapStatusToExport(status: string) {
  return statusLabels[normalizeStatus(status)];
}

function getStatusUnits(status: DraftStatus) {
  if (status === "half-day") return 0.5;
  if (status === "absent") return 0;
  return 1;
}

function calculateDraftAmount(dailyRate: number, status: DraftStatus, otHours: number) {
  if (status === "present") return dailyRate;
  if (status === "half-day") return Number((dailyRate * 0.5).toFixed(2));
  if (status === "overtime") return Number((dailyRate + (dailyRate / 8) * otHours).toFixed(2));
  return 0;
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

function parseMonthValue(monthValue: string) {
  if (!/^\d{4}-\d{2}$/.test(monthValue)) {
    return null;
  }

  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}
