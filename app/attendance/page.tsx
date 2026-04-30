import { AttendanceForm } from "@/components/forms/attendance-form";
import { WorkerForm } from "@/components/forms/worker-form";
import { AttendanceSummary } from "@/components/lists/attendance-summary";
import { WorkerAttendanceTable } from "@/components/lists/worker-attendance-table";
import { MobilePage } from "@/components/layout/mobile-page";
import { getCurrentMonthLabel } from "@/features/attendance/calculations";
import {
  getAttendanceRecords,
  getAttendanceSummary,
  getWorkers,
} from "@/features/attendance/queries";
import { getProjects } from "@/features/projects/queries";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const [projects, workers, attendanceRows, summary] = await Promise.all([
    getProjects(),
    getWorkers(),
    getAttendanceRecords(),
    getAttendanceSummary(),
  ]);

  return (
    <MobilePage
      eyebrow="Worker Attendance"
      title="Attendance"
      description="Create workers, mark daily attendance, and automatically calculate salary expense for the month."
    >
      <WorkerForm projects={projects} />
      <AttendanceForm projects={projects} workers={workers} />
      <AttendanceSummary
        monthLabel={getCurrentMonthLabel()}
        totalDaysWorked={summary.totalDaysWorked}
        totalOtHours={summary.totalOtHours}
        totalAmount={summary.totalAmount}
      />
      <WorkerAttendanceTable workers={workers} attendanceRows={attendanceRows} />
    </MobilePage>
  );
}
