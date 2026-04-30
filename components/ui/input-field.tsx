type InputFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: "text" | "number" | "date";
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
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-12 rounded-2xl border bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] ${
          error ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-[color:var(--danger)]">{error}</span>
      ) : null}
    </label>
  );
}
