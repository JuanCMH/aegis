"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TemplateSection } from "@/packages/template-builder/types";

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
      data-section-id={section.id}
      className={cn(
        "flex shrink-0 items-center gap-1 group",
        isOver && !isActive && "ring-1 ring-primary/40 rounded-md",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the active tab into view whenever it changes.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activeTab = scroller.querySelector<HTMLElement>(
      `[data-section-id="${activeSectionId}"]`,
    );
    activeTab?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSectionId]);

  // Auto-scroll the strip horizontally while a field is being dragged near
  // the left/right edges, so users can drop on tabs that aren't yet visible.
  const dragRafRef = useRef<number | null>(null);
  const dragPointerXRef = useRef<number | null>(null);

  const stopEdgeScroll = () => {
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    dragPointerXRef.current = null;
  };

  const tickEdgeScroll = () => {
    const scroller = scrollerRef.current;
    const x = dragPointerXRef.current;
    if (!scroller || x === null) {
      dragRafRef.current = null;
      return;
    }
    const rect = scroller.getBoundingClientRect();
    const EDGE = 60; // px hot zone
    const MAX_SPEED = 18; // px per frame
    let delta = 0;
    if (x < rect.left + EDGE) {
      const ratio = (rect.left + EDGE - x) / EDGE;
      delta = -Math.min(MAX_SPEED, MAX_SPEED * ratio);
    } else if (x > rect.right - EDGE) {
      const ratio = (x - (rect.right - EDGE)) / EDGE;
      delta = Math.min(MAX_SPEED, MAX_SPEED * ratio);
    }
    if (delta !== 0) scroller.scrollLeft += delta;
    dragRafRef.current = requestAnimationFrame(tickEdgeScroll);
  };

  useDndMonitor({
    onDragStart() {
      if (dragRafRef.current === null) {
        dragRafRef.current = requestAnimationFrame(tickEdgeScroll);
      }
    },
    onDragMove(event) {
      const activator =
        (event.activatorEvent as PointerEvent | MouseEvent | undefined) ?? null;
      const startX =
        activator && "clientX" in activator ? activator.clientX : 0;
      dragPointerXRef.current = startX + (event.delta?.x ?? 0);
    },
    onDragEnd: stopEdgeScroll,
    onDragCancel: stopEdgeScroll,
  });

  useEffect(() => stopEdgeScroll, []);

  return (
    <div className="flex shrink-0 items-center border-b border-border/40">
      {/* Scroll horizontal con fade en bordes — todos los tabs siguen
          siendo droppables, no escondemos ninguno en un menú. */}
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollerRef}
          className="flex items-center gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Secciones del formulario"
        >
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
        </div>
        {/* Fade gradients to hint the scroll */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background to-transparent" />
      </div>
      <div className="flex shrink-0 items-center pr-4 pl-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={onAddSection}
          aria-label="Agregar sección"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
