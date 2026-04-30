import type {
  PartnerFormValues,
  PartnerInsert,
  PartnerTransactionFormValues,
  PartnerTransactionInsert,
} from "@/features/partners/types";

const allowedEntryTypes = new Set(["paid_by_partner", "received_by_partner"]);
const allowedPaymentModes = new Set(["UPI", "Cash", "Bank", "Cheque"]);

export class PartnerValidationError extends Error {
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

export function validatePartnerForm(
  values: PartnerFormValues,
): ValidationSuccess<PartnerInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  if (!values.project_id.trim()) errors.project_id = "Project is required.";
  if (!values.name.trim()) errors.name = "Partner name is required.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      project_id: values.project_id.trim(),
      name: values.name.trim(),
    },
  };
}

export function validatePartnerTransactionForm(
  values: PartnerTransactionFormValues,
): ValidationSuccess<PartnerTransactionInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const amount = Number(values.amount);

  if (!values.project_id.trim()) errors.project_id = "Project is required.";
  if (!values.partner_id.trim()) errors.partner_id = "Partner is required.";
  if (!allowedEntryTypes.has(values.entry_type.trim())) {
    errors.entry_type = "Choose paid by partner or received by partner.";
  }
  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount.";
  }
  if (!values.transaction_date.trim()) {
    errors.transaction_date = "Date is required.";
  }
  if (!allowedPaymentModes.has(values.payment_mode.trim())) {
    errors.payment_mode = "Choose UPI, Cash, Bank, or Cheque.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: values.project_id.trim(),
      partner_id: values.partner_id.trim(),
      entry_type: values.entry_type.trim() as PartnerTransactionInsert["entry_type"],
      amount,
      transaction_date: values.transaction_date.trim(),
      payment_mode: values.payment_mode.trim() as PartnerTransactionInsert["payment_mode"],
    },
  };
}

export function parsePartnerPayload(input: unknown): PartnerInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validatePartnerForm({
    project_id: String(object.project_id ?? ""),
    name: String(object.name ?? ""),
  });

  if (!result.success) {
    throw new PartnerValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

export function parsePartnerTransactionPayload(input: unknown): PartnerTransactionInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validatePartnerTransactionForm({
    project_id: String(object.project_id ?? ""),
    partner_id: String(object.partner_id ?? ""),
    entry_type: String(object.entry_type ?? ""),
    amount: String(object.amount ?? ""),
    transaction_date: String(object.transaction_date ?? ""),
    payment_mode: String(object.payment_mode ?? ""),
  });

  if (!result.success) {
    throw new PartnerValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}
