"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import type { TemplateSection } from "@/packages/clients/types";

interface SectionTabsProps {
  sections: TemplateSection[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onAddSection: () => void;
  onRenameSection: (id: string, label: string) => void;
  onDeleteSection: (id: string) => void;
}

function DroppableTab({
  section,
  isActive,
  onSelect,
  onRename,
  onDelete,
  canDelete,
}: {
  section: TemplateSection;
  isActive: boolean;
  onSelect: () => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.label);

  const { setNodeRef, isOver } = useDroppable({
    id: `tab-${section.id}`,
    data: { type: "section-tab", sectionId: section.id },
  });

  const handleSubmitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== section.label) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditValue(section.label);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmitRename();
            if (e.key === "Escape") handleCancelRename();
          }}
          className="h-7 w-32 text-xs"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-6 p-0"
          onClick={handleSubmitRename}
        >
          <Check className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-6 p-0"
          onClick={handleCancelRename}
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-1 group",
        isOver && !isActive && "ring-1 ring-primary/40 rounded-md",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )}
      >
        {section.label}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuItem
            onClick={() => {
              setEditValue(section.label);
              setIsEditing(true);
            }}
          >
            <Pencil className="size-3.5 mr-2" />
            Renombrar
          </DropdownMenuItem>
          {canDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5 mr-2" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SectionTabs({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection,
}: SectionTabsProps) {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border/40">
      {sortedSections.map((section) => (
        <DroppableTab
          key={section.id}
          section={section}
          isActive={section.id === activeSectionId}
          onSelect={() => onSelectSection(section.id)}
          onRename={(label) => onRenameSection(section.id, label)}
          onDelete={() => onDeleteSection(section.id)}
          canDelete={sections.length > 1}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-6 p-0 text-muted-foreground hover:text-foreground"
        onClick={onAddSection}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
