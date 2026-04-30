export type WorkerListItem = {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  designation: string;
  daily_rate: number;
  created_at: string;
};

export type AttendanceListItem = {
  id: string;
  project_id: string;
  worker_id: string;
  project_name: string;
  worker_name: string;
  status: string;
  ot_hours: number;
  amount: number;
  attendance_date: string;
};

export type AttendanceSummaryData = {
  totalDaysWorked: number;
  totalOtHours: number;
  totalAmount: number;
};

export type WorkerInsert = {
  project_id: string;
  name: string;
  designation: string;
  role: string;
  daily_rate: number;
};

export type AttendanceInsert = {
  id: string;
  project_id: string;
  worker_id: string;
  attendance_date: string;
  status: "present" | "half-day" | "absent" | "overtime";
  ot_hours: number;
  amount: number;
  units_worked: number;
  overtime_units: number;
};

export type WorkerFormValues = {
  project_id: string;
  name: string;
  designation: string;
  daily_rate: string;
};

export type AttendanceFormValues = {
  project_id: string;
  worker_id: string;
  status: string;
  ot_hours: string;
  attendance_date: string;
};

export const emptyWorkerFormValues: WorkerFormValues = {
  project_id: "",
  name: "",
  designation: "",
  daily_rate: "",
};

export const emptyAttendanceFormValues: AttendanceFormValues = {
  project_id: "",
  worker_id: "",
  status: "",
  ot_hours: "0",
  attendance_date: "",
};
