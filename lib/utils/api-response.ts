import { NextResponse } from "next/server";

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  error: unknown,
  fallbackMessage: string,
  status = 500,
  fieldErrors?: Record<string, string>,
) {
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : fallbackMessage,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    { status },
  );
}
