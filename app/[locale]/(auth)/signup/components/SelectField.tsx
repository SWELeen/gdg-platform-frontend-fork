import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage";

type SelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  error?: string;
  className?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export default function SelectField({
  id,
  label,
  placeholder,
  options,
  value,
  error,
  className = "",
  onChange,
  onBlur,
}: SelectFieldProps) {
  return (
    <div
      className={`relative block text-sm font-medium ${className}`}
    >
      <label htmlFor={id}>
        {label} <span className="text-gdg-red">*</span>
      </label>

      <span className="relative mt-1.5 block">
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-8 w-full appearance-none rounded-md border bg-surface px-2.75 text-sm font-normal outline-none ${
            value ? "text-foreground" : "text-foreground/40"
          } ${error ? "border-gdg-red" : "border-foreground/15"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-xs">
          ⌄
        </span>
      </span>

      <AuthErrorMessage
        id={`${id}-error`}
        message={error ?? ""}
        className="absolute start-0 top-full mt-0.5"
      />
    </div>
  );
}
