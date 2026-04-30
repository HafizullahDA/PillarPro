export type DashboardSummary = {
  totalExpense: number;
  totalReceived: number;
  outstanding: number;
  vendorDues: number;
  receivables: number;
};

export type DashboardProjectGroup = {
  project_id: string;
  project_name: string;
  totalExpense: number;
  totalReceived: number;
  totalReceivable: number;
  netMovement: number;
};

export type DashboardCategoryGroup = {
  category: string;
  direction: "inflow" | "outflow";
  amount: number;
};
