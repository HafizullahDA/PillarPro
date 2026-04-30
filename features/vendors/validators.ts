import type {
  VendorFormValues,
  VendorInsert,
  VendorPaymentFormValues,
  VendorPaymentInsert,
  VendorPurchaseFormValues,
  VendorPurchaseInsert,
} from "@/features/vendors/types";

const allowedPaymentModes = new Set(["UPI", "Cash", "Bank", "Cheque"]);

export class VendorValidationError extends Error {
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

export function validateVendorForm(
  values: VendorFormValues,
): ValidationSuccess<VendorInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const projectId = values.project_id.trim();
  const name = values.name.trim();

  if (!projectId) errors.project_id = "Project is required.";
  if (!name) errors.name = "Vendor name is required.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      project_id: projectId,
      name,
      contact_person: values.contact_person.trim(),
      phone: values.phone.trim(),
    },
  };
}

export function validateVendorPurchaseForm(
  values: VendorPurchaseFormValues,
): ValidationSuccess<VendorPurchaseInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const projectId = values.project_id.trim();
  const vendorId = values.vendor_id.trim();
  const material = values.material.trim();
  const quantity = Number(values.quantity);
  const rate = Number(values.rate);
  const purchaseDate = values.purchase_date.trim();

  if (!projectId) errors.project_id = "Project is required.";
  if (!vendorId) errors.vendor_id = "Vendor is required.";
  if (!material) errors.material = "Material is required.";
  if (!values.quantity.trim() || Number.isNaN(quantity) || quantity <= 0) {
    errors.quantity = "Enter a valid quantity.";
  }
  if (!values.rate.trim() || Number.isNaN(rate) || rate <= 0) {
    errors.rate = "Enter a valid rate.";
  }
  if (!purchaseDate) errors.purchase_date = "Date is required.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: projectId,
      vendor_id: vendorId,
      material,
      quantity,
      rate,
      amount: Number((quantity * rate).toFixed(2)),
      purchase_date: purchaseDate,
    },
  };
}

export function validateVendorPaymentForm(
  values: VendorPaymentFormValues,
): ValidationSuccess<VendorPaymentInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const projectId = values.project_id.trim();
  const vendorId = values.vendor_id.trim();
  const amount = Number(values.amount);
  const paymentMode = values.payment_mode.trim();
  const paymentDate = values.payment_date.trim();
  const reference = values.payment_reference.trim();

  if (!projectId) errors.project_id = "Project is required.";
  if (!vendorId) errors.vendor_id = "Vendor is required.";
  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount.";
  }
  if (!paymentMode) errors.payment_mode = "Payment mode is required.";
  else if (!allowedPaymentModes.has(paymentMode)) {
    errors.payment_mode = "Choose UPI, Cash, Bank, or Cheque.";
  }
  if (!reference) errors.payment_reference = "Reference is required.";
  if (!paymentDate) errors.payment_date = "Date is required.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: projectId,
      vendor_id: vendorId,
      amount,
      payment_mode: paymentMode as VendorPaymentInsert["payment_mode"],
      payment_reference: reference,
      payment_date: paymentDate,
    },
  };
}

export function parseVendorPayload(input: unknown): VendorInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateVendorForm({
    project_id: String(object.project_id ?? ""),
    name: String(object.name ?? ""),
    contact_person: String(object.contact_person ?? ""),
    phone: String(object.phone ?? ""),
  });

  if (!result.success) {
    throw new VendorValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

export function parseVendorPurchasePayload(input: unknown): VendorPurchaseInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateVendorPurchaseForm({
    project_id: String(object.project_id ?? ""),
    vendor_id: String(object.vendor_id ?? ""),
    material: String(object.material ?? ""),
    quantity: String(object.quantity ?? ""),
    rate: String(object.rate ?? ""),
    purchase_date: String(object.purchase_date ?? ""),
  });

  if (!result.success) {
    throw new VendorValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

export function parseVendorPaymentPayload(input: unknown): VendorPaymentInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateVendorPaymentForm({
    project_id: String(object.project_id ?? ""),
    vendor_id: String(object.vendor_id ?? ""),
    amount: String(object.amount ?? ""),
    payment_mode: String(object.payment_mode ?? ""),
    payment_reference: String(object.payment_reference ?? ""),
    payment_date: String(object.payment_date ?? ""),
  });

  if (!result.success) {
    throw new VendorValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}
