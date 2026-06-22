import type { Box, UnpackStatus } from '../types';

const migrateImportedBox = (box: unknown): Box => {
  const b = box as Partial<Box> & Record<string, unknown>;
  return {
    id: b.id as string,
    boxNumber: b.boxNumber as string,
    targetRoom: b.targetRoom as string,
    contentSummary: b.contentSummary as string,
    weightLevel: b.weightLevel as Box['weightLevel'],
    isFragile: Boolean(b.isFragile),
    fragileNote: b.fragileNote || '',
    priorityLevel: b.priorityLevel as Box['priorityLevel'],
    loadingOrder: Number(b.loadingOrder) || 1,
    status: b.status as Box['status'],
    notes: b.notes || '',
    tags: b.tags || [],
    unpackStatus: (b.unpackStatus as Box['unpackStatus']) || 'toUnpack',
    actualPlacement: b.actualPlacement || '',
    unpackCompletedAt: b.unpackCompletedAt ? new Date(b.unpackCompletedAt as Date | string) : null,
    abnormalNote: b.abnormalNote || '',
    createdAt: new Date(b.createdAt as Date | string),
    updatedAt: new Date(b.updatedAt as Date | string),
  };
};

export const exportToJSON = (boxes: Box[], filename = 'moving-boxes.json'): void => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '3.0',
    totalBoxes: boxes.length,
    boxes: boxes.map((box) => ({
      ...box,
      unpackCompletedAt: box.unpackCompletedAt ? box.unpackCompletedAt.toISOString() : null,
      createdAt: box.createdAt.toISOString(),
      updatedAt: box.updatedAt.toISOString(),
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = async (file: File): Promise<Box[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as { boxes?: Array<Partial<Box> & Record<string, unknown>> };
        if (!data.boxes || !Array.isArray(data.boxes)) {
          reject(new Error('无效的文件格式'));
          return;
        }

        const boxes: Box[] = data.boxes.map((box) => migrateImportedBox(box));

        resolve(boxes);
      } catch {
        reject(new Error('JSON 解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};
