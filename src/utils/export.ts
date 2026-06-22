import type { Box } from '../types';

export const exportToJSON = (boxes: Box[], filename = 'moving-boxes.json'): void => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalBoxes: boxes.length,
    boxes: boxes.map((box) => ({
      ...box,
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
        const data = JSON.parse(e.target?.result as string);
        if (!data.boxes || !Array.isArray(data.boxes)) {
          reject(new Error('无效的文件格式'));
          return;
        }

        const boxes: Box[] = data.boxes.map((box: any) => ({
          ...box,
          createdAt: new Date(box.createdAt),
          updatedAt: new Date(box.updatedAt),
        }));

        resolve(boxes);
      } catch (error) {
        reject(new Error('JSON 解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};
