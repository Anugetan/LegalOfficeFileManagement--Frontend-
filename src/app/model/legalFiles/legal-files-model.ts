
export interface LegalFile {

  id: number;

  caseNo: string;

  dateReceived: string;

  timeReceived: string | null;

  dateCompleted: string | null;


  // =========================================
  // STATUS
  // =========================================

  statusId: number | null;

  statusName: string | null;


  // =========================================
  // SPMS TYPE
  // =========================================

  spmsTypeId: number | null;

  spmsTypeName: string | null;


  // =========================================
  // REQUESTING OFFICE
  // =========================================

  requestingOfficeId: number | null;

  requestingOfficeName: string | null;


  // =========================================
  // DOCUMENT TYPE
  // =========================================

  documentTypeId: number | null;

  documentTypeName: string | null;


  // =========================================
  // DOCUMENT FORMAT
  // =========================================

  documentFormatId: number | null;

  documentFormatName: string | null;


  // =========================================
  // OTHER DATA
  // =========================================

  contactDetails: string | null;

  currentStage: string;

  createdById: number | null;

  createdAt: string;

  updatedAt: string;
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

