import type { BoxStatus, WeightLevel } from '../types';

export const ROOMS: string[] = [
  '卧室',
  '客厅',
  '厨房',
  '卫生间',
  '书房',
  '储物间',
  '其他',
];

export const WEIGHT_LEVELS: { value: WeightLevel; label: string; description: string }[] = [
  { value: 'light', label: '轻量', description: '< 10kg' },
  { value: 'medium', label: '中量', description: '10-25kg' },
  { value: 'heavy', label: '重量', description: '> 25kg' },
];

export const STATUS_OPTIONS: { value: BoxStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'pending', label: '待整理', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'confirmed', label: '已确认', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'needsReinforcement', label: '需加固', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'postponed', label: '暂缓搬运', color: 'text-gray-700', bgColor: 'bg-gray-100' },
];

export const PRIORITY_LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: '最低' },
  { value: 2, label: '较低' },
  { value: 3, label: '普通' },
  { value: 4, label: '较高' },
  { value: 5, label: '最高' },
];

export const DB_NAME = 'moving-boxes-db';
export const DB_VERSION = 1;
export const STORE_NAME = 'boxes';

export const MAX_HEAVY_BOXES_PER_ROOM = 3;
export const MAX_HIGH_PRIORITY_RATIO = 0.2;
