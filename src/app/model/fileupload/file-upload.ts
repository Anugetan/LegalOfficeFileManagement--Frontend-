export interface FileUploadResponse {
  id: number;
  fileId: number;
  documentName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isFinal: boolean;
  uploadedBy: string;
  uploadedAt: string;
}