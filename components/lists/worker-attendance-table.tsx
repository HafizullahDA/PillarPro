import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  AttendanceListItem,
  WorkerListItem,
} from "@/features/attendance/types";
import { formatCurrency } from "@/lib/utils/formatters";

type WorkerAttendanceTableProps = {
  workers: WorkerListItem[];
  attendanceRows: AttendanceListItem[];
};

export function WorkerAttendanceTable({
  workers,
  attendanceRows,
}: WorkerAttendanceTableProps) {
  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Workers</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Worker master records.</p>
          </div>
          <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
            {workers.length}
          </span>
        </div>

        {workers.length === 0 ? (
          <EmptyState message="No workers yet." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Designation</th>
                    <th className="px-4 py-3 font-medium">Rate/day</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold">{worker.name}</td>
                      <td className="px-4 py-3">{worker.designation}</td>
                      <td className="px-4 py-3">{formatCurrency(worker.daily_rate)}</td>
                      <td className="px-4 py-3">{worker.project_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Attendance log</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Current month attendance with auto-calculated salary amount.
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
            {attendanceRows.length}
          </span>
        </div>

        {attendanceRows.length === 0 ? (
          <EmptyState message="No attendance yet." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">OT hours</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold">
                        {row.worker_name}
                        <div className="text-xs text-[color:var(--muted)]">{row.project_name}</div>
                      </td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{row.ot_hours}</td>
                      <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">{row.attendance_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
