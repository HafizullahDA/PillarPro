import { AttendanceRegister } from "@/components/attendance/attendance-register";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  getCurrentMonthValue,
  getMonthLabel,
} from "@/features/attendance/calculations";
import {
  getAttendanceRecords,
  getWorkers,
} from "@/features/attendance/queries";
import { getProjects } from "@/features/projects/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserDisplayName } from "@/lib/auth/user-display-name";

export const dynamic = "force-dynamic";

type AttendancePageProps = {
  searchParams?: Promise<{
    project?: string;
    month?: string;
  }>;
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = (await searchParams) ?? {};
  const selectedMonth = params.month && /^\d{4}-\d{2}$/.test(params.month)
    ? params.month
    : getCurrentMonthValue();

  const [projects, workers, attendanceRows, user] = await Promise.all([
    getProjects(),
    getWorkers(),
    getAttendanceRecords(selectedMonth),
    getCurrentUser(),
  ]);

  const selectedProjectId =
    params.project && projects.some((project) => project.id === params.project)
      ? params.project
      : projects[0]?.id ?? "";

  const userName = getUserDisplayName(user);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-3 pb-24 pt-4 sm:px-5 sm:pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
            Worker Attendance
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Phone-first daily marking connected directly to the attendance ledger flow.
          </p>
        </div>
        <SignOutButton />
      </div>

      <AttendanceRegister
        projects={projects}
        workers={workers}
        attendanceRows={attendanceRows}
        selectedProjectId={selectedProjectId}
        selectedMonth={selectedMonth}
        monthLabel={getMonthLabel(selectedMonth)}
        userName={userName}
      />

      <BottomNav />
    </main>
  );
}
