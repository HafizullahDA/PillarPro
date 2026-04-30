export type MiscExpenseListItem = {
  id: string;
  project_id: string;
  project_name: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
};

export type MiscExpenseInsert = {
  id: string;
  project_id: string;
  category: "Fuel" | "Equipment" | "Tendering/CDRS" | "Site expenses";
  amount: number;
  expense_date: string;
  description: string;
};

export type MiscExpenseFormValues = {
  project_id: string;
  category: string;
  amount: string;
  expense_date: string;
  description: string;
};

export const emptyMiscExpenseFormValues: MiscExpenseFormValues = {
  project_id: "",
  category: "",
  amount: "",
  expense_date: "",
  description: "",
};
