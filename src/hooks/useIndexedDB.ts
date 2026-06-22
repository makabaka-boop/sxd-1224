import { openDB, IDBPDatabase } from 'idb';
import type { Box } from '../types';
import { DB_NAME, DB_VERSION, STORE_NAME } from '../utils/constants';

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async (): Promise<IDBPDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        store.createIndex('boxNumber', 'boxNumber', { unique: true });
        store.createIndex('targetRoom', 'targetRoom');
        store.createIndex('loadingOrder', 'loadingOrder');
        store.createIndex('status', 'status');
        store.createIndex('updatedAt', 'updatedAt');
      }
    },
  });

  return dbPromise;
};

export const getAllBoxes = async (): Promise<Box[]> => {
  const db = await initDB();
  const boxes = await db.getAll(STORE_NAME);
  return boxes as Box[];
};

export const getBoxById = async (id: string): Promise<Box | undefined> => {
  const db = await initDB();
  const box = await db.get(STORE_NAME, id);
  return box as Box | undefined;
};

export const addBox = async (box: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>): Promise<Box> => {
  const db = await initDB();
  const now = new Date();
  const newBox: Box = {
    ...box,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await db.add(STORE_NAME, newBox);
  return newBox;
};

export const updateBox = async (id: string, updates: Partial<Box>): Promise<Box | undefined> => {
  const db = await initDB();
  const existingBox = await db.get(STORE_NAME, id);
  if (!existingBox) return undefined;

  const updatedBox: Box = {
    ...existingBox,
    ...updates,
    updatedAt: new Date(),
  };
  await db.put(STORE_NAME, updatedBox);
  return updatedBox as Box;
};

export const deleteBox = async (id: string): Promise<boolean> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
  return true;
};

export const updateBoxesBatch = async (
  updates: { id: string; changes: Partial<Box> }[]
): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const now = new Date();

  for (const { id, changes } of updates) {
    const existingBox = await tx.store.get(id);
    if (existingBox) {
      await tx.store.put({
        ...existingBox,
        ...changes,
        updatedAt: now,
      });
    }
  }

  await tx.done;
};

export const bulkAddBoxes = async (boxes: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Box[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const now = new Date();
  const newBoxes: Box[] = [];

  for (const box of boxes) {
    const newBox: Box = {
      ...box,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await tx.store.add(newBox);
    newBoxes.push(newBox);
  }

  await tx.done;
  return newBoxes;
};

export const clearAllBoxes = async (): Promise<void> => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
