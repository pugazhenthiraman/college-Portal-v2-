'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  sectionLabels: { [key: string]: string };
  locked?: boolean;
};

function SortableItem({ id, label }: { id: string; label: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging
      ? '0 8px 24px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(0,0,0,0.08)'
      : undefined,
    zIndex: isDragging ? 10 : undefined,
    background: isDragging ? '#f3f4f6' : '#f9fafb',
    scale: isDragging ? 1.03 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-150 ${
        isDragging ? 'ring-2 ring-blue-400' : ''
      }`}
      aria-label={`Section: ${label}`}
    >
      <span className="font-medium text-gray-800">{label}</span>
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-200 transition"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <g stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="7" r="1"/>
            <circle cx="13" cy="7" r="1"/>
            <circle cx="7" cy="13" r="1"/>
            <circle cx="13" cy="13" r="1"/>
          </g>
        </svg>
      </button>
    </li>
  );
}

export default function SectionReorder({
  sectionOrder,
  setSectionOrder,
  sectionLabels,
  locked = false,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
    setSectionOrder(newOrder);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-5 text-center text-gray-800 tracking-tight">
        📄 Customize Section Order
      </h3>

      {locked ? (
        <div className="text-center text-gray-400 py-8">
          <span className="inline-flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span className="font-medium">Available for Premium users only</span>
          </span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {sectionOrder.map((key) => (
                <SortableItem key={key} id={key} label={sectionLabels[key] || key} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}