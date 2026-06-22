import { create } from 'zustand';
import type { Box, BoxStatus, FilterOptions, UnpackProgressSummary, UnpackStatus, ValidationWarning, WeightLevel } from '../types';
import {
  getAllBoxes,
  addBox as addBoxToDB,
  updateBox as updateBoxInDB,
  deleteBox as deleteBoxFromDB,
  updateBoxesBatch,
  bulkAddBoxes,
  clearAllBoxes,
} from '../hooks/useIndexedDB';
import { validateBoxes, getUnpackProgressSummaries } from '../utils/validation';
import { ROOMS } from '../utils/constants';

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
  swapLoadingOrder: (activeId: string, overId: string) => Promise<void>;
  batchUpdateStatus: (ids: string[], status: BoxStatus) => Promise<void>;
  batchUpdateUnpackStatus: (ids: string[], unpackStatus: UnpackStatus) => Promise<void>;
  isBoxNumberDuplicate: (boxNumber: string, excludeId?: string) => boolean;
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
  getUnpackProgress: (roomFilter?: string | null, statusFilter?: UnpackStatus | null, abnormalFilter?: boolean | null) => UnpackProgressSummary[];
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxes: [],
  filters: {
    targetRoom: null,
    weightLevel: null,
    priorityLevel: null,
    status: null,
    isFragile: null,
    unpackStatus: null,
    isAbnormal: null,
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
    const finalUpdates = { ...updates };
    if (updates.unpackStatus === 'completed' && !updates.unpackCompletedAt) {
      finalUpdates.unpackCompletedAt = new Date();
    } else if (updates.unpackStatus && updates.unpackStatus !== 'completed') {
      finalUpdates.unpackCompletedAt = null;
    }
    const updatedBox = await updateBoxInDB(id, finalUpdates);
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
      unpackStatus: 'toUnpack' as UnpackStatus,
      actualPlacement: '',
      unpackCompletedAt: null,
      abnormalNote: '',
    };

    await get().addBox(newBoxData);
  },

  swapLoadingOrder: async (activeId: string, overId: string) => {
    const allBoxes = get().boxes;
    const activeBox = allBoxes.find((b) => b.id === activeId);
    const overBox = allBoxes.find((b) => b.id === overId);

    if (!activeBox || !overBox) return;

    const activeOrder = activeBox.loadingOrder;
    const overOrder = overBox.loadingOrder;

    const updates = [
      { id: activeId, changes: { loadingOrder: overOrder } },
      { id: overId, changes: { loadingOrder: activeOrder } },
    ];
    await updateBoxesBatch(updates);

    set((state) => {
      const updatedBoxes = state.boxes.map((box) => {
        if (box.id === activeId) {
          return { ...box, loadingOrder: overOrder, updatedAt: new Date() };
        }
        if (box.id === overId) {
          return { ...box, loadingOrder: activeOrder, updatedAt: new Date() };
        }
        return box;
      });
      return { boxes: updatedBoxes };
    });
    get().runValidation();
  },

  isBoxNumberDuplicate: (boxNumber: string, excludeId?: string): boolean => {
    const allBoxes = get().boxes;
    return allBoxes.some(
      (b) => b.boxNumber === boxNumber.trim() && b.id !== excludeId
    );
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

  batchUpdateUnpackStatus: async (ids, unpackStatus) => {
    const updates = ids.map((id) => {
      const changes: Partial<Box> = { unpackStatus };
      if (unpackStatus === 'completed') {
        changes.unpackCompletedAt = new Date();
      } else {
        changes.unpackCompletedAt = null;
      }
      return { id, changes };
    });
    await updateBoxesBatch(updates);

    set((state) => ({
      boxes: state.boxes.map((box) => {
        if (ids.includes(box.id)) {
          const changes: Partial<Box> = { unpackStatus, updatedAt: new Date() };
          if (unpackStatus === 'completed') {
            changes.unpackCompletedAt = new Date();
          } else {
            changes.unpackCompletedAt = null;
          }
          return { ...box, ...changes };
        }
        return box;
      }),
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
        unpackStatus: null,
        isAbnormal: null,
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
    if (filters.unpackStatus) {
      filtered = filtered.filter((b) => b.unpackStatus === filters.unpackStatus);
    }
    if (filters.isAbnormal !== null) {
      filtered = filtered.filter((b) => (b.unpackStatus === 'abnormal') === filters.isAbnormal);
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

  getUnpackProgress: (roomFilter?: string | null, statusFilter?: UnpackStatus | null, abnormalFilter?: boolean | null) => {
    const { boxes } = get();

    const rooms = roomFilter ? [roomFilter] : ROOMS;

    return rooms
      .map((room) => {
        const roomBoxes = boxes.filter((b) => b.targetRoom === room);
        const originalTotal = roomBoxes.length;

        const filteredBoxes = roomBoxes.filter((b) => {
          if (statusFilter && b.unpackStatus !== statusFilter) return false;
          if (abnormalFilter === true && b.unpackStatus !== 'abnormal') return false;
          if (abnormalFilter === false && b.unpackStatus === 'abnormal') return false;
          return true;
        });

        const data = {
          total: filteredBoxes.length,
          toUnpack: filteredBoxes.filter((b) => b.unpackStatus === 'toUnpack').length,
          unpacking: filteredBoxes.filter((b) => b.unpackStatus === 'unpacking').length,
          completed: filteredBoxes.filter((b) => b.unpackStatus === 'completed').length,
          abnormal: filteredBoxes.filter((b) => b.unpackStatus === 'abnormal').length,
        };

        const rate = data.total > 0
          ? Math.round((data.completed / data.total) * 100)
          : 0;

        return {
          room,
          totalCount: data.total,
          toUnpackCount: data.toUnpack,
          unpackingCount: data.unpacking,
          completedCount: data.completed,
          abnormalCount: data.abnormal,
          completionRate: rate,
          _hasOriginalData: originalTotal > 0,
        };
      })
      .filter((s) => s.totalCount > 0 || s._hasOriginalData)
      .map(({ _hasOriginalData, ...rest }) => rest);
  },
}));
