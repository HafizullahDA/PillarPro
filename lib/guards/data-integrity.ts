import type { TransactionRow } from "@/lib/services/transaction-service";
import {
  isPartnerTransactionCategory,
  isVendorTransactionCategory,
  isWorkerTransactionCategory,
} from "@/lib/services/transaction-rules";

export type LedgerIntegrityIssue = {
  transactionId: string;
  category: string;
  field: "vendor_id" | "worker_id" | "partner_id";
  message: string;
};

export function findLedgerIntegrityIssues(
  rows: TransactionRow[],
): LedgerIntegrityIssue[] {
  const issues: LedgerIntegrityIssue[] = [];

  for (const row of rows) {
    if (isVendorTransactionCategory(row.category) && !row.vendor_id) {
      issues.push({
        transactionId: row.id,
        category: row.category,
        field: "vendor_id",
        message: `Vendor ledger transaction ${row.id} is missing vendor_id.`,
      });
      continue;
    }

    if (isWorkerTransactionCategory(row.category) && !row.worker_id) {
      issues.push({
        transactionId: row.id,
        category: row.category,
        field: "worker_id",
        message: `Salary ledger transaction ${row.id} is missing worker_id.`,
      });
      continue;
    }

    if (isPartnerTransactionCategory(row.category) && !row.partner_id) {
      issues.push({
        transactionId: row.id,
        category: row.category,
        field: "partner_id",
        message: `Partner ledger transaction ${row.id} is missing partner_id.`,
      });
    }
  }

  return issues;
}

export function assertLedgerIntegrity(rows: TransactionRow[]) {
  const issues = findLedgerIntegrityIssues(rows);

  if (issues.length === 0) {
    return;
  }

  for (const issue of issues.slice(0, 5)) {
    console.warn(`[Ledger integrity] ${issue.message}`);
  }

  throw new Error(
    `Ledger integrity check failed for ${issues.length} transaction${issues.length === 1 ? "" : "s"}. Run the transaction backfill before calculating financial summaries.`,
  );
}
