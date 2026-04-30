export type BillListItem = {
  id: string;
  project_id: string;
  project_name: string;
  bill_number: string;
  bill_type: string;
  gross_amount: number;
  deductions: number;
  net_payable: number;
  bill_date: string;
};

export type ReceiptListItem = {
  id: string;
  project_id: string;
  project_name: string;
  bill_number: string | null;
  amount: number;
  receipt_date: string;
  payment_mode: string;
  payment_reference: string | null;
};

export type ProjectReceivableSummary = {
  project_id: string;
  project_name: string;
  agency_name: string | null;
  advertised_cost: number | null;
  awarded_amount: number | null;
  billCount: number;
  totalBilled: number;
  totalReceived: number;
  outstanding: number;
};

export type BillInsert = {
  id: string;
  project_id: string;
  bill_number: string;
  bill_type: "running" | "final";
  bill_date: string;
  gross_amount: number;
  deductions: number;
  net_payable: number;
};

export type ReceiptInsert = {
  id: string;
  project_id: string;
  bill_id: string;
  amount: number;
  receipt_date: string;
  payment_mode: "UPI" | "Cash" | "Bank" | "Cheque";
  payment_reference: string;
};

export type BillFormValues = {
  project_id: string;
  bill_number: string;
  bill_type: string;
  bill_date: string;
  gross_amount: string;
  deductions: string;
};

export type ReceiptFormValues = {
  project_id: string;
  bill_id: string;
  amount: string;
  receipt_date: string;
  payment_mode: string;
  payment_reference: string;
};

export const emptyBillFormValues: BillFormValues = {
  project_id: "",
  bill_number: "",
  bill_type: "",
  bill_date: "",
  gross_amount: "",
  deductions: "0",
};

export const emptyReceiptFormValues: ReceiptFormValues = {
  project_id: "",
  bill_id: "",
  amount: "",
  receipt_date: "",
  payment_mode: "",
  payment_reference: "",
};
