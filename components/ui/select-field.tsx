type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

export function SelectField({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-sm font-medium text-[color:var(--foreground)]">{label}</span>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-12 rounded-2xl border bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] ${
          error ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-medium text-[color:var(--danger)]">{error}</span>
      ) : null}
    </label>
  );
}
