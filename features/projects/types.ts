export type ProjectRow = {
  id: string;
  name: string;
  code: string;
  agency_name: string | null;
  advertised_cost: number | null;
  awarded_amount: number | null;
  start_date: string | null;
  status: string;
  created_at: string;
};

export type ProjectListItem = ProjectRow;

export type ProjectInsert = {
  name: string;
  code: string;
  agency_name: string;
  advertised_cost: number;
  awarded_amount: number;
  start_date: string;
  status: "active";
  owner_user_id?: string;
};

export type ProjectFormValues = {
  name: string;
  agency_name: string;
  advertised_cost: string;
  awarded_amount: string;
  start_date: string;
};

export const emptyProjectFormValues: ProjectFormValues = {
  name: "",
  agency_name: "",
  advertised_cost: "",
  awarded_amount: "",
  start_date: "",
};
