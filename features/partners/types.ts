export type PartnerListItem = {
  id: string;
  project_id: string;
  project_name: string;
  name: string;
  created_at: string;
};

export type PartnerBalanceRow = {
  partner_id: string;
  partner_name: string;
  project_name: string;
  totalPaidByPartner: number;
  totalReceivedByPartner: number;
  runningBalance: number;
};

export type PartnerTransactionRow = {
  id: string;
  partner_id: string;
  partner_name: string;
  project_name: string;
  entry_type: string;
  payment_mode: string;
  amount: number;
  transaction_date: string;
};

export type PartnerInsert = {
  project_id: string;
  name: string;
};

export type PartnerTransactionInsert = {
  id: string;
  project_id: string;
  partner_id: string;
  entry_type: "paid_by_partner" | "received_by_partner";
  amount: number;
  transaction_date: string;
  payment_mode: "UPI" | "Cash" | "Bank" | "Cheque";
};

export type PartnerFormValues = {
  project_id: string;
  name: string;
};

export type PartnerTransactionFormValues = {
  project_id: string;
  partner_id: string;
  entry_type: string;
  amount: string;
  transaction_date: string;
  payment_mode: string;
};

export const emptyPartnerFormValues: PartnerFormValues = {
  project_id: "",
  name: "",
};

export const emptyPartnerTransactionFormValues: PartnerTransactionFormValues = {
  project_id: "",
  partner_id: "",
  entry_type: "",
  amount: "",
  transaction_date: "",
  payment_mode: "",
};
