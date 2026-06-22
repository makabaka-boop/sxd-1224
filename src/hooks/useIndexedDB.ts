import { openDB, IDBPDatabase } from 'idb';
import type { Box, UnpackStatus } from '../types';
import { DB_NAME, DB_VERSION, STORE_NAME } from '../utils/constants';

let dbPromise: Promise<IDBPDatabase> | null = null;

const migrateBoxData = (box: any): Box => {
  return {
    ...box,
    unpackStatus: (box.unpackStatus as UnpackStatus) || 'toUnpack',
    actualPlacement: box.actualPlacement || '',
    unpackCompletedAt: box.unpackCompletedAt ? new Date(box.unpackCompletedAt) : null,
    abnormalNote: box.abnormalNote || '',
  };
};

export const initDB = async (): Promise<IDBPDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        store.createIndex('boxNumber', 'boxNumber', { unique: true });
        store.createIndex('targetRoom', 'targetRoom');
        store.createIndex('loadingOrder', 'loadingOrder');
        store.createIndex('status', 'status');
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('unpackStatus', 'unpackStatus');
      } else if (oldVersion < 2) {
        store = transaction.objectStore(STORE_NAME);
        if (store && !store.indexNames.contains('unpackStatus')) {
          store.createIndex('unpackStatus', 'unpackStatus');
        }
      }
    },
  });

  return dbPromise;
};

export const getAllBoxes = async (): Promise<Box[]> => {
  const db = await initDB();
  const boxes = await db.getAll(STORE_NAME);
  return boxes.map((box) => migrateBoxData(box));
};

export const getBoxById = async (id: string): Promise<Box | undefined> => {
  const db = await initDB();
  const box = await db.get(STORE_NAME, id);
  return box ? migrateBoxData(box) : undefined;
};

export const addBox = async (box: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>): Promise<Box> => {
  const db = await initDB();
  const now = new Date();
  const newBox: Box = {
    ...migrateBoxData(box),
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
    ...migrateBoxData(existingBox),
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
        ...migrateBoxData(existingBox),
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
      ...migrateBoxData(box),
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
