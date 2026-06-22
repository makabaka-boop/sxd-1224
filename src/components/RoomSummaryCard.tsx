import { Package, AlertTriangle, Wrench } from 'lucide-react';
import type { RoomSummary } from '../types';

interface RoomSummaryCardProps {
  summary: RoomSummary;
}

const roomColors: Record<string, { bg: string; border: string; text: string }> = {
  卧室: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  客厅: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  厨房: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  卫生间: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  书房: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  储物间: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  其他: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
};

export const RoomSummaryCard = ({ summary }: RoomSummaryCardProps) => {
  const colors = roomColors[summary.room] || roomColors['其他'];

  return (
    <div
      className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg font-bold ${colors.text} font-serif`}>{summary.room}</h3>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Package className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>

      <div className="text-4xl font-bold text-gray-800 mb-4">{summary.totalCount}</div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span>需优先处理</span>
          </div>
          <span className="font-bold text-amber-600">{summary.priorityCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-red-600">
            <Wrench className="w-4 h-4" />
            <span>需加固</span>
          </div>
          <span className="font-bold text-red-600">{summary.needsReinforcementCount}</span>
        </div>
      </div>
    </div>
  );
};
