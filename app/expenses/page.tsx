import { MiscExpenseForm } from "@/components/forms/misc-expense-form";
import { MiscExpensesTable } from "@/components/lists/misc-expenses-table";
import { MobilePage } from "@/components/layout/mobile-page";
import { getProjects } from "@/features/projects/queries";
import { getMiscExpenses } from "@/features/misc-expenses/queries";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [projects, expenses] = await Promise.all([
    getProjects(),
    getMiscExpenses(),
  ]);

  return (
    <MobilePage
      eyebrow="Miscellaneous Records"
      title="Misc Expenses"
      description="Track fuel, equipment, tendering, and site expenses with automatic ledger entries."
    >
      <MiscExpenseForm projects={projects} />
      <MiscExpensesTable rows={expenses} />
    </MobilePage>
  );
}
