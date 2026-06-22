import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BoxCard } from './BoxCard';
import { useBoxStore } from '../hooks/useBoxStore';
import type { Box } from '../types';

interface SortableBoxListProps {
  boxes: Box[];
  onEditBox: (box: Box) => void;
}

export const SortableBoxList = ({ boxes, onEditBox }: SortableBoxListProps) => {
  const { updateLoadingOrder, selectedBoxIds } = useBoxStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = boxes.findIndex((b) => b.id === active.id);
      const newIndex = boxes.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(boxes, oldIndex, newIndex);
        updateLoadingOrder(newOrder.map((b) => b.id));
      }
    }
  };

  if (boxes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">还没有箱子</h3>
        <p className="text-gray-500">点击右上角"添加箱子"按钮开始整理吧！</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={boxes.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boxes.map((box) => (
            <BoxCard
              key={box.id}
              box={box}
              onEdit={() => onEditBox(box)}
              isSelected={selectedBoxIds.has(box.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
