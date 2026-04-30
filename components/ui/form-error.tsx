type FormErrorProps = {
  message: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[color:var(--danger)]"
      role="alert"
    >
      {message}
    </p>
  );
}
