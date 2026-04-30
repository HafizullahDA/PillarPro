export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export type PaginationOptions = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  rows: T[];
  pagination: PaginationMeta;
};

export function normalizePagination(options?: PaginationOptions) {
  const page = Math.max(DEFAULT_PAGE, Math.trunc(options?.page ?? DEFAULT_PAGE));
  const pageSize = clampPageSize(options?.pageSize ?? DEFAULT_PAGE_SIZE);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationOptions {
  return {
    page: parseInteger(searchParams.get("page")) ?? DEFAULT_PAGE,
    pageSize: parseInteger(searchParams.get("pageSize")) ?? DEFAULT_PAGE_SIZE,
  };
}

function clampPageSize(value: number) {
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(value)));
}

function parseInteger(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}
