export interface ProofOfService {

  id: number;

  fileId: number;

  caseNo: string;

  status: string;

  proofFilePath: string | null;

  submittedBy: number | null;

  submittedByName: string | null;

  submittedAt: string | null;

  remarks: string | null;
}


export interface CreateProofOfService {

  fileId: number;

  status: string;

  proofFilePath?: string | null;

  remarks?: string | null;
}