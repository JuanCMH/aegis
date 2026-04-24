import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

/**
 * Labelled text input used across auth cards. Thin wrapper to keep the cards
 * readable; not a general Field replacement.
 */
export const TextField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  autoComplete,
  className,
}: TextFieldProps) => {
  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-aegis-steel">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
