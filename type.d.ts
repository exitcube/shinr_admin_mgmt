export type Result = {
  created: Array<{ row: number; userName: string; role: string }>;
  skipped: Array<{
    row: number;
    userName?: string;
    role?: string;
    reason: string;
  }>;
  errors: Array<{ row: number; error: string }>;
};