import { create } from 'zustand';
import type { Box, BoxStatus, FilterOptions, ValidationWarning, WeightLevel } from '../types';
import {
  getAllBoxes,
  addBox as addBoxToDB,
  updateBox as updateBoxInDB,
  deleteBox as deleteBoxFromDB,
  updateBoxesBatch,
  bulkAddBoxes,
  clearAllBoxes,
} from '../hooks/useIndexedDB';
import { validateBoxes } from '../utils/validation';

interface BoxStore {
  boxes: Box[];
  filters: FilterOptions;
  selectedBoxIds: Set<string>;
  validationWarnings: ValidationWarning[];
  isLoading: boolean;
  sortBy: 'loadingOrder' | 'priorityLevel' | 'updatedAt';
  sortOrder: 'asc' | 'desc';

  loadBoxes: () => Promise<void>;
  addBox: (box: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBox: (id: string, updates: Partial<Box>) => Promise<void>;
  deleteBox: (id: string) => Promise<void>;
  duplicateBox: (id: string) => Promise<void>;
  updateLoadingOrder: (boxIds: string[]) => Promise<void>;
  batchUpdateStatus: (ids: string[], status: BoxStatus) => Promise<void>;
  importBoxes: (boxes: Omit<Box, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  clearAll: () => Promise<void>;

  setFilter: (key: keyof FilterOptions, value: any) => void;
  clearFilters: () => void;

  toggleBoxSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  setSortBy: (sortBy: 'loadingOrder' | 'priorityLevel' | 'updatedAt') => void;
  toggleSortOrder: () => void;

  runValidation: () => void;
  getFilteredBoxes: () => Box[];
  getNextLoadingOrder: () => number;
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxes: [],
  filters: {
    targetRoom: null,
    weightLevel: null,
    priorityLevel: null,
    status: null,
    isFragile: null,
  },
  selectedBoxIds: new Set(),
  validationWarnings: [],
  isLoading: true,
  sortBy: 'loadingOrder',
  sortOrder: 'asc',

  loadBoxes: async () => {
    set({ isLoading: true });
    try {
      const boxes = await getAllBoxes();
      set({ boxes, isLoading: false });
      get().runValidation();
    } catch (error) {
      console.error('Failed to load boxes:', error);
      set({ isLoading: false });
    }
  },

  addBox: async (boxData) => {
    const newBox = await addBoxToDB(boxData);
    set((state) => ({ boxes: [...state.boxes, newBox] }));
    get().runValidation();
  },

  updateBox: async (id, updates) => {
    const updatedBox = await updateBoxInDB(id, updates);
    if (updatedBox) {
      set((state) => ({
        boxes: state.boxes.map((box) => (box.id === id ? updatedBox : box)),
      }));
      get().runValidation();
    }
  },

  deleteBox: async (id) => {
    await deleteBoxFromDB(id);
    set((state) => ({
      boxes: state.boxes.filter((box) => box.id !== id),
      selectedBoxIds: new Set([...state.selectedBoxIds].filter((bid) => bid !== id)),
    }));
    get().runValidation();
  },

  duplicateBox: async (id) => {
    const box = get().boxes.find((b) => b.id === id);
    if (!box) return;

    const newBoxData = {
      boxNumber: `${box.boxNumber}_副本`,
      targetRoom: box.targetRoom,
      contentSummary: box.contentSummary,
      weightLevel: box.weightLevel,
      isFragile: box.isFragile,
      fragileNote: box.fragileNote,
      priorityLevel: box.priorityLevel,
      loadingOrder: get().getNextLoadingOrder(),
      status: 'pending' as BoxStatus,
      notes: box.notes,
    };

    await get().addBox(newBoxData);
  },

  updateLoadingOrder: async (boxIds) => {
    const updates = boxIds.map((id, index) => ({
      id,
      changes: { loadingOrder: index + 1 },
    }));
    await updateBoxesBatch(updates);

    set((state) => {
      const updatedBoxes = [...state.boxes];
      boxIds.forEach((id, index) => {
        const boxIndex = updatedBoxes.findIndex((b) => b.id === id);
        if (boxIndex !== -1) {
          updatedBoxes[boxIndex] = {
            ...updatedBoxes[boxIndex],
            loadingOrder: index + 1,
            updatedAt: new Date(),
          };
        }
      });
      return { boxes: updatedBoxes };
    });
    get().runValidation();
  },

  batchUpdateStatus: async (ids, status) => {
    const updates = ids.map((id) => ({ id, changes: { status } }));
    await updateBoxesBatch(updates);

    set((state) => ({
      boxes: state.boxes.map((box) =>
        ids.includes(box.id) ? { ...box, status, updatedAt: new Date() } : box
      ),
    }));
    get().runValidation();
  },

  importBoxes: async (boxesData) => {
    const newBoxes = await bulkAddBoxes(boxesData);
    set((state) => ({ boxes: [...state.boxes, ...newBoxes] }));
    get().runValidation();
  },

  clearAll: async () => {
    await clearAllBoxes();
    set({ boxes: [], selectedBoxIds: new Set(), validationWarnings: [] });
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        targetRoom: null,
        weightLevel: null,
        priorityLevel: null,
        status: null,
        isFragile: null,
      },
    });
  },

  toggleBoxSelection: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedBoxIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedBoxIds: newSelection };
    });
  },

  selectAll: () => {
    const filteredBoxes = get().getFilteredBoxes();
    set({ selectedBoxIds: new Set(filteredBoxes.map((b) => b.id)) });
  },

  clearSelection: () => {
    set({ selectedBoxIds: new Set() });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  toggleSortOrder: () => {
    set((state) => ({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' }));
  },

  runValidation: () => {
    const warnings = validateBoxes(get().boxes);
    set({ validationWarnings: warnings });
  },

  getFilteredBoxes: () => {
    const { boxes, filters, sortBy, sortOrder } = get();
    let filtered = [...boxes];

    if (filters.targetRoom) {
      filtered = filtered.filter((b) => b.targetRoom === filters.targetRoom);
    }
    if (filters.weightLevel) {
      filtered = filtered.filter((b) => b.weightLevel === filters.weightLevel);
    }
    if (filters.priorityLevel !== null) {
      filtered = filtered.filter((b) => b.priorityLevel === filters.priorityLevel);
    }
    if (filters.status) {
      filtered = filtered.filter((b) => b.status === filters.status);
    }
    if (filters.isFragile !== null) {
      filtered = filtered.filter((b) => b.isFragile === filters.isFragile);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'loadingOrder':
          comparison = a.loadingOrder - b.loadingOrder;
          break;
        case 'priorityLevel':
          comparison = b.priorityLevel - a.priorityLevel;
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  },

  getNextLoadingOrder: () => {
    const boxes = get().boxes;
    if (boxes.length === 0) return 1;
    return Math.max(...boxes.map((b) => b.loadingOrder)) + 1;
  },
}));
