export interface FinalDocument {
  id: number;
  fileId: number;
  caseNo: string;
  documentName: string;
  filePath: string | null;
  finalizedBy: number | null;
  finalizedByName: string | null;
  finalizedAt: string | null;
  remarks: string | null;
}

export interface CreateFinalDocument {
  fileId: number;
  documentName: string;
  filePath?: string | null;
  remarks?: string | null;
}