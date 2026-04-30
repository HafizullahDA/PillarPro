import type { ProjectFormValues, ProjectInsert } from "@/features/projects/types";

export class ProjectValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type ValidationSuccess = {
  success: true;
  data: ProjectInsert;
};

type ValidationFailure = {
  success: false;
  errors: Record<string, string>;
};

export function validateProjectForm(
  values: ProjectFormValues,
): ValidationSuccess | ValidationFailure {
  const fieldErrors: Record<string, string> = {};
  const name = values.name.trim();
  const agencyName = values.agency_name.trim();
  const advertisedCost = Number(values.advertised_cost);
  const awardedAmount = Number(values.awarded_amount);
  const startDate = values.start_date.trim();

  if (!name) {
    fieldErrors.name = "Project name is required.";
  }

  if (!agencyName) {
    fieldErrors.agency_name = "Agency name is required.";
  }

  if (!values.advertised_cost.trim()) {
    fieldErrors.advertised_cost = "Advertised cost is required.";
  } else if (Number.isNaN(advertisedCost) || advertisedCost < 0) {
    fieldErrors.advertised_cost = "Enter a valid amount.";
  }

  if (!values.awarded_amount.trim()) {
    fieldErrors.awarded_amount = "Awarded amount is required.";
  } else if (Number.isNaN(awardedAmount) || awardedAmount < 0) {
    fieldErrors.awarded_amount = "Enter a valid amount.";
  }

  if (!startDate) {
    fieldErrors.start_date = "Start date is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, errors: fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      code: buildProjectCode(name),
      agency_name: agencyName,
      advertised_cost: advertisedCost,
      awarded_amount: awardedAmount,
      start_date: startDate,
      status: "active",
    },
  };
}

export function parseProjectPayload(input: unknown): ProjectInsert {
  const object = (input ?? {}) as Record<string, unknown>;

  const result = validateProjectForm({
    name: String(object.name ?? ""),
    agency_name: String(object.agency_name ?? ""),
    advertised_cost: String(object.advertised_cost ?? ""),
    awarded_amount: String(object.awarded_amount ?? ""),
    start_date: String(object.start_date ?? ""),
  });

  if (!result.success) {
    throw new ProjectValidationError("Please fix the highlighted fields.", result.errors);
  }

  return result.data;
}

function buildProjectCode(name: string) {
  const compact = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);

  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `${compact || "PROJECT"}-${datePart}`;
}
