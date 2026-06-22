import type { Box, ValidationWarning } from '../types';
import { MAX_HEAVY_BOXES_PER_ROOM, MAX_HIGH_PRIORITY_RATIO } from './constants';

export const validateBoxes = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];

  warnings.push(...checkDuplicateBoxNumbers(boxes));
  warnings.push(...checkDuplicateLoadingOrders(boxes));
  warnings.push(...checkTooManyHeavyInRoom(boxes));
  warnings.push(...checkFragileWithoutNote(boxes));
  warnings.push(...checkTooManyHighPriority(boxes));

  return warnings;
};

const checkDuplicateBoxNumbers = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const boxNumberMap = new Map<string, string[]>();

  boxes.forEach((box) => {
    if (!boxNumberMap.has(box.boxNumber)) {
      boxNumberMap.set(box.boxNumber, []);
    }
    boxNumberMap.get(box.boxNumber)!.push(box.id);
  });

  boxNumberMap.forEach((ids, boxNumber) => {
    if (ids.length > 1) {
      warnings.push({
        type: 'duplicateBoxNumber',
        severity: 'error',
        message: `箱号 "${boxNumber}" 重复，涉及 ${ids.length} 个箱子`,
        affectedBoxIds: ids,
      });
    }
  });

  return warnings;
};

const checkDuplicateLoadingOrders = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const orderMap = new Map<number, string[]>();

  boxes.forEach((box) => {
    if (box.loadingOrder > 0) {
      if (!orderMap.has(box.loadingOrder)) {
        orderMap.set(box.loadingOrder, []);
      }
      orderMap.get(box.loadingOrder)!.push(box.id);
    }
  });

  orderMap.forEach((ids, order) => {
    if (ids.length > 1) {
      warnings.push({
        type: 'duplicateLoadingOrder',
        severity: 'error',
        message: `装车顺序 ${order} 重复，涉及 ${ids.length} 个箱子`,
        affectedBoxIds: ids,
      });
    }
  });

  return warnings;
};

const checkTooManyHeavyInRoom = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const roomHeavyCount = new Map<string, string[]>();

  boxes.forEach((box) => {
    if (box.weightLevel === 'heavy') {
      if (!roomHeavyCount.has(box.targetRoom)) {
        roomHeavyCount.set(box.targetRoom, []);
      }
      roomHeavyCount.get(box.targetRoom)!.push(box.id);
    }
  });

  roomHeavyCount.forEach((ids, room) => {
    if (ids.length > MAX_HEAVY_BOXES_PER_ROOM) {
      warnings.push({
        type: 'tooManyHeavyInRoom',
        severity: 'warning',
        message: `${room} 的重箱（>25kg）有 ${ids.length} 个，建议分散到其他房间或减轻重量`,
        affectedBoxIds: ids,
      });
    }
  });

  return warnings;
};

const checkFragileWithoutNote = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const affectedIds: string[] = [];

  boxes.forEach((box) => {
    if (box.isFragile && (!box.fragileNote || box.fragileNote.trim() === '')) {
      affectedIds.push(box.id);
    }
  });

  if (affectedIds.length > 0) {
    warnings.push({
      type: 'fragileWithoutNote',
      severity: 'warning',
      message: `${affectedIds.length} 个易碎箱子缺少易碎提醒说明`,
      affectedBoxIds: affectedIds,
    });
  }

  return warnings;
};

const checkTooManyHighPriority = (boxes: Box[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];
  const highPriorityIds = boxes.filter((box) => box.priorityLevel === 5).map((box) => box.id);
  const maxAllowed = Math.ceil(boxes.length * MAX_HIGH_PRIORITY_RATIO);

  if (highPriorityIds.length > maxAllowed && boxes.length > 0) {
    warnings.push({
      type: 'tooManyHighPriority',
      severity: 'warning',
      message: `最高优先级箱子有 ${highPriorityIds.length} 个，超过总数的 20%（建议不超过 ${maxAllowed} 个）`,
      affectedBoxIds: highPriorityIds,
    });
  }

  return warnings;
};

export const getPriorityBoxes = (boxes: Box[]): Box[] => {
  return boxes.filter(
    (box) =>
      box.priorityLevel >= 4 ||
      box.status === 'needsReinforcement' ||
      !box.notes ||
      box.notes.trim() === ''
  );
};

export const getRoomSummaries = (boxes: Box[]): Map<string, { total: number; priority: number; needsReinforcement: number }> => {
  const summaries = new Map<string, { total: number; priority: number; needsReinforcement: number }>();

  boxes.forEach((box) => {
    const existing = summaries.get(box.targetRoom) || { total: 0, priority: 0, needsReinforcement: 0 };
    existing.total += 1;
    if (box.priorityLevel >= 4 || !box.notes || box.notes.trim() === '') {
      existing.priority += 1;
    }
    if (box.status === 'needsReinforcement') {
      existing.needsReinforcement += 1;
    }
    summaries.set(box.targetRoom, existing);
  });

  return summaries;
};
