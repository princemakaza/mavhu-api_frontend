// editContentComponents/Sortable.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Sortable: React.FC<SortableProps> = ({
  id,
  children,
  className = "",
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {typeof children === "function"
        ? (children as any)({ attributes, listeners, isDragging })
        : children}
    </div>
  );
};