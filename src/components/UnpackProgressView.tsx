import { useState } from 'react';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  AlertOctagon,
  TrendingUp,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { ROOMS, UNPACK_STATUS_OPTIONS } from '../utils/constants';
import type { UnpackProgressSummary, UnpackStatus } from '../types';
import { cn } from '../lib/utils';

const roomColors: Record<
  string,
  { bg: string; border: string; text: string; barBg: string; progressBg: string }
> = {
  卧室: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    barBg: 'bg-pink-200',
    progressBg: 'bg-pink-500',
  },
  客厅: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    barBg: 'bg-blue-200',
    progressBg: 'bg-blue-500',
  },
  厨房: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    barBg: 'bg-orange-200',
    progressBg: 'bg-orange-500',
  },
  卫生间: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    barBg: 'bg-cyan-200',
    progressBg: 'bg-cyan-500',
  },
  书房: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    barBg: 'bg-purple-200',
    progressBg: 'bg-purple-500',
  },
  储物间: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    barBg: 'bg-amber-200',
    progressBg: 'bg-amber-500',
  },
  其他: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    barBg: 'bg-gray-200',
    progressBg: 'bg-gray-500',
  },
};

const unpackStatusIcons = {
  toUnpack: Clock,
  unpacking: Loader2,
  completed: CheckCircle2,
  abnormal: AlertOctagon,
};

interface ProgressRoomCardProps {
  summary: UnpackProgressSummary;
  filterStatus: UnpackStatus | null;
  filterAbnormal: boolean | null;
}

const ProgressRoomCard = ({ summary, filterStatus, filterAbnormal }: ProgressRoomCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { boxes, updateBox, toggleBoxSelection, selectedBoxIds } = useBoxStore();

  const roomBoxes = boxes.filter((b) => {
    if (b.targetRoom !== summary.room) return false;
    if (filterStatus && b.unpackStatus !== filterStatus) return false;
    if (filterAbnormal === true && b.unpackStatus !== 'abnormal') return false;
    if (filterAbnormal === false && b.unpackStatus === 'abnormal') return false;
    return true;
  });
  const colors = roomColors[summary.room] || roomColors['其他'];

  const handleUnpackStatusChange = (boxId: string, status: UnpackStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    updateBox(boxId, { unpackStatus: status });
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg',
        colors.bg,
        colors.border
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className={cn('text-lg font-bold font-serif', colors.text)}>
              {summary.room}
            </h3>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Package className={cn('w-4 h-4', colors.text)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-800">{summary.totalCount}</span>
            {expanded ? (
              <ChevronDown className={cn('w-5 h-5', colors.text)} />
            ) : (
              <ChevronRight className={cn('w-5 h-5', colors.text)} />
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className={cn('w-4 h-4', colors.text)} />
              <span className="text-sm font-medium text-gray-600">完成率</span>
            </div>
            <span className={cn('text-sm font-bold', colors.text)}>
              {summary.completionRate}%
            </span>
          </div>
          <div className={cn('h-3 rounded-full overflow-hidden', colors.barBg)}>
            <div
              className={cn('h-full rounded-full transition-all duration-500', colors.progressBg)}
              style={{ width: `${summary.completionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-0.5">
              <Clock className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-gray-700">{summary.toUnpackCount}</div>
            <div className="text-xs text-gray-500">待开箱</div>
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
            <div className="text-lg font-bold text-blue-700">{summary.unpackingCount}</div>
            <div className="text-xs text-gray-500">处理中</div>
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-0.5">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-green-700">{summary.completedCount}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
              <AlertOctagon className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-red-700">{summary.abnormalCount}</div>
            <div className="text-xs text-gray-500">异常</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/50 px-5 pb-5">
          <div className="space-y-2 mt-4">
            {roomBoxes.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                该房间暂无箱子
              </p>
            ) : (
              roomBoxes.map((box) => {
                const unpackConfig = UNPACK_STATUS_OPTIONS.find(
                  (s) => s.value === box.unpackStatus
                )!;
                const UnpackIcon = unpackStatusIcons[box.unpackStatus];
                const isSelected = selectedBoxIds.has(box.id);

                return (
                  <div
                    key={box.id}
                    className={cn(
                      'bg-white rounded-xl p-3 border transition-all',
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-200'
                        : 'border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => toggleBoxSelection(box.id)}
                      >
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-bold">
                            {box.boxNumber}
                          </span>
                          <div className="relative group">
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
                                unpackConfig.bgColor,
                                unpackConfig.color,
                                unpackConfig.borderColor
                              )}
                            >
                              <UnpackIcon
                                className={cn(
                                  'w-3 h-3',
                                  box.unpackStatus === 'unpacking' && 'animate-spin'
                                )}
                              />
                              {unpackConfig.label}
                              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[110px] hidden group-hover:block">
                              {UNPACK_STATUS_OPTIONS.map((opt) => {
                                const Icon = unpackStatusIcons[opt.value];
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={(e) =>
                                      handleUnpackStatusChange(box.id, opt.value, e)
                                    }
                                    className={cn(
                                      'w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors text-left',
                                      box.unpackStatus === opt.value
                                        ? 'bg-gray-100'
                                        : 'hover:bg-gray-50',
                                      opt.color
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        'w-3 h-3',
                                        opt.value === 'unpacking' && 'animate-spin'
                                      )}
                                    />
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          {box.isFragile && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-xs font-medium">
                              易碎
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 truncate mb-1">
                          {box.contentSummary}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                          {box.actualPlacement && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              放置: {box.actualPlacement}
                            </span>
                          )}
                          {box.abnormalNote && (
                            <span className="flex items-center gap-1 text-red-500 max-w-full truncate">
                              <AlertOctagon className="w-3 h-3 flex-shrink-0" />
                              {box.abnormalNote}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UnpackProgressView = () => {
  const { boxes, getUnpackProgress } = useBoxStore();
  const [filterRoom, setFilterRoom] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<UnpackStatus | null>(null);
  const [filterAbnormal, setFilterAbnormal] = useState<boolean | null>(null);

  const progressData = getUnpackProgress(filterRoom, filterStatus, filterAbnormal);

  const totalStats = progressData.reduce(
    (acc, s) => {
      acc.total += s.totalCount;
      acc.toUnpack += s.toUnpackCount;
      acc.unpacking += s.unpackingCount;
      acc.completed += s.completedCount;
      acc.abnormal += s.abnormalCount;
      return acc;
    },
    { total: 0, toUnpack: 0, unpacking: 0, completed: 0, abnormal: 0 }
  );
  const overallRate =
    totalStats.total > 0
      ? Math.round((totalStats.completed / totalStats.total) * 100)
      : 0;

  const hasActiveFilters =
    filterRoom !== null || filterStatus !== null || filterAbnormal !== null;

  const clearAllFilters = () => {
    setFilterRoom(null);
    setFilterStatus(null);
    setFilterAbnormal(null);
  };

  if (boxes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">还没有箱子</h3>
        <p className="text-gray-500">返回全部清单视图添加箱子吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-100 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-serif flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              整体开箱进度
            </h2>
            <p className="text-gray-600 text-sm">
              共 {totalStats.total} 个箱子，已完成 {totalStats.completed} 个
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {overallRate}%
            </div>
            <div className="w-48 h-3 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">待开箱</span>
            </div>
            <div className="text-3xl font-bold text-gray-700">{totalStats.toUnpack}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">处理中</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">{totalStats.unpacking}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">已完成</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{totalStats.completed}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertOctagon className="w-4 h-4" />
              <span className="text-sm font-medium">异常</span>
            </div>
            <div className="text-3xl font-bold text-red-700">{totalStats.abnormal}</div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-green-700">
            <Filter className="w-5 h-5" />
            <span className="font-medium">进度筛选</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterRoom || ''}
              onChange={(e) => setFilterRoom(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-green-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">所有房间</option>
              {ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>

            <select
              value={filterStatus || ''}
              onChange={(e) =>
                setFilterStatus((e.target.value as UnpackStatus) || null)
              }
              className="px-3 py-2 rounded-lg border border-green-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">所有开箱状态</option>
              {UNPACK_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={filterAbnormal === null ? '' : String(filterAbnormal)}
              onChange={(e) => {
                const val = e.target.value;
                setFilterAbnormal(val === '' ? null : val === 'true');
              }}
              className="px-3 py-2 rounded-lg border border-green-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">是否异常</option>
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium ml-auto"
            >
              <X className="w-4 h-4" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 font-serif flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          按房间进度详情
          <span className="text-sm font-normal text-gray-500">
            ({progressData.length} 个房间)
          </span>
        </h2>

        {progressData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">当前筛选条件下没有数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {progressData.map((summary) => (
              <ProgressRoomCard
                key={summary.room}
                summary={summary}
                filterStatus={filterStatus}
                filterAbnormal={filterAbnormal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
