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

export function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export function getCurrentMonthLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}
