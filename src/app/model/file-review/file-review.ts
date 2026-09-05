export interface FileReview {
  id: number;

  fileId: number;

  caseNo: string;

  reviewedBy: number;

  reviewerName: string;

  reviewType: string;

  reviewStatus: string;

  remarks: string;

  reviewedAt: string;
}


export interface CreateFileReview {
  fileId: number;

  reviewedBy: number;

  reviewType: string;

  reviewStatus: string;

  remarks: string;
}