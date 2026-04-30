import type {
  MiscExpenseFormValues,
  MiscExpenseInsert,
} from "@/features/misc-expenses/types";

const allowedCategories = new Set([
  "Fuel",
  "Equipment",
  "Tendering/CDRS",
  "Site expenses",
]);

export class MiscExpenseValidationError extends Error {
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

export function validateMiscExpenseForm(
  values: MiscExpenseFormValues,
): ValidationSuccess<MiscExpenseInsert> | ValidationFailure {
  const errors: Record<string, string> = {};
  const amount = Number(values.amount);

  if (!values.project_id.trim()) errors.project_id = "Project is required.";
  if (!allowedCategories.has(values.category.trim())) {
    errors.category = "Choose Fuel, Equipment, Tendering/CDRS, or Site expenses.";
  }
  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount.";
  }
  if (!values.expense_date.trim()) errors.expense_date = "Date is required.";
  if (!values.description.trim()) errors.description = "Description is required.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      project_id: values.project_id.trim(),
      category: values.category.trim() as MiscExpenseInsert["category"],
      amount,
      expense_date: values.expense_date.trim(),
      description: values.description.trim(),
    },
  };
}

export function parseMiscExpensePayload(input: unknown): MiscExpenseInsert {
  const object = (input ?? {}) as Record<string, unknown>;
  const result = validateMiscExpenseForm({
    project_id: String(object.project_id ?? ""),
    category: String(object.category ?? ""),
    amount: String(object.amount ?? ""),
    expense_date: String(object.expense_date ?? ""),
    description: String(object.description ?? ""),
  });

  if (!result.success) {
    throw new MiscExpenseValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}
