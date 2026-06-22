import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import type { Box, BoxStatus, WeightLevel } from '../types';
import { useBoxStore } from '../hooks/useBoxStore';
import { ROOMS, WEIGHT_LEVELS, STATUS_OPTIONS, PRIORITY_LEVELS } from '../utils/constants';
import { cn } from '../lib/utils';

interface BoxFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBox?: Box | null;
}

export const BoxForm = ({ isOpen, onClose, editingBox }: BoxFormProps) => {
  const { addBox, updateBox, getNextLoadingOrder, isBoxNumberDuplicate } = useBoxStore();
  const [formData, setFormData] = useState({
    boxNumber: '',
    targetRoom: ROOMS[0],
    contentSummary: '',
    weightLevel: 'medium' as WeightLevel,
    isFragile: false,
    fragileNote: '',
    priorityLevel: 3 as 1 | 2 | 3 | 4 | 5,
    loadingOrder: 1,
    status: 'pending' as BoxStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingBox) {
      setFormData({
        boxNumber: editingBox.boxNumber,
        targetRoom: editingBox.targetRoom,
        contentSummary: editingBox.contentSummary,
        weightLevel: editingBox.weightLevel,
        isFragile: editingBox.isFragile,
        fragileNote: editingBox.fragileNote,
        priorityLevel: editingBox.priorityLevel,
        loadingOrder: editingBox.loadingOrder,
        status: editingBox.status,
        notes: editingBox.notes,
      });
    } else {
      setFormData({
        boxNumber: '',
        targetRoom: ROOMS[0],
        contentSummary: '',
        weightLevel: 'medium',
        isFragile: false,
        fragileNote: '',
        priorityLevel: 3,
        loadingOrder: getNextLoadingOrder(),
        status: 'pending',
        notes: '',
      });
    }
    setErrors({});
  }, [editingBox, isOpen, getNextLoadingOrder]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.boxNumber.trim()) {
      newErrors.boxNumber = '请输入箱号';
    } else if (isBoxNumberDuplicate(formData.boxNumber, editingBox?.id)) {
      newErrors.boxNumber = '箱号已存在，请使用其他箱号';
    }
    if (!formData.contentSummary.trim()) {
      newErrors.contentSummary = '请输入内容摘要';
    }
    if (formData.loadingOrder < 1) {
      newErrors.loadingOrder = '装车顺序必须大于 0';
    }
    if (formData.isFragile && !formData.fragileNote.trim()) {
      newErrors.fragileNote = '易碎物品请填写提醒说明';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingBox) {
        await updateBox(editingBox.id, formData);
      } else {
        await addBox(formData);
      }
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique')) {
        setErrors({ boxNumber: '箱号已存在，请使用其他箱号' });
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in scrollbar-thin">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 font-serif">
              {editingBox ? '编辑箱子' : '添加新箱子'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                箱号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.boxNumber}
                onChange={(e) => handleChange('boxNumber', e.target.value)}
                placeholder="例如: K-001"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all',
                  errors.boxNumber
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                )}
              />
              {errors.boxNumber && <p className="text-red-500 text-xs mt-1">{errors.boxNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标房间
              </label>
              <select
                value={formData.targetRoom}
                onChange={(e) => handleChange('targetRoom', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              >
                {ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容摘要 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contentSummary}
                onChange={(e) => handleChange('contentSummary', e.target.value)}
                placeholder="例如: 厨房餐具"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all',
                  errors.contentSummary
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                )}
              />
              {errors.contentSummary && (
                <p className="text-red-500 text-xs mt-1">{errors.contentSummary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                重量等级
              </label>
              <select
                value={formData.weightLevel}
                onChange={(e) => handleChange('weightLevel', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              >
                {WEIGHT_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} ({level.description})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                装车顺序
              </label>
              <input
                type="number"
                min="1"
                value={formData.loadingOrder}
                onChange={(e) => handleChange('loadingOrder', parseInt(e.target.value) || 1)}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all',
                  errors.loadingOrder
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                )}
              />
              {errors.loadingOrder && (
                <p className="text-red-500 text-xs mt-1">{errors.loadingOrder}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先打开程度
              </label>
              <select
                value={formData.priorityLevel}
                onChange={(e) =>
                  handleChange('priorityLevel', parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              >
                {PRIORITY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.value} - {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFragile}
                  onChange={(e) => handleChange('isFragile', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-sm font-medium text-gray-700">易碎物品</span>
              </label>
            </div>
          </div>

          {formData.isFragile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                易碎提醒 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fragileNote}
                onChange={(e) => handleChange('fragileNote', e.target.value)}
                placeholder="例如: 小心轻放，内含玻璃制品"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all',
                  errors.fragileNote
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
                )}
              />
              {errors.fragileNote && (
                <p className="text-red-500 text-xs mt-1">{errors.fragileNote}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="其他需要注意的事项..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {editingBox ? '保存修改' : '添加箱子'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
