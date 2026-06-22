import { useState, useRef, useEffect } from 'react';
import { Filter, X, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { ROOMS, WEIGHT_LEVELS, STATUS_OPTIONS, PRIORITY_LEVELS, UNPACK_STATUS_OPTIONS } from '../utils/constants';
import { cn } from '../lib/utils';
import type { BoxStatus, UnpackStatus, WeightLevel } from '../types';
import { TagBadge } from './TagBadge';

export const FilterBar = () => {
  const { filters, setFilter, clearFilters, sortBy, sortOrder, setSortBy, toggleSortOrder, boxes } =
    useBoxStore();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  const allTagsInUse = Array.from(
    new Set(boxes.flatMap((box) => box.tags || []))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTagFilter = (tag: string) => {
    const currentTags = filters.tags || [];
    let newTags: string[] | null;

    if (currentTags.includes(tag)) {
      newTags = currentTags.filter((t) => t !== tag);
      if (newTags.length === 0) {
        newTags = null;
      }
    } else {
      newTags = [...currentTags, tag];
    }

    setFilter('tags', newTags);
  };

  const clearTagFilters = () => {
    setFilter('tags', null);
  };

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

          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 transition-colors',
                filters.tags && filters.tags.length > 0
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-amber-200'
              )}
            >
              <span className={filters.tags && filters.tags.length > 0 ? 'text-amber-700' : 'text-gray-500'}>
                标签
              </span>
              {filters.tags && filters.tags.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">
                  {filters.tags.length}
                </span>
              )}
              <ChevronDown className={cn('w-4 h-4 transition-transform', showTagDropdown && 'rotate-180')} />
            </button>

            {showTagDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-30 min-w-[240px] max-h-[320px] overflow-y-auto">
                <div className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span>按标签筛选</span>
                  {filters.tags && filters.tags.length > 0 && (
                    <button
                      onClick={clearTagFilters}
                      className="text-amber-600 hover:text-amber-700 font-normal normal-case"
                    >
                      清除
                    </button>
                  )}
                </div>
                <div className="border-t border-gray-100 my-1" />
                {allTagsInUse.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    暂无可用标签
                  </div>
                ) : (
                  <div className="px-2 py-1">
                    {allTagsInUse.map((tag) => {
                      const isSelected = filters.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTagFilter(tag)}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left mb-1',
                            isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <TagBadge tagName={tag} />
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 border-l border-amber-200 pl-3">
            <span className="text-sm text-gray-500 mr-2">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'loadingOrder' | 'priorityLevel' | 'updatedAt')}
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
