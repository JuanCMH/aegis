import { Hint } from "./hint";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ComponentProps } from "react";

interface FieldProps extends Omit<ComponentProps<"input">, "onChange"> {
  label?: string;
  htmlFor?: string;
  onChange?: (value: string) => void;
}

export const Field = ({
  label,
  htmlFor,
  onChange,
  className,
  type = "text",
  ...props
}: FieldProps) => {
  return (
    <div className={cn("grid w-full items-center gap-1", className)}>
      <Label htmlFor={htmlFor || props.id} className="text-xs line-clamp-1">
        {label}
      </Label>
      <Hint label={props.value as string} side="top">
        <Input
          {...props}
          id={htmlFor || props.id}
          type={type}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(props.readOnly && "cursor-default")}
        />
      </Hint>
    </div>
  );
};
