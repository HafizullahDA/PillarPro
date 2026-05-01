"use client";

import { useState } from "react";

type InputFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: "text" | "number" | "date" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  step?: string;
};

export function InputField({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  step,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-12 w-full rounded-2xl border bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] ${
            isPassword ? "pr-12" : ""
          } ${error ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:bg-white/70 hover:text-[color:var(--foreground)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs font-medium text-[color:var(--danger)]">{error}</span>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M8.2 5.4A10.8 10.8 0 0 1 12 4.8c6 0 9.5 7.2 9.5 7.2a17 17 0 0 1-3 4.1" />
      <path d="M14.6 19.1a10.7 10.7 0 0 1-2.6.3C6 19.4 2.5 12 2.5 12a17.2 17.2 0 0 1 4.1-4.8" />
    </svg>
  );
}
