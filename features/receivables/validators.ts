import type {
  BillFormValues,
  BillInsert,
  ReceiptFormValues,
  ReceiptInsert,
} from "@/features/receivables/types";

const allowedBillTypes = new Set(["running", "final"]);
const allowedPaymentModes = new Set(["UPI", "Cash", "Bank", "Cheque"]);

export class ReceivableValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  errors: Record<string, string>;
};

export function validateBillForm(
  values: BillFormValues,
): ValidationSuccess<BillInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const grossAmount = Number(values.gross_amount);
  const deductions = Number(values.deductions || 0);
  const netPayable = Number((grossAmount - deductions).toFixed(2));

  if (!values.project_id.trim()) errors.project_id = "Project is required.";
  if (!values.bill_number.trim()) errors.bill_number = "Bill number is required.";
  if (!allowedBillTypes.has(values.bill_type.trim())) {
    errors.bill_type = "Choose running or final.";
  }
  if (!values.bill_date.trim()) errors.bill_date = "Bill date is required.";
  if (!values.gross_amount.trim() || Number.isNaN(grossAmount) || grossAmount <= 0) {
    errors.gross_amount = "Enter a valid gross amount.";
  }
  if (Number.isNaN(deductions) || deductions < 0) {
    errors.deductions = "Deductions cannot be negative.";
  }
  if (!Number.isNaN(grossAmount) && !Number.isNaN(deductions) && netPayable < 0) {
    errors.deductions = "Deductions cannot exceed gross amount.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: values.project_id.trim(),
      bill_number: values.bill_number.trim(),
      bill_type: values.bill_type.trim() as BillInsert["bill_type"],
      bill_date: values.bill_date.trim(),
      gross_amount: grossAmount,
      deductions,
      net_payable: netPayable,
    },
  };
}

export function validateReceiptForm(
  values: ReceiptFormValues,
): ValidationSuccess<ReceiptInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const amount = Number(values.amount);

  if (!values.project_id.trim()) errors.project_id = "Project is required.";
  if (!values.bill_id.trim()) errors.bill_id = "Bill is required.";
  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount.";
  }
  if (!values.receipt_date.trim()) errors.receipt_date = "Date is required.";
  if (!allowedPaymentModes.has(values.payment_mode.trim())) {
    errors.payment_mode = "Choose UPI, Cash, Bank, or Cheque.";
  }
  if (!values.payment_reference.trim()) {
    errors.payment_reference = "Reference is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: values.project_id.trim(),
      bill_id: values.bill_id.trim(),
      amount,
      receipt_date: values.receipt_date.trim(),
      payment_mode: values.payment_mode.trim() as ReceiptInsert["payment_mode"],
      payment_reference: values.payment_reference.trim(),
    },
  };
}

export function parseBillPayload(input: unknown): BillInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateBillForm({
    project_id: String(object.project_id ?? ""),
    bill_number: String(object.bill_number ?? ""),
    bill_type: String(object.bill_type ?? ""),
    bill_date: String(object.bill_date ?? ""),
    gross_amount: String(object.gross_amount ?? ""),
    deductions: String(object.deductions ?? "0"),
  });

  if (!result.success) {
    throw new ReceivableValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

export function parseReceiptPayload(input: unknown): ReceiptInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateReceiptForm({
    project_id: String(object.project_id ?? ""),
    bill_id: String(object.bill_id ?? ""),
    amount: String(object.amount ?? ""),
    receipt_date: String(object.receipt_date ?? ""),
    payment_mode: String(object.payment_mode ?? ""),
    payment_reference: String(object.payment_reference ?? ""),
  });

  if (!result.success) {
    throw new ReceivableValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}
