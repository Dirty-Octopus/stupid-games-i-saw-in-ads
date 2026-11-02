export interface RunRecord {
  schemaVersion: 1;
  runId: string;
  gameId: string;
  levelId: string;
  levelVersion: number;
  rulesVersion: string;
  outcome: 'won' | 'dead';
  applesCollected: number;
  score: number;
  actions: readonly string[];
}

export interface Progress {
  schemaVersion: 1;
  gameId: string;
  completedLevelIds: readonly string[];
}

export type ServiceResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'disabled' }
  | { status: 'error'; reason: 'unauthenticated' | 'network' | 'version' };

export interface GameServices {
  capabilities: { scores: boolean; leaderboard: boolean; progress: boolean };
  submitRun(record: RunRecord, signal?: AbortSignal): Promise<ServiceResult<null>>;
  getLeaderboard(gameId: string, levelId: string, cursor?: string, signal?: AbortSignal): Promise<ServiceResult<{ rows: RunRecord[]; nextCursor?: string }>>;
  loadProgress(gameId: string, signal?: AbortSignal): Promise<ServiceResult<Progress>>;
  saveProgress(progress: Progress, signal?: AbortSignal): Promise<ServiceResult<null>>;
}

// One composition seam for a future backend. This adapter does not persist or send.
export const noStorageServices: GameServices = {
  capabilities: { scores: false, leaderboard: false, progress: false },
  async submitRun() { return { status: 'disabled' }; },
  async getLeaderboard() { return { status: 'disabled' }; },
  async loadProgress() { return { status: 'disabled' }; },
  async saveProgress() { return { status: 'disabled' }; },
};
