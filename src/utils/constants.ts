import type { BoxStatus, UnpackStatus, WeightLevel } from '../types';

export const ROOMS: string[] = [
  '卧室',
  '客厅',
  '厨房',
  '卫生间',
  '书房',
  '储物间',
  '其他',
];

export const PRESET_TAGS: { id: string; name: string; color: string }[] = [
  { id: 'urgent', name: '急用', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'clean', name: '清洁', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'documents', name: '文件', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'kids', name: '儿童用品', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'kitchen', name: '厨房用品', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'bedroom', name: '卧室用品', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'livingroom', name: '客厅用品', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'bathroom', name: '卫浴用品', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'electronics', name: '电器', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'fragile', name: '易碎', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'heavy', name: '重物', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'seasonal', name: '换季物品', color: 'bg-green-100 text-green-700 border-green-200' },
];

export const TAG_COLORS: string[] = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-amber-100 text-amber-700 border-amber-200',
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

export const UNPACK_STATUS_OPTIONS: { value: UnpackStatus; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { value: 'toUnpack', label: '待开箱', color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
  { value: 'unpacking', label: '处理中', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  { value: 'completed', label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  { value: 'abnormal', label: '异常', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
];

export const PRIORITY_LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: '最低' },
  { value: 2, label: '较低' },
  { value: 3, label: '普通' },
  { value: 4, label: '较高' },
  { value: 5, label: '最高' },
];

export const DB_NAME = 'moving-boxes-db';
export const DB_VERSION = 3;
export const STORE_NAME = 'boxes';

export const MAX_HEAVY_BOXES_PER_ROOM = 3;
export const MAX_HIGH_PRIORITY_RATIO = 0.2;
