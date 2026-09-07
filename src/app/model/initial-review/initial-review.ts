export interface InitialReview {
  id: number;
  fileId: number;
  caseNo: string;
  reviewedBy: number | null;
  reviewerName: string | null;
  reviewStatus: string;
  reviewDate: string | null;
  remarks: string | null;
}

export interface InitialReviewRequest {
  fileId: number;
  reviewedBy: number;
  reviewStatus: string;
  remarks?: string | null;
}