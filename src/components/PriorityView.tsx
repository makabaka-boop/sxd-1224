import { useState } from 'react';
import { AlertTriangle, Wrench, Star, FileText, MapPin, Package, ChevronDown, Clock, CheckCircle2, Loader2, AlertOctagon } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { RoomSummaryCard } from './RoomSummaryCard';
import { getPriorityBoxes, getRoomSummaries } from '../utils/validation';
import { ROOMS, STATUS_OPTIONS, WEIGHT_LEVELS, UNPACK_STATUS_OPTIONS } from '../utils/constants';
import type { RoomSummary, UnpackStatus } from '../types';
import { cn } from '../lib/utils';

const unpackStatusIcons = {
  toUnpack: Clock,
  unpacking: Loader2,
  completed: CheckCircle2,
  abnormal: AlertOctagon,
};

export const PriorityView = () => {
  const { boxes, updateBox } = useBoxStore();
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const priorityBoxes = getPriorityBoxes(boxes);
  const roomSummaries = getRoomSummaries(priorityBoxes);

  const summaries: RoomSummary[] = ROOMS.map((room) => {
    const data = roomSummaries.get(room) || { total: 0, priority: 0, needsReinforcement: 0 };
    return {
      room,
      totalCount: data.total,
      priorityCount: data.priority,
      needsReinforcementCount: data.needsReinforcement,
    };
  }).filter((s) => s.totalCount > 0);

  priorityBoxes.sort((a, b) => {
    if (a.unpackStatus === 'abnormal' && b.unpackStatus !== 'abnormal') return -1;
    if (b.unpackStatus === 'abnormal' && a.unpackStatus !== 'abnormal') return 1;
    if (a.status === 'needsReinforcement' && b.status !== 'needsReinforcement') return -1;
    if (b.status === 'needsReinforcement' && a.status !== 'needsReinforcement') return 1;
    if (a.priorityLevel !== b.priorityLevel) return b.priorityLevel - a.priorityLevel;
    if (!a.notes && b.notes) return -1;
    if (a.notes && !b.notes) return 1;
    return 0;
  });

  const handleUnpackStatusChange = (boxId: string, status: UnpackStatus) => {
    updateBox(boxId, { unpackStatus: status });
    setDropdownOpenId(null);
  };

  if (boxes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">还没有箱子</h3>
        <p className="text-gray-500">返回全部清单视图添加箱子吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-600" />
          按房间汇总
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {summaries.map((summary) => (
            <RoomSummaryCard key={summary.room} summary={summary} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          到达后优先清单
          <span className="text-sm font-normal text-gray-500">
            ({priorityBoxes.length} 项需优先处理)
          </span>
        </h2>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    箱号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    房间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    内容
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    重量
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    确认状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    开箱状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    需关注原因
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {priorityBoxes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      🎉 太棒了！没有需要优先处理的箱子
                    </td>
                  </tr>
                ) : (
                  priorityBoxes.map((box) => {
                    const reasons = [];
                    if (box.priorityLevel >= 4) reasons.push('高优先级');
                    if (box.status === 'needsReinforcement') reasons.push('需加固');
                    if (!box.notes || box.notes.trim() === '') reasons.push('备注不完整');
                    if (box.isFragile && !box.fragileNote) reasons.push('易碎无提醒');
                    if (box.unpackStatus === 'abnormal') reasons.push('开箱异常');

                    const weightConfig = WEIGHT_LEVELS.find((w) => w.value === box.weightLevel)!;
                    const statusConfig = STATUS_OPTIONS.find((s) => s.value === box.status)!;
                    const unpackStatusConfig = UNPACK_STATUS_OPTIONS.find((s) => s.value === box.unpackStatus)!;
                    const UnpackIcon = unpackStatusIcons[box.unpackStatus];

                    return (
                      <tr
                        key={box.id}
                        className="hover:bg-amber-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-amber-700">{box.boxNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{box.targetRoom}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{box.contentSummary}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {weightConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-amber-600">{box.priorityLevel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setDropdownOpenId(dropdownOpenId === box.id ? null : box.id)}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors',
                                unpackStatusConfig.bgColor,
                                unpackStatusConfig.color,
                                unpackStatusConfig.borderColor,
                                'hover:shadow-sm'
                              )}
                            >
                              <UnpackIcon className={cn('w-3 h-3', box.unpackStatus === 'unpacking' && 'animate-spin')} />
                              {unpackStatusConfig.label}
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {dropdownOpenId === box.id && (
                              <div
                                className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 min-w-[120px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {UNPACK_STATUS_OPTIONS.map((opt) => {
                                  const Icon = unpackStatusIcons[opt.value];
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleUnpackStatusChange(box.id, opt.value)}
                                      className={cn(
                                        'w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors text-left',
                                        box.unpackStatus === opt.value ? 'bg-gray-100' : 'hover:bg-gray-50',
                                        opt.color
                                      )}
                                    >
                                      <Icon className={cn('w-3 h-3', opt.value === 'unpacking' && 'animate-spin')} />
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {reasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                  reason === '需加固'
                                    ? 'bg-red-100 text-red-700'
                                    : reason === '高优先级'
                                    ? 'bg-amber-100 text-amber-700'
                                    : reason === '备注不完整'
                                    ? 'bg-orange-100 text-orange-700'
                                    : reason === '开箱异常'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                )}
                              >
                                {reason === '需加固' && <Wrench className="w-3 h-3" />}
                                {reason === '高优先级' && <Star className="w-3 h-3" />}
                                {reason === '备注不完整' && <FileText className="w-3 h-3" />}
                                {reason === '开箱异常' && <AlertOctagon className="w-3 h-3" />}
                                {reason}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
