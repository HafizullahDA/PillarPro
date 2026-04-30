import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function dataResult<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function errorResult(
  error: unknown,
  fallbackMessage: string,
  fieldErrors?: Record<string, string>,
): ApiFailure {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallbackMessage,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  error: unknown,
  fallbackMessage: string,
  status = 500,
  fieldErrors?: Record<string, string>,
) {
  return NextResponse.json(errorResult(error, fallbackMessage, fieldErrors), { status });
}
