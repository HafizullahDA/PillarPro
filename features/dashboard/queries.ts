import type {
  DashboardOutstandingAlert,
  DashboardCategoryGroup,
  DashboardProjectGroup,
  DashboardSummary,
} from "@/features/dashboard/types";
import { getProjects } from "@/features/projects/queries";
import { getVendors } from "@/features/vendors/queries";
import {
  getProjectFinancials,
  getReceivables,
  getVendorOutstanding,
} from "@/lib/services/finance-service";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [projects, vendors] = await Promise.all([getProjects(), getVendors()]);
  const [projectFinancials, receivables, vendorDues] = await Promise.all([
    Promise.all(projects.map((project) => getProjectFinancials(project.id))),
    Promise.all(projects.map((project) => getReceivables(project.id))),
    Promise.all(vendors.map((vendor) => getVendorOutstanding(vendor.id))),
  ]);

  return {
    totalExpense: sumValues(projectFinancials, "total_expense"),
    totalReceived: sumValues(projectFinancials, "total_received"),
    outstanding: sumValues(receivables, "outstanding"),
    vendorDues: sumValues(vendorDues, "outstanding"),
    receivables: sumValues(receivables, "total_billed"),
  };
}

export async function getDashboardOutstandingAlerts(): Promise<
  DashboardOutstandingAlert[]
> {
  const projects = await getProjects();
  const receivables = await Promise.all(
    projects.map(async (project) => ({
      project,
      receivable: await getReceivables(project.id),
    })),
  );

  return receivables
    .filter(({ receivable }) => receivable.outstanding > 0)
    .map(({ project, receivable }) => ({
      project_id: project.id,
      project_name: project.name,
      outstanding: receivable.outstanding,
    }))
    .sort((a, b) => b.outstanding - a.outstanding);
}

export async function getDashboardProjectGroups(): Promise<DashboardProjectGroup[]> {
  const projects = await getProjects();
  const rows = await Promise.all(
    projects.map(async (project) => {
      const [financials, receivables] = await Promise.all([
        getProjectFinancials(project.id),
        getReceivables(project.id),
      ]);

      return {
        project_id: project.id,
        project_name: project.name,
        totalExpense: financials.total_expense,
        totalReceived: financials.total_received,
        totalReceivable: receivables.total_billed,
        netMovement: roundMoney(
          financials.total_received - financials.total_expense,
        ),
      };
    }),
  );

  return rows
    .sort((a, b) => a.project_name.localeCompare(b.project_name));
}

export async function getDashboardCategoryGroups(): Promise<DashboardCategoryGroup[]> {
  const grouped = new Map<string, DashboardCategoryGroup>();
  const projects = await getProjects();
  const projectFinancials = await Promise.all(
    projects.map((project) => getProjectFinancials(project.id)),
  );

  for (const financials of projectFinancials) {
    for (const item of financials.breakdown) {
      const key = `${item.category}::${item.direction}`;
      const current = grouped.get(key) ?? {
        category: item.category,
        direction: item.direction,
        amount: 0,
      };

      current.amount += item.amount;
      grouped.set(key, current);
    }
  }

  return [...grouped.values()]
    .map((row) => ({ ...row, amount: roundMoney(row.amount) }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

type NumericFieldKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

function sumValues<T>(
  rows: T[],
  field: NumericFieldKeys<T>,
) {
  return roundMoney(
    rows.reduce((sum, row) => sum + Number(row[field] ?? 0), 0),
  );
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}
