export type BoxStatus = 'pending' | 'confirmed' | 'needsReinforcement' | 'postponed';

export type UnpackStatus = 'toUnpack' | 'unpacking' | 'completed' | 'abnormal';

export type WeightLevel = 'light' | 'medium' | 'heavy';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

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
  tags: string[];
  unpackStatus: UnpackStatus;
  actualPlacement: string;
  unpackCompletedAt: Date | null;
  abnormalNote: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  targetRoom: string | null;
  weightLevel: WeightLevel | null;
  priorityLevel: number | null;
  status: BoxStatus | null;
  isFragile: boolean | null;
  unpackStatus: UnpackStatus | null;
  isAbnormal: boolean | null;
  tags: string[] | null;
}

export interface ValidationWarning {
  type:
    | 'duplicateBoxNumber'
    | 'tooManyHeavyInRoom'
    | 'fragileWithoutNote'
    | 'duplicateLoadingOrder'
    | 'tooManyHighPriority'
    | 'abnormalWithoutNote'
    | 'highPriorityOrAbnormalWithoutTags';
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

export interface UnpackProgressSummary {
  room: string;
  totalCount: number;
  toUnpackCount: number;
  unpackingCount: number;
  completedCount: number;
  abnormalCount: number;
  completionRate: number;
}
