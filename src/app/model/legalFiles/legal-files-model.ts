import { FileUploadResponse } from "../file-upload/file-upload";

export interface LegalFile {
  id: number;
  caseNo: string;

  dateReceived: string;
  timeReceived: string | null;
  dateCompleted: string | null;

  statusId: number | null;
  statusName: string | null;

  spmsTypeId: number | null;
  spmsTypeName: string | null;

  requestingOfficeId: number | null;
  requestingOfficeName: string | null;

  documentTypeId: number | null;
  documentTypeName: string | null;

  documentFormatId: number | null;
  documentFormatName: string | null;

  contactDetails: string | null;

  currentStage: string;

  createdById: number | null;
  createdAt: string;
  updatedAt: string;

  documents?: FileUploadResponse[];
}

export interface Status {
  id: number;
  statusName: string;
  active: boolean;
}

export interface SpmsType {
  id: number;
  spmsName: string;
  active: boolean;
}

export interface Office {
  id: number;
  officeCode: string;
  officeName: string;
  active: boolean;
}

export interface DocumentType {
  id: number;
  documentName: string;
  active: boolean;
}

export interface DocumentFormat {
  id: number;
  formatName: string;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
}