import { Filter, X, ArrowUpDown } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { ROOMS, WEIGHT_LEVELS, STATUS_OPTIONS, PRIORITY_LEVELS, UNPACK_STATUS_OPTIONS } from '../utils/constants';
import { cn } from '../lib/utils';
import type { BoxStatus, UnpackStatus, WeightLevel } from '../types';

export const FilterBar = () => {
  const { filters, setFilter, clearFilters, sortBy, sortOrder, setSortBy, toggleSortOrder } =
    useBoxStore();

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg border border-amber-100">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-amber-700">
          <Filter className="w-5 h-5" />
          <span className="font-medium">筛选</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.targetRoom || ''}
            onChange={(e) => setFilter('targetRoom', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">所有房间</option>
            {ROOMS.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>

          <select
            value={filters.weightLevel || ''}
            onChange={(e) => setFilter('weightLevel', (e.target.value as WeightLevel) || null)}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">所有重量</option>
            {WEIGHT_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          <select
            value={filters.priorityLevel || ''}
            onChange={(e) =>
              setFilter('priorityLevel', e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">所有优先级</option>
            {PRIORITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.value} - {level.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', (e.target.value as BoxStatus) || null)}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">所有确认状态</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={filters.unpackStatus || ''}
            onChange={(e) => setFilter('unpackStatus', (e.target.value as UnpackStatus) || null)}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">所有开箱状态</option>
            {UNPACK_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={filters.isFragile === null ? '' : String(filters.isFragile)}
            onChange={(e) => {
              const val = e.target.value;
              setFilter('isFragile', val === '' ? null : val === 'true');
            }}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">是否易碎</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>

          <select
            value={filters.isAbnormal === null ? '' : String(filters.isAbnormal)}
            onChange={(e) => {
              const val = e.target.value;
              setFilter('isAbnormal', val === '' ? null : val === 'true');
            }}
            className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="">是否异常</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 border-l border-amber-200 pl-3">
            <span className="text-sm text-gray-500 mr-2">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="loadingOrder">装车顺序</option>
              <option value="priorityLevel">优先级</option>
              <option value="updatedAt">更新时间</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className={cn(
                'p-2 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 transition-colors',
                sortOrder === 'desc' && 'text-amber-600'
              )}
            >
              <ArrowUpDown
                className={cn('w-4 h-4 transition-transform', sortOrder === 'desc' && 'rotate-180')}
              />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              清除筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
