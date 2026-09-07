export interface CreateLegalFile {
  caseNo: string;
  dateReceived: string;
  timeReceived: string;

  spmsTypeId?: number | null;
  requestingOfficeId?: number | null;
  documentTypeId?: number | null;
  documentFormatId?: number | null;

  contactDetails?: string | null;
}