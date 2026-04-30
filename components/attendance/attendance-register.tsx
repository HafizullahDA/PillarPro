"use client";

import type { FormEvent, ReactNode } from "react";
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

const draftCycle: Array<DraftStatus | null> = ["present", "absent", "half-day", null];

const statusStyles: Record<
  DraftStatus | "locked-present" | "locked-absent" | "locked-half-day" | "locked-overtime",
  string
> = {
  present: "border-[#2d7b43] bg-[#2d7b43] text-white",
  absent: "border-[#b1382f] bg-[#b1382f] text-white",
  "half-day": "border-[#d17f2c] bg-[#d17f2c] text-white",
  overtime: "border-[#1e4aa6] bg-[#1e4aa6] text-white",
  "locked-present": "border-[#2d7b43] bg-[#2d7b43] text-white",
  "locked-absent": "border-[#b1382f] bg-[#b1382f] text-white",
  "locked-half-day": "border-[#d17f2c] bg-[#d17f2c] text-white",
  "locked-overtime": "border-[#1e4aa6] bg-[#1e4aa6] text-white",
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

  const days = useMemo(() => buildMonthDays(selectedMonth), [selectedMonth]);
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

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const summary = useMemo(() => {
    const todayRows = filteredAttendance.filter((row) => row.attendance_date === today);
    return {
      totalWorkers: filteredWorkers.length,
      presentToday: todayRows.filter((row) => row.status !== "absent").length,
      dailyCost: todayRows.reduce((total, row) => total + row.amount, 0),
    };
  }, [filteredAttendance, filteredWorkers.length, today]);

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
  const selectedWorker = selectedDraft ? workerById.get(selectedDraft.workerId) : undefined;

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
    if (!month) {
      return;
    }

    setDrafts({});
    setSelectedCellKey("");
    setRegisterError("");
    const nextParams = new URLSearchParams();
    nextParams.set("project", selectedProjectId);
    nextParams.set("month", month);
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleCellClick(workerId: string, date: string) {
    const key = buildCellKey(workerId, date);
    if (attendanceMap.has(key)) {
      setSelectedCellKey(key);
      return;
    }

    setDrafts((current) => {
      const next = { ...current };
      const existing = next[key];
      const nextStatus = getNextDraftStatus(existing?.status ?? null);

      if (!nextStatus) {
        delete next[key];
      } else {
        next[key] = {
          workerId,
          date,
          status: nextStatus,
          otHours: existing?.otHours ?? "0",
        };
      }

      return next;
    });
    setSelectedCellKey(key);
    setRegisterError("");
  }

  function updateSelectedDraftStatus(status: DraftStatus) {
    if (!selectedDraft) return;
    setDrafts((current) => ({
      ...current,
      [selectedCellKey]: { ...current[selectedCellKey], status },
    }));
  }

  function updateSelectedDraftOtHours(otHours: string) {
    if (!selectedDraft) return;
    setDrafts((current) => ({
      ...current,
      [selectedCellKey]: { ...current[selectedCellKey], otHours },
    }));
  }

  async function handleSaveRegister() {
    const draftEntries = Object.values(drafts).filter((draft) => {
      const worker = workerById.get(draft.workerId);
      return worker && selectedProjectId && !attendanceMap.has(buildCellKey(draft.workerId, draft.date));
    });

    if (!draftEntries.length) {
      setRegisterError("Select at least one empty day cell before saving.");
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

    if (!confirmed) {
      return;
    }

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

  const pendingCount = Object.keys(drafts).length;

  return (
    <section className="overflow-hidden rounded-[32px] border-[6px] border-[#aeb6c6] bg-white shadow-[0_28px_80px_rgba(39,56,96,0.18)]">
      <div className="border-b border-[#d8deea] bg-[#f7f9fc] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-full border border-[#dbe3f0] bg-white text-[#27458f]">
              <span className="block h-[1.5px] w-3 rounded-full bg-current" />
              <span className="block h-[1.5px] w-3 rounded-full bg-current" />
              <span className="block h-[1.5px] w-3 rounded-full bg-current" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldShell label="Project">
                  <select
                    value={selectedProjectId}
                    onChange={(event) => handleProjectChange(event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[#cfd8e8] bg-white px-3 text-sm font-semibold text-[#27458f] outline-none focus:border-[#28479a]"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Register Month">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => handleMonthChange(event.target.value)}
                    className="h-11 w-full rounded-[10px] border border-[#cfd8e8] bg-white px-3 text-sm font-semibold text-[#27458f] outline-none focus:border-[#28479a]"
                  />
                </FieldShell>
              </div>
              <p className="mt-2 text-xs text-[#75819b]">
                Construction workforce register for {monthLabel}
              </p>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe3f0] bg-[#fff7d7] text-xs font-bold text-[#5d4a06]">
            {getInitials(userName)}
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardStat label="Total Workers" value={String(summary.totalWorkers)} />
          <DashboardStat label="Present Today" value={String(summary.presentToday)} valueClassName="text-[#0f8c4b]" />
          <DashboardStat label="Daily Cost" value={formatCurrency(summary.dailyCost)} />
          <DashboardStat
            label="Current Project"
            value={selectedProject?.name ?? "No project"}
            valueClassName="text-[#1f2d4d]"
          />
          <label className="rounded-[6px] border border-[#d8deea] bg-[#fbfcff] px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f7e99]">
              Register Month
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-[#1f2d4d]">{monthLabel}</p>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5f6f8d]">
          <LegendDot label="Present" className="bg-[#2d7b43]" />
          <LegendDot label="Absent" className="bg-[#b1382f]" />
          <LegendDot label="Half Day" className="bg-[#d17f2c]" />
          <LegendDot label="Overtime" className="bg-[#1e4aa6]" />
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-[#d8deea]">
          <table className="min-w-[1200px] border-separate border-spacing-0 text-xs text-[#233252]">
            <thead>
              <tr className="bg-[#0f224f] text-white">
                <StickyHeader className="left-0 z-30 min-w-[68px]">S.No</StickyHeader>
                <StickyHeader className="left-[68px] z-30 min-w-[180px]">Name Of Worker</StickyHeader>
                {days.map((day) => (
                  <th key={day.date} className="min-w-[62px] border-r border-[#233866] px-2 py-3 text-center text-[10px] font-bold uppercase">
                    {day.label}
                  </th>
                ))}
                <th className="min-w-[72px] border-r border-[#233866] px-2 py-3 text-center text-[10px] font-bold uppercase">Total</th>
                <th className="min-w-[72px] border-r border-[#233866] px-2 py-3 text-center text-[10px] font-bold uppercase">Rate</th>
                <th className="min-w-[92px] border-r border-[#233866] px-2 py-3 text-center text-[10px] font-bold uppercase">Amount</th>
                <th className="min-w-[88px] px-2 py-3 text-center text-[10px] font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {registerRows.length ? (
                registerRows.map((row) => (
                  <tr key={row.worker.id} className="bg-white">
                    <StickyCell className="left-0 z-20 text-center font-semibold">{row.index}</StickyCell>
                    <StickyCell className="left-[68px] z-20 font-semibold text-[#27458f]">
                      <div>{row.worker.name}</div>
                      <div className="mt-1 text-[10px] font-medium text-[#7d8ba4]">
                        {row.worker.designation}
                      </div>
                    </StickyCell>
                    {days.map((day) => {
                      const key = buildCellKey(row.worker.id, day.date);
                      const existing = attendanceMap.get(key);
                      const draft = drafts[key];
                      const isSelected = selectedCellKey === key;

                      return (
                        <td key={key} className="border-b border-r border-[#edf1f7] px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleCellClick(row.worker.id, day.date)}
                            className={`mx-auto flex h-7 min-w-7 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                              existing
                                ? statusStyles[`locked-${normalizeStatus(existing.status)}`]
                                : draft
                                  ? statusStyles[draft.status]
                                  : "border-[#d5ddeb] bg-white text-[#9aa6bf]"
                            } ${isSelected ? "ring-2 ring-[#88a7ff] ring-offset-1" : ""}`}
                            title={
                              existing
                                ? `${statusNames[normalizeStatus(existing.status)]} saved`
                                : draft
                                  ? `${statusNames[draft.status]} draft`
                                  : "Click to cycle status"
                            }
                          >
                            {existing
                              ? statusLabels[normalizeStatus(existing.status)]
                              : draft
                                ? statusLabels[draft.status]
                                : "-"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="border-b border-r border-[#edf1f7] px-2 py-2 text-center font-semibold">
                      {row.totalUnits.toFixed(1)}
                    </td>
                    <td className="border-b border-r border-[#edf1f7] px-2 py-2 text-center text-[#667693]">
                      {formatCurrency(row.worker.daily_rate)}
                    </td>
                    <td className="border-b border-r border-[#edf1f7] px-2 py-2 text-center font-bold text-[#1743a2]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="border-b border-[#edf1f7] px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveWorker(row.worker.id)}
                        className="rounded-full border border-[#e5b6b1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#b1382f]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={days.length + 6} className="px-4 py-10 text-center text-sm text-[#71809c]">
                    No workers found for this project yet.
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={days.length + 6} className="border-t border-dashed border-[#d7deea] px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setShowWorkerForm((current) => !current)}
                    className="mx-auto flex items-center gap-2 text-sm font-semibold text-[#28458f]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">+</span>
                    Add New Worker
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {selectedDraft ? (
          <div className="rounded-[10px] border border-[#d8deea] bg-[#f7f9fd] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1f2d4d]">
                  Drafting {selectedWorker?.name ?? "worker"} for {formatDateLabel(selectedDraft.date)}
                </p>
                <p className="mt-1 text-xs text-[#6f7e99]">
                  Click status chips to fine-tune the selected cell before saving the register.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusLabels) as DraftStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateSelectedDraftStatus(status)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      selectedDraft.status === status
                        ? statusStyles[status]
                        : "border-[#d5ddeb] bg-white text-[#5f6f8d]"
                    }`}
                  >
                    {statusNames[status]}
                  </button>
                ))}
              </div>
            </div>
            {selectedDraft.status === "overtime" ? (
              <label className="mt-4 block max-w-[220px]">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f7e99]">
                  OT Hours
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={selectedDraft.otHours}
                  onChange={(event) => updateSelectedDraftOtHours(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[8px] border border-[#d5ddeb] bg-white px-3 text-sm text-[#1f2d4d] outline-none focus:border-[#27458f]"
                />
              </label>
            ) : null}
          </div>
        ) : selectedExistingRow ? (
          <div className="rounded-[10px] border border-[#d8deea] bg-[#f7f9fd] p-4 text-sm text-[#5f6f8d]">
            Saved entry for {selectedExistingRow.worker_name} on {formatDateLabel(selectedExistingRow.attendance_date)}.
          </div>
        ) : null}

        {showWorkerForm ? (
          <form onSubmit={handleCreateWorker} className="rounded-[10px] border border-[#d8deea] bg-[#fbfcff] p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FieldShell label="Project" error={workerErrors.project_id}>
                <select
                  value={workerForm.project_id}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, project_id: event.target.value }))
                  }
                  className="h-11 w-full rounded-[8px] border border-[#d5ddeb] bg-white px-3 text-sm text-[#1f2d4d] outline-none focus:border-[#27458f]"
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
                  className="h-11 w-full rounded-[8px] border border-[#d5ddeb] bg-white px-3 text-sm text-[#1f2d4d] outline-none placeholder:text-[#96a3bb] focus:border-[#27458f]"
                />
              </FieldShell>
              <FieldShell label="Designation" error={workerErrors.designation}>
                <input
                  value={workerForm.designation}
                  onChange={(event) =>
                    setWorkerForm((current) => ({ ...current, designation: event.target.value }))
                  }
                  placeholder="Mason"
                  className="h-11 w-full rounded-[8px] border border-[#d5ddeb] bg-white px-3 text-sm text-[#1f2d4d] outline-none placeholder:text-[#96a3bb] focus:border-[#27458f]"
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
                  className="h-11 w-full rounded-[8px] border border-[#d5ddeb] bg-white px-3 text-sm text-[#1f2d4d] outline-none placeholder:text-[#96a3bb] focus:border-[#27458f]"
                />
              </FieldShell>
            </div>
            {workerError ? <p className="mt-3 text-sm font-medium text-[#b1382f]">{workerError}</p> : null}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={workerBusy}
                className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#27458f] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {workerBusy ? "Saving Worker..." : "Save Worker"}
              </button>
              <button
                type="button"
                onClick={() => setShowWorkerForm(false)}
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d5ddeb] bg-white px-5 text-sm font-semibold text-[#42516f]"
              >
                Close
              </button>
            </div>
          </form>
        ) : null}

        {registerError ? <p className="text-sm font-medium text-[#b1382f]">{registerError}</p> : null}

        <div className="space-y-3 border-t border-[#d8deea] pt-2">
          <button
            type="button"
            onClick={handleSaveRegister}
            disabled={registerBusy || !pendingCount}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[color:var(--primary)] px-4 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registerBusy
              ? "Saving Attendance Register..."
              : `Save Attendance Register${pendingCount ? ` (${pendingCount})` : ""}`}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
          >
            Export As Excel
          </button>
        </div>
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
    <div className="rounded-[6px] border border-[#d8deea] bg-[#fbfcff] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f7e99]">{label}</p>
      <p className={`mt-1 truncate text-2xl font-semibold text-[#244082] ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function StickyHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`sticky border-r border-[#233866] bg-[#0f224f] px-2 py-3 text-left text-[10px] font-bold uppercase ${className}`}
    >
      {children}
    </th>
  );
}

function StickyCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`sticky border-b border-r border-[#edf1f7] bg-white px-3 py-2 ${className}`}>
      {children}
    </td>
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
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f7e99]">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs font-medium text-[#b1382f]">{error}</span> : null}
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
      label: `${String(day).padStart(2, "0")} ${weekday}`,
    };
  });
}

function buildCellKey(workerId: string, date: string) {
  return `${workerId}__${date}`;
}

function getNextDraftStatus(status: DraftStatus | null) {
  const currentIndex = draftCycle.findIndex((value) => value === status);
  return draftCycle[(currentIndex + 1 + draftCycle.length) % draftCycle.length];
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
  if (status === "half-day") {
    return 0.5;
  }

  if (status === "absent") {
    return 0;
  }

  return 1;
}

function calculateDraftAmount(dailyRate: number, status: DraftStatus, otHours: number) {
  if (status === "present") {
    return dailyRate;
  }

  if (status === "half-day") {
    return Number((dailyRate * 0.5).toFixed(2));
  }

  if (status === "overtime") {
    return Number((dailyRate + (dailyRate / 8) * otHours).toFixed(2));
  }

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
