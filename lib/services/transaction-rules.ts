export function isVendorTransactionCategory(category: string) {
  return category === "vendor" || category.startsWith("vendor_");
}

export function isWorkerTransactionCategory(category: string) {
  return category === "salary" || category === "salary_expense";
}

export function isPartnerTransactionCategory(category: string) {
  return category === "partner" || category.startsWith("partner_");
}
