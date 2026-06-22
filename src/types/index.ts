export type BoxStatus = 'pending' | 'confirmed' | 'needsReinforcement' | 'postponed';

export type WeightLevel = 'light' | 'medium' | 'heavy';

export interface Box {
  id: string;
  boxNumber: string;
  targetRoom: string;
  contentSummary: string;
  weightLevel: WeightLevel;
  isFragile: boolean;
  fragileNote: string;
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  loadingOrder: number;
  status: BoxStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  targetRoom: string | null;
  weightLevel: WeightLevel | null;
  priorityLevel: number | null;
  status: BoxStatus | null;
  isFragile: boolean | null;
}

export interface ValidationWarning {
  type:
    | 'duplicateBoxNumber'
    | 'tooManyHeavyInRoom'
    | 'fragileWithoutNote'
    | 'duplicateLoadingOrder'
    | 'tooManyHighPriority';
  severity: 'error' | 'warning';
  message: string;
  affectedBoxIds: string[];
}

export interface RoomSummary {
  room: string;
  totalCount: number;
  priorityCount: number;
  needsReinforcementCount: number;
}
