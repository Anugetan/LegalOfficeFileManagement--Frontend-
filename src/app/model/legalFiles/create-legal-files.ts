export interface CreateLegalFile {

  caseNo: string;
  dateReceived: string;
  timeReceived: string;
  dateCompleted?: string | null;
  statusId?: number | null;
  spmsTypeId?: number | null;
  requestingOfficeId?: number | null;
  documentTypeId?: number | null;
  documentFormatId?: number | null;
  contactDetails?: string;
  currentStage: string;
}