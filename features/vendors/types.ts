export type VendorListItem = {
  id: string;
  project_id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  project_name: string;
  created_at: string;
};

export type VendorPurchaseListItem = {
  id: string;
  project_id: string;
  project_name: string;
  vendor_name: string;
  material: string;
  quantity: number;
  rate: number;
  amount: number;
  purchase_date: string;
};

export type VendorPaymentListItem = {
  id: string;
  project_id: string;
  project_name: string;
  vendor_name: string;
  amount: number;
  payment_mode: string;
  payment_reference: string | null;
  payment_date: string;
};

export type VendorInsert = {
  project_id: string;
  name: string;
  contact_person: string;
  phone: string;
};

export type VendorPurchaseInsert = {
  id: string;
  project_id: string;
  vendor_id: string;
  material: string;
  quantity: number;
  rate: number;
  amount: number;
  purchase_date: string;
};

export type VendorPaymentInsert = {
  id: string;
  project_id: string;
  vendor_id: string;
  amount: number;
  payment_mode: "UPI" | "Cash" | "Bank" | "Cheque";
  payment_reference: string;
  payment_date: string;
};

export type VendorFormValues = {
  project_id: string;
  name: string;
  contact_person: string;
  phone: string;
};

export type VendorPurchaseFormValues = {
  project_id: string;
  vendor_id: string;
  material: string;
  quantity: string;
  rate: string;
  purchase_date: string;
};

export type VendorPaymentFormValues = {
  project_id: string;
  vendor_id: string;
  amount: string;
  payment_mode: string;
  payment_reference: string;
  payment_date: string;
};

export const emptyVendorFormValues: VendorFormValues = {
  project_id: "",
  name: "",
  contact_person: "",
  phone: "",
};

export const emptyVendorPurchaseFormValues: VendorPurchaseFormValues = {
  project_id: "",
  vendor_id: "",
  material: "",
  quantity: "",
  rate: "",
  purchase_date: "",
};

export const emptyVendorPaymentFormValues: VendorPaymentFormValues = {
  project_id: "",
  vendor_id: "",
  amount: "",
  payment_mode: "",
  payment_reference: "",
  payment_date: "",
};
