import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type {
  AttendanceListItem,
  WorkerListItem,
} from "@/features/attendance/types";
import { formatCurrency } from "@/lib/utils/formatters";

type WorkerAttendanceTableProps = {
  workers: WorkerListItem[];
  workersTotalCount?: number;
  attendanceRows: AttendanceListItem[];
  attendanceTotalCount?: number;
};

const workerColumns: ModuleTableColumn<WorkerListItem>[] = [
  { key: "designation", header: "Designation", cell: (row) => row.designation },
  { key: "rate", header: "Rate/day", cell: (row) => formatCurrency(row.daily_rate) },
  { key: "project", header: "Project", cell: (row) => row.project_name },
];

const attendanceColumns: ModuleTableColumn<AttendanceListItem>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "status", header: "Status", cell: (row) => row.status },
  { key: "ot_hours", header: "OT hours", cell: (row) => row.ot_hours },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "date", header: "Date", cell: (row) => row.attendance_date },
];

export function WorkerAttendanceTable({
  workers,
  workersTotalCount,
  attendanceRows,
  attendanceTotalCount,
}: WorkerAttendanceTableProps) {
  return (
    <>
      <ModuleTable
        title="Workers"
        description="Worker master records."
        emptyMessage="No workers yet."
        rows={workers}
        totalCount={workersTotalCount}
        columns={workerColumns}
        getRowId={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileSubtitle={(row) => row.project_name}
        mobileBadge={(row) => formatCurrency(row.daily_rate)}
      />

      <ModuleTable
        title="Attendance log"
        description="Current month attendance with auto-calculated salary amount."
        emptyMessage="No attendance yet."
        rows={attendanceRows}
        totalCount={attendanceTotalCount}
        columns={attendanceColumns}
        getRowId={(row) => row.id}
        mobileTitle={(row) => row.worker_name}
        mobileSubtitle={(row) => row.project_name}
        mobileBadge={(row) => formatCurrency(row.amount)}
      />
    </>
  );
}
