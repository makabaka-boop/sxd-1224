import { X, CheckCircle2, Clock, Wrench, XCircle, Loader2, AlertOctagon } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { STATUS_OPTIONS, UNPACK_STATUS_OPTIONS } from '../utils/constants';
import type { BoxStatus, UnpackStatus } from '../types';
import { cn } from '../lib/utils';

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  needsReinforcement: Wrench,
  postponed: XCircle,
};

const unpackStatusIcons = {
  toUnpack: Clock,
  unpacking: Loader2,
  completed: CheckCircle2,
  abnormal: AlertOctagon,
};

export const BatchActionBar = () => {
  const { selectedBoxIds, clearSelection, batchUpdateStatus, batchUpdateUnpackStatus, getFilteredBoxes, selectAll } =
    useBoxStore();
  const filteredBoxes = getFilteredBoxes();
  const selectedCount = selectedBoxIds.size;

  if (selectedCount === 0) return null;

  const handleBatchUpdate = (status: BoxStatus) => {
    batchUpdateStatus([...selectedBoxIds], status);
    clearSelection();
  };

  const handleBatchUpdateUnpack = (unpackStatus: UnpackStatus) => {
    batchUpdateUnpackStatus([...selectedBoxIds], unpackStatus);
    clearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 animate-slide-in max-w-[calc(100vw-2rem)]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-xl flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-700 whitespace-nowrap">
            已选择 {selectedCount} 项
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">确认状态:</span>
          {STATUS_OPTIONS.map((status) => {
            const Icon = statusIcons[status.value];
            return (
              <button
                key={status.value}
                onClick={() => handleBatchUpdate(status.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-medium text-xs',
                  status.bgColor,
                  status.color,
                  'hover:shadow-md hover:scale-105'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {status.label}
              </button>
            );
          })}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">开箱状态:</span>
          {UNPACK_STATUS_OPTIONS.map((status) => {
            const Icon = unpackStatusIcons[status.value];
            return (
              <button
                key={status.value}
                onClick={() => handleBatchUpdateUnpack(status.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-medium text-xs border',
                  status.bgColor,
                  status.color,
                  status.borderColor,
                  'hover:shadow-md hover:scale-105'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', status.value === 'unpacking' && 'animate-spin')} />
                {status.label}
              </button>
            );
          })}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

        <button
          onClick={() => {
            if (selectedCount === filteredBoxes.length) {
              clearSelection();
            } else {
              selectAll();
            }
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
        >
          {selectedCount === filteredBoxes.length ? '取消全选' : '全选当前'}
        </button>

        <button
          onClick={clearSelection}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
