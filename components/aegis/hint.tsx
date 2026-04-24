"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  label?: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export const Hint = ({
  label,
  children,
  align = "center",
  side = "top",
}: HintProps) => {
  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {label && (
        <TooltipContent align={align} side={side}>
          <p className="font-medium text-xs">{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
