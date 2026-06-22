import { useState } from 'react';
import {
  Package,
  Edit2,
  Trash2,
  Copy,
  GripVertical,
  AlertTriangle,
  Star,
  Scale,
  MapPin,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Box } from '../types';
import { useBoxStore } from '../hooks/useBoxStore';
import { STATUS_OPTIONS, WEIGHT_LEVELS } from '../utils/constants';
import { cn } from '../lib/utils';

interface BoxCardProps {
  box: Box;
  onEdit: () => void;
  isSelected: boolean;
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  needsReinforcement: Wrench,
  postponed: XCircle,
};

const weightColors = {
  light: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  heavy: 'bg-red-100 text-red-700',
};

export const BoxCard = ({ box, onEdit, isSelected }: BoxCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleBoxSelection, deleteBox, duplicateBox, validationWarnings } = useBoxStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: box.id,
    disabled: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === box.status)!;
  const weightConfig = WEIGHT_LEVELS.find((w) => w.value === box.weightLevel)!;
  const StatusIcon = statusIcons[box.status];

  const hasWarning = validationWarnings.some((w) => w.affectedBoxIds.includes(box.id));
  const needsAttention =
    (box.isFragile && !box.fragileNote) || !box.notes || box.notes.trim() === '';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除箱号 "${box.boxNumber}" 吗？`)) {
      deleteBox(box.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBox(box.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBoxSelection(box.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-white rounded-xl shadow-md p-4 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'border-2',
        isSelected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-transparent',
        hasWarning && 'animate-shake'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button
          onClick={handleSelect}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300 hover:border-amber-400'
          )}
        >
          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-amber-500 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-bold">
              <Package className="w-4 h-4" />
              <span className="text-sm">{box.boxNumber}</span>
            </div>

            <div className={`px-2 py-1 rounded-md text-xs font-medium ${weightColors[box.weightLevel]}`}>
              <Scale className="w-3 h-3 inline mr-1" />
              {weightConfig.label}
            </div>

            {box.isFragile && (
              <div className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                易碎
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{box.targetRoom}</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs">装车顺序: #{box.loadingOrder}</span>
          </div>

          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{box.contentSummary}</p>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <Star
                  key={level}
                  className={cn(
                    'w-4 h-4',
                    level <= box.priorityLevel
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">优先级 {box.priorityLevel}</span>
          </div>

          {box.fragileNote && (
            <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-2">
              ⚠️ {box.fragileNote}
            </p>
          )}

          {box.notes && box.notes.trim() && (
            <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mb-2 line-clamp-2">
              📝 {box.notes}
            </p>
          )}

          {needsAttention && (
            <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-2">
              ⚡ {!box.fragileNote && box.isFragile ? '缺少易碎提醒' : '备注不完整'}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </div>

            <div className={cn('flex items-center gap-1 transition-opacity', isHovered ? 'opacity-100' : 'opacity-0')}>
              <button
                onClick={handleDuplicate}
                className="p-1.5 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                title="复制箱子"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
