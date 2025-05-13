import { useDrag, useDrop } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { garantiesOutput } from "@/lib/output-Types";
import { Ref } from 'react';
import React from 'react';

// Types
export interface DragItem {
  type: 'GARANTIE';
  id: string;
  index: number;
  sourceId: string;
}

interface GarantieCardProps {
  garantie: garantiesOutput;
  index: number;
  sourceId: string;
  onRemove?: () => void;
}

interface DropZoneProps {
  id: string;
  onDrop: (item: DragItem, targetId: string) => void;
  children: React.ReactNode;
  className?: string;
}

// GarantieCard Component
export const GarantieCard: React.FC<GarantieCardProps> = ({ garantie, index, sourceId, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GARANTIE',
    item: { type: 'GARANTIE', id: garantie.id, index, sourceId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [garantie.id, index, sourceId]);

  const isAssigned = sourceId !== 'available-guarantees';

  return (
    <div
      ref={drag as any}
      className={cn(
        "p-3 rounded-lg border bg-card transition-colors",
        isDragging ? "opacity-50 border-dashed" : "hover:bg-accent/50",
        "cursor-move relative group"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {garantie.guarantee_type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {garantie.rate}%
          </Badge>
        </div>
        <div>
          <h4 className="font-medium text-sm">{garantie.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Franchise: {garantie.deductible}
          </p>
        </div>
      </div>
      {isAssigned && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// DropZone Component
export const DropZone: React.FC<DropZoneProps> = ({ id, onDrop, children, className }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'GARANTIE',
    drop: (item: DragItem) => {
      onDrop(item, id);
      return { id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDrop]);

  return (
    <div
      ref={drop as any}
      className={cn(
        "min-h-[100px] rounded-lg border-2 transition-colors p-4 space-y-2",
        isOver && canDrop ? "border-primary/50 bg-primary/5" : "border-dashed border-muted-foreground/20",
        className
      )}
    >
      {children}
    </div>
  );
}; 