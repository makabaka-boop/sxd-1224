import { X, CheckCircle2, Clock, Wrench, XCircle } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { STATUS_OPTIONS } from '../utils/constants';
import type { BoxStatus } from '../types';
import { cn } from '../lib/utils';

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  needsReinforcement: Wrench,
  postponed: XCircle,
};

export const BatchActionBar = () => {
  const { selectedBoxIds, clearSelection, batchUpdateStatus, getFilteredBoxes, selectAll } =
    useBoxStore();
  const filteredBoxes = getFilteredBoxes();
  const selectedCount = selectedBoxIds.size;

  if (selectedCount === 0) return null;

  const handleBatchUpdate = (status: BoxStatus) => {
    batchUpdateStatus([...selectedBoxIds], status);
    clearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 animate-slide-in">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-700">
            已选择 {selectedCount} 项
          </span>
        </div>

        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((status) => {
            const Icon = statusIcons[status.value];
            return (
              <button
                key={status.value}
                onClick={() => handleBatchUpdate(status.value)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-medium text-sm',
                  status.bgColor,
                  status.color,
                  'hover:shadow-md hover:scale-105'
                )}
              >
                <Icon className="w-4 h-4" />
                标记为{status.label}
              </button>
            );
          })}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <button
          onClick={() => {
            if (selectedCount === filteredBoxes.length) {
              clearSelection();
            } else {
              selectAll();
            }
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {selectedCount === filteredBoxes.length ? '取消全选' : '全选当前'}
        </button>

        <button
          onClick={clearSelection}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
