export type Result = {
  created: Array<{ row: number; userName: string; role: string , email:string , empCode:string, joiningDate:Date }>;
  skipped: Array<{
    row: number;
    userName?: string;
    role?: string;
    reason: string;
  }>;
  errors: Array<{ row: number; error: string }>;
};

export interface NormalizedFile {
    filename: string;
    mimetype: string;
    sizeBytes: number;
    toBuffer: () => Promise<Buffer>;
}

export interface ParsedMultipart {
    body: Record<string, string | undefined>;
    files: Record<string, NormalizedFile[]>;
}