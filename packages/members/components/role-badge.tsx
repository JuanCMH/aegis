import { Crown, ShieldCheck, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: "admin" | "member";
  isOwner?: boolean;
  customRoleName?: string | null;
  className?: string;
}

/**
 * Compact badge indicating a member's role. Owner > Admin > Custom role > Member.
 * Uses Aegis tokens exclusively.
 */
export function RoleBadge({
  role,
  isOwner,
  customRoleName,
  className,
}: RoleBadgeProps) {
  if (isOwner) {
    return (
      <Chip
        icon={<Crown className="size-3.5" />}
        label="Propietario"
        variant="amber"
        className={className}
      />
    );
  }

  if (customRoleName) {
    return (
      <Chip
        icon={<ShieldCheck className="size-3.5" />}
        label={customRoleName}
        variant="cyan"
        className={className}
      />
    );
  }

  if (role === "admin") {
    return (
      <Chip
        icon={<ShieldCheck className="size-3.5" />}
        label="Administrador"
        variant="sapphire"
        className={className}
      />
    );
  }

  return (
    <Chip
      icon={<UserIcon className="size-3.5" />}
      label="Miembro"
      variant="slate"
      className={className}
    />
  );
}

type ChipVariant = "amber" | "sapphire" | "cyan" | "slate";

const variantClasses: Record<ChipVariant, string> = {
  amber: "bg-aegis-amber/10 text-aegis-amber border-aegis-amber/20",
  sapphire: "bg-aegis-sapphire/10 text-aegis-sapphire border-aegis-sapphire/20",
  cyan: "bg-aegis-cyan/10 text-aegis-cyan border-aegis-cyan/20",
  slate: "bg-aegis-slate/10 text-aegis-steel border-aegis-slate/30",
};

function Chip({
  icon,
  label,
  variant,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  variant: ChipVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
