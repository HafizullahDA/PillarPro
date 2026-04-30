type NamedRelation = { name?: string } | { name?: string }[] | null;
type BillRelation = { bill_number?: string } | { bill_number?: string }[] | null;

export function getRelationName(relation: NamedRelation) {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "";
  }

  return relation?.name ?? "";
}

export function getRelationBillNumber(relation: BillRelation) {
  if (Array.isArray(relation)) {
    return relation[0]?.bill_number ?? null;
  }

  return relation?.bill_number ?? null;
}
