type CalculateAttendanceAmountInput = {
  dailyRate: number;
  status: string;
  otHours: number;
};

export function calculateAttendanceAmount({
  dailyRate,
  status,
  otHours,
}: CalculateAttendanceAmountInput) {
  const safeDailyRate = Number.isFinite(dailyRate) ? dailyRate : 0;
  const safeOtHours = Number.isFinite(otHours) ? otHours : 0;
  const hourlyRate = safeDailyRate / 8;

  if (status === "present") {
    return roundMoney(safeDailyRate);
  }

  if (status === "half-day") {
    return roundMoney(safeDailyRate * 0.5);
  }

  if (status === "overtime") {
    return roundMoney(safeDailyRate + hourlyRate * safeOtHours);
  }

  return 0;
}

export function getWorkDayValue(status: string) {
  if (status === "present" || status === "overtime") {
    return 1;
  }

  if (status === "half-day") {
    return 0.5;
  }

  return 0;
}

export function getMonthRange(monthValue?: string) {
  const parsed = parseMonthValue(monthValue);
  const now = parsed ?? new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export function getMonthLabel(monthValue?: string) {
  const parsed = parseMonthValue(monthValue);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed ?? new Date());
}

export function getCurrentMonthRange() {
  return getMonthRange();
}

export function getCurrentMonthLabel() {
  return getMonthLabel();
}

export function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function parseMonthValue(monthValue?: string) {
  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    return null;
  }

  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}
