import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule
} from '@angular/forms';

import {
  LegalFile,
  Status,
  SpmsType,
  Office,
  DocumentType,
  DocumentFormat
} from '../../model/legalFiles/legal-files-model';

import { CreateLegalFile } from '../../model/legalFiles/create-legal-files';

import { FileDocumentService } from '../../service/FileDocumentService';

import {
  FileAction
} from '../../model/file-action/file-action';

import {
  FileUploadResponse
} from '../../model/file-upload/file-upload';

import {
  CreateFileReview,
  FileReview
} from '../../model/final-review/final-review';

import {
  FileReviewService
} from '../../service/FileReviewService';

import {
  InitialReview,
  InitialReviewRequest
} from '../../model/initial-review/initial-review';

import { InitialReviewService } from '../../service/InitialReviewService ';

import {
  CreateFinalDocument,
  FinalDocument
} from '../../model/final-document/final-document';

import {
  FinalDocumentService
} from '../../service/FinalDocumentService';

import {
  LegalFileServiceTs
} from '../../service/legal-file.service';


@Component({
  selector: 'app-legal-files',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],

  templateUrl: './legal-files.html',

  styleUrl: './legal-files.css'
})
export class LegalFiles implements OnInit {


  // =====================================================
  // TABLE DATA
  // =====================================================

  legalFiles: LegalFile[] = [];

  selectedDocumentFile: File | null = null;

  uploadStatus:
    'idle' |
    'uploading' |
    'success' |
    'error' = 'idle';

  uploadStatusMessage = '';

  selectedLegalFile: LegalFile | null = null;

  fileActions: FileAction[] = [];

  showActivityModal = false;

  loadingFileActions = false;


  // =====================================================
  // REVIEW
  // =====================================================

  selectedReviewFile: LegalFile | null = null;

  initialReviews: InitialReview[] = [];

  fileReviews: FileReview[] = [];

  showReviewModal = false;

  loadingReviews = false;

  savingReview = false;

  reviewType: 'INITIAL' | 'FINAL' = 'INITIAL';

  reviewForm = {
    reviewStatus: 'PENDING',
    remarks: ''
  };


  // =====================================================
  // FINAL DOCUMENT
  // =====================================================

  selectedFinalDocumentFile: LegalFile | null = null;

  finalDocuments: FinalDocument[] = [];

  showFinalDocumentModal = false;

  loadingFinalDocuments = false;

  savingFinalDocument = false;

  finalDocumentForm: CreateFinalDocument = {
    fileId: 0,
    documentName: '',
    filePath: '',
    remarks: ''
  };


  // =====================================================
  // SELECTED ROW
  // =====================================================

  selectedRowId: number | null = null;


  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  successMessage = '';

  showSuccessNotification = false;

  errorMessage = '';

  showErrorNotification = false;


  // =====================================================
  // SELECTED FILES
  // =====================================================

  selectedFiles = new Set<number>();

  allSelected = false;


  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  statuses: Status[] = [];

  spmsTypes: SpmsType[] = [];

  offices: Office[] = [];

  documentTypes: DocumentType[] = [];

  documentFormats: DocumentFormat[] = [];


  // =====================================================
  // CREATE FORM VISIBILITY
  // =====================================================

  showForm = false;


  // =====================================================
  // REPLACE DOCUMENT MODAL
  // =====================================================

  showReplaceModal = false;

  selectedReplaceDocument:
    FileUploadResponse | null = null;

  selectedReplaceFile:
    File | null = null;


  // =====================================================
  // FORM
  // =====================================================

  legalFileForm!:
    ReturnType<FormBuilder['group']>;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private fb: FormBuilder,

    private legalFileServiceTs:
      LegalFileServiceTs,

    private fileDocumentService:
      FileDocumentService,

    private finalDocumentService:
      FinalDocumentService,

    private fileReviewService:
      FileReviewService,

    private initialReviewService:
      InitialReviewService,

    private cdr:
      ChangeDetectorRef

  ) {

    this.legalFileForm =
      this.fb.group({

        caseNo: [
          '',
          Validators.required
        ],

        dateReceived: [
          '',
          Validators.required
        ],

        timeReceived: [
          '',
          Validators.required
        ],

        spmsTypeId: [
          null as number | null
        ],

        requestingOfficeId: [
          null as number | null
        ],

        documentTypeId: [
          null as number | null
        ],

        documentFormatId: [
          null as number | null
        ],

        contactDetails: [
          ''
        ]

      });

  }


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadLegalFiles();

    this.loadStatuses();

    this.loadSpmsTypes();

    this.loadOffices();

    this.loadDocumentTypes();

    this.loadDocumentFormats();

  }


  // =====================================================
  // SELECT ROW
  // =====================================================

  selectRow(fileId: number): void {

    if (
      this.selectedRowId === fileId
    ) {

      this.selectedRowId = null;

    } else {

      this.selectedRowId = fileId;

    }

    this.cdr.detectChanges();

  }


  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  getStatusClass(
    statusId: number | null
  ): string {

    if (
      statusId === null ||
      statusId === undefined
    ) {

      return 'status-select';

    }

    const status =
      this.statuses.find(
        item =>
          item.id === statusId
      );

    if (!status) {

      return 'status-select';

    }

    const statusName =
      (status.statusName ?? '')
        .trim()
        .toLowerCase();

    switch (statusName) {

      case 'pending':
        return 'status-select status-pending';

      case 'out':
        return 'status-select status-out';

      case 'archived':
        return 'status-select status-archived';

      case 'resolved':
        return 'status-select status-resolved';

      case 'cancelled':
        return 'status-select status-cancelled';

      default:
        return 'status-select';

    }

  }


  // =====================================================
  // STAGE CSS CLASS
  // =====================================================

  getStageClass(
    stage: string | null | undefined
  ): string {

    const currentStage =
      (stage ?? '')
        .trim()
        .toUpperCase();

    switch (currentStage) {

      case 'RECEIVED':
        return 'stage-received';

      case 'INITIAL_REVIEW':
        return 'stage-initial-review';

      case 'FINAL_REVIEW':
        return 'stage-final-review';

      case 'RESOLVED':
        return 'stage-resolved';

      case 'OUT':
        return 'stage-out';

      default:
        return 'stage-default';

    }

  }


  // =====================================================
  // WORKFLOW LABEL
  // =====================================================

  getWorkflowAction(
    file: LegalFile
  ): string {

    const stage =
      (file.currentStage ?? '')
        .trim()
        .toUpperCase();

    switch (stage) {

      case 'RECEIVED':
        return 'Initial Review';

      case 'INITIAL_REVIEW':
        return 'Initial Review';

      case 'FINAL_REVIEW':
        return 'Final Review';

      case 'RESOLVED':
        return 'Resolved';

      case 'OUT':
        return 'Out';

      default:
        return 'View';

    }

  }


  // =====================================================
  // INITIAL REVIEW AVAILABLE
  // =====================================================

  isInitialReviewAvailable(
    file: LegalFile
  ): boolean {

    const stage =
      (file.currentStage ?? '')
        .trim()
        .toUpperCase();

    return (
      stage === 'RECEIVED' ||
      stage === 'INITIAL_REVIEW'
    );

  }


  // =====================================================
  // FINAL REVIEW AVAILABLE
  // =====================================================

  isFinalReviewAvailable(
    file: LegalFile
  ): boolean {

    const stage =
      (file.currentStage ?? '')
        .trim()
        .toUpperCase();

    return stage === 'FINAL_REVIEW';

  }


  // =====================================================
  // REVIEW AVAILABLE
  // =====================================================

  isReviewAvailable(
    file: LegalFile
  ): boolean {

    return (
      this.isInitialReviewAvailable(file) ||
      this.isFinalReviewAvailable(file)
    );

  }


  // =====================================================
  // SORT LEGAL FILES
  // =====================================================

  sortLegalFiles(
    files: LegalFile[]
  ): LegalFile[] {

    const priority:
      Record<string, number> = {

      received: 1,

      initial_review: 2,

      final_review: 3,

      resolved: 4,

      out: 5

    };

    return [...files].sort(
      (a, b) => {

        const stageA =
          (a.currentStage ?? '')
            .trim()
            .toLowerCase();

        const stageB =
          (b.currentStage ?? '')
            .trim()
            .toLowerCase();

        const priorityA =
          priority[stageA] ?? 99;

        const priorityB =
          priority[stageB] ?? 99;

        return priorityA - priorityB;

      }
    );

  }


  // =====================================================
  // CHECKBOX
  // =====================================================

  isSelected(
    id: number
  ): boolean {

    return this.selectedFiles.has(id);

  }


  toggleSelection(
    id: number,
    event: Event
  ): void {

    const checkbox =
      event.target as HTMLInputElement;

    if (checkbox.checked) {

      this.selectedFiles.add(id);

    } else {

      this.selectedFiles.delete(id);

    }

    this.updateAllSelected();

    this.cdr.detectChanges();

  }


  toggleSelectAll(
    event: Event
  ): void {

    const checkbox =
      event.target as HTMLInputElement;

    if (checkbox.checked) {

      this.legalFiles.forEach(
        file => {

          this.selectedFiles.add(
            file.id
          );

        }
      );

    } else {

      this.selectedFiles.clear();

    }

    this.allSelected =
      checkbox.checked;

    this.cdr.detectChanges();

  }


  updateAllSelected(): void {

    if (
      this.legalFiles.length === 0
    ) {

      this.allSelected = false;

      return;

    }

    this.allSelected =
      this.legalFiles.every(
        file =>
          this.selectedFiles.has(
            file.id
          )
      );

  }


  // =====================================================
  // DOCUMENT SELECTION
  // =====================================================

  onDocumentFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedDocumentFile = null;

      this.uploadStatus = 'idle';

      this.uploadStatusMessage = '';

      return;

    }

    this.selectedDocumentFile =
      input.files[0];

    this.uploadStatus = 'idle';

    this.uploadStatusMessage = '';

    this.cdr.detectChanges();

  }


  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  uploadDocument(
    legalFileId: number
  ): void {

    if (!this.selectedDocumentFile) {
      return;
    }

    const fileToUpload =
      this.selectedDocumentFile;

    const documentFormatId =
      this.legalFileForm
        .get('documentFormatId')
        ?.value;

    this.uploadStatus = 'uploading';

    this.uploadStatusMessage =
      'Uploading file...';

    this.fileDocumentService
      .uploadFile(
        legalFileId,
        fileToUpload,
        documentFormatId
      )
      .subscribe({

        next: (
          response: FileUploadResponse
        ) => {

          console.log(
            'FILE UPLOADED:',
            response
          );

          this.uploadStatus = 'success';

          this.uploadStatusMessage =
            'File uploaded successfully ✓';

          this.selectedDocumentFile = null;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'FILE UPLOAD ERROR:',
            error
          );

          this.uploadStatus = 'error';

          this.uploadStatusMessage =
            'File upload failed. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD LEGAL FILES
  // =====================================================

  loadLegalFiles(): void {

    this.legalFileServiceTs
      .getAllLegalFiles()
      .subscribe({

        next: (
          data: LegalFile[]
        ) => {

          this.legalFiles =
            this.sortLegalFiles(data);

          const existingIds =
            new Set(
              data.map(
                file => file.id
              )
            );

          this.selectedFiles =
            new Set(
              [...this.selectedFiles]
                .filter(
                  id =>
                    existingIds.has(id)
                )
            );

          this.updateAllSelected();


          // -----------------------------------------------
          // LOAD DOCUMENTS
          // -----------------------------------------------

          this.legalFiles.forEach(
            file => {

              this.fileDocumentService
                .getDocumentsByFileId(
                  file.id
                )
                .subscribe({

                  next: (
                    documents:
                      FileUploadResponse[]
                  ) => {

                    file.documents =
                      documents;

                    this.cdr.detectChanges();

                  },

                  error: (
                    error: unknown
                  ) => {

                    console.error(
                      'ERROR LOADING DOCUMENTS:',
                      error
                    );

                    file.documents = [];

                  }

                });

            }
          );

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING LEGAL FILES:',
            error
          );

          this.errorMessage =
            'Unable to load legal files.';

          this.showErrorNotification = true;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // ACTIVITY HISTORY
  // =====================================================

  openActivityHistory(
    file: LegalFile
  ): void {

    this.selectedLegalFile = file;

    this.fileActions = [];

    this.showActivityModal = true;

    this.loadFileActions(file.id);

    this.cdr.detectChanges();

  }


  loadFileActions(
    fileId: number
  ): void {

    this.loadingFileActions = true;

    this.legalFileServiceTs
      .getFileActions(fileId)
      .subscribe({

        next: (
          data: FileAction[]
        ) => {

          this.fileActions = data;

          this.loadingFileActions = false;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING FILE ACTIONS:',
            error
          );

          this.fileActions = [];

          this.loadingFileActions = false;

          this.cdr.detectChanges();

        }

      });

  }


  closeActivityHistory(): void {

    this.showActivityModal = false;

    this.selectedLegalFile = null;

    this.fileActions = [];

    this.cdr.detectChanges();

  }


  // =====================================================
  // REVIEW
  // =====================================================

  openReview(
    file: LegalFile
  ): void {

    if (!this.isReviewAvailable(file)) {
      return;
    }

    this.selectedReviewFile = file;

    this.initialReviews = [];

    this.fileReviews = [];

    this.reviewForm = {
      reviewStatus: 'PENDING',
      remarks: ''
    };


    if (
      this.isInitialReviewAvailable(file)
    ) {

      this.reviewType = 'INITIAL';

      this.loadInitialReviews(file.id);

    } else if (
      this.isFinalReviewAvailable(file)
    ) {

      this.reviewType = 'FINAL';

      this.loadFileReviews(file.id);

    }

    this.showReviewModal = true;

    this.cdr.detectChanges();

  }


  // =====================================================
  // LOAD INITIAL REVIEWS
  // =====================================================

  loadInitialReviews(
    fileId: number
  ): void {

    this.loadingReviews = true;

    this.initialReviewService
      .getReviewsByFile(fileId)
      .subscribe({

        next: (
          reviews: InitialReview[]
        ) => {

          this.initialReviews = reviews;

          this.loadingReviews = false;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING INITIAL REVIEWS:',
            error
          );

          this.initialReviews = [];

          this.loadingReviews = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD FINAL REVIEWS
  // =====================================================

  loadFileReviews(
    fileId: number
  ): void {

    this.loadingReviews = true;

    this.fileReviewService
      .getReviewsByFile(fileId)
      .subscribe({

        next: (
          reviews: FileReview[]
        ) => {

          this.fileReviews = reviews;

          this.loadingReviews = false;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING FINAL REVIEWS:',
            error
          );

          this.fileReviews = [];

          this.loadingReviews = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SAVE REVIEW
  // =====================================================

  saveReview(): void {

    if (!this.selectedReviewFile) {
      return;
    }

    if (this.reviewType === 'INITIAL') {

      this.saveInitialReview();

      return;

    }

    if (this.reviewType === 'FINAL') {

      this.saveFinalReview();

      return;

    }

  }


  // =====================================================
  // SAVE INITIAL REVIEW
  // =====================================================

  saveInitialReview(): void {

    if (!this.selectedReviewFile) {
      return;
    }

    const storedUserId =
      localStorage.getItem('userId');

    const userId =
      storedUserId
        ? Number(storedUserId)
        : null;

    if (
      userId === null ||
      Number.isNaN(userId) ||
      userId <= 0
    ) {

      this.showUserError();

      return;

    }

    const request:
      InitialReviewRequest = {

      fileId:
        this.selectedReviewFile.id,

      reviewedBy:
        userId,

      reviewStatus:
        this.reviewForm.reviewStatus,

      remarks:
        this.reviewForm.remarks?.trim() || ''

    };

    this.savingReview = true;

    this.initialReviewService
      .createReview(request)
      .subscribe({

        next: (
          review: InitialReview
        ) => {

          console.log(
            'INITIAL REVIEW CREATED:',
            review
          );

          this.savingReview = false;

          this.successMessage =
            'Initial review saved successfully.';

          this.showSuccessNotification = true;

          this.loadInitialReviews(
            this.selectedReviewFile!.id
          );

          this.loadLegalFiles();

          this.reviewForm = {
            reviewStatus: 'PENDING',
            remarks: ''
          };

          this.cdr.detectChanges();

          this.hideSuccessNotification();

        },

        error: (
          error: any
        ) => {

          console.error(
            'ERROR SAVING INITIAL REVIEW:',
            error
          );

          this.savingReview = false;

          this.showReviewError(
            error,
            'Failed to save initial review.'
          );

        }

      });

  }


  // =====================================================
  // SAVE FINAL REVIEW
  // =====================================================

  saveFinalReview(): void {

    if (!this.selectedReviewFile) {
      return;
    }

    const storedUserId =
      localStorage.getItem('userId');

    const userId =
      storedUserId
        ? Number(storedUserId)
        : null;

    if (
      userId === null ||
      Number.isNaN(userId) ||
      userId <= 0
    ) {

      this.showUserError();

      return;

    }

    const request:
      CreateFileReview = {

      fileId:
        this.selectedReviewFile.id,

      reviewedBy:
        userId,

      reviewType:
        'FINAL',

      reviewStatus:
        this.reviewForm.reviewStatus,

      remarks:
        this.reviewForm.remarks?.trim() || ''

    };

    this.savingReview = true;

    this.fileReviewService
      .createReview(request)
      .subscribe({

        next: (
          review: FileReview
        ) => {

          console.log(
            'FINAL REVIEW CREATED:',
            review
          );

          this.savingReview = false;

          this.successMessage =
            'Final review saved successfully.';

          this.showSuccessNotification = true;

          this.loadFileReviews(
            this.selectedReviewFile!.id
          );

          this.loadLegalFiles();

          this.reviewForm = {
            reviewStatus: 'PENDING',
            remarks: ''
          };

          this.cdr.detectChanges();

          this.hideSuccessNotification();

        },

        error: (
          error: any
        ) => {

          console.error(
            'ERROR SAVING FINAL REVIEW:',
            error
          );

          this.savingReview = false;

          this.showReviewError(
            error,
            'Failed to save final review.'
          );

        }

      });

  }


  // =====================================================
  // CLOSE REVIEW
  // =====================================================

  closeReviewModal(): void {

    this.showReviewModal = false;

    this.selectedReviewFile = null;

    this.initialReviews = [];

    this.fileReviews = [];

    this.reviewType = 'INITIAL';

    this.reviewForm = {
      reviewStatus: 'PENDING',
      remarks: ''
    };

    this.loadingReviews = false;

    this.savingReview = false;

    this.cdr.detectChanges();

  }


  // =====================================================
  // REVIEW ERRORS
  // =====================================================

  private showUserError(): void {

    this.errorMessage =
      'Unable to determine the current user. Please login again.';

    this.showErrorNotification = true;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.showErrorNotification = false;

      this.cdr.detectChanges();

    }, 5000);

  }


  private showReviewError(
    error: any,
    defaultMessage: string
  ): void {

    this.errorMessage =
      error?.error?.message ||
      error?.error ||
      defaultMessage;

    this.showErrorNotification = true;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.showErrorNotification = false;

      this.cdr.detectChanges();

    }, 5000);

  }


  private hideSuccessNotification(): void {

    setTimeout(() => {

      this.showSuccessNotification = false;

      this.cdr.detectChanges();

    }, 5000);

  }


  // =====================================================
  // ACTION USER
  // =====================================================

  getActionUser(
    action: FileAction
  ): string {

    if (action.performedByName) {

      return action.performedByName;

    }

    if (action.performedByUsername) {

      return action.performedByUsername;

    }

    if (
      action.performedBy !== null &&
      action.performedBy !== undefined
    ) {

      return `User #${action.performedBy}`;

    }

    return 'System';

  }


  // =====================================================
  // FORMAT ACTION DATE
  // =====================================================

  formatActionDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return 'N/A';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }

    return parsedDate.toLocaleString();

  }


  // =====================================================
  // LOAD STATUSES
  // =====================================================

  loadStatuses(): void {

    this.legalFileServiceTs
      .getStatuses()
      .subscribe({

        next: (
          data: Status[]
        ) => {

          this.statuses = data;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING STATUSES:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD SPMS TYPES
  // =====================================================

  loadSpmsTypes(): void {

    this.legalFileServiceTs
      .getSpmsTypes()
      .subscribe({

        next: (
          data: SpmsType[]
        ) => {

          this.spmsTypes = data;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING SPMS TYPES:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD OFFICES
  // =====================================================

  loadOffices(): void {

    this.legalFileServiceTs
      .getOffices()
      .subscribe({

        next: (
          data: Office[]
        ) => {

          this.offices = data;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING OFFICES:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD DOCUMENT TYPES
  // =====================================================

  loadDocumentTypes(): void {

    this.legalFileServiceTs
      .getDocumentTypes()
      .subscribe({

        next: (
          data: DocumentType[]
        ) => {

          this.documentTypes = data;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING DOCUMENT TYPES:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD DOCUMENT FORMATS
  // =====================================================

  loadDocumentFormats(): void {

    this.legalFileServiceTs
      .getDocumentFormats()
      .subscribe({

        next: (
          data: DocumentFormat[]
        ) => {

          this.documentFormats = data;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING DOCUMENT FORMATS:',
            error
          );

        }

      });

  }


  // =====================================================
  // LOAD DOCUMENTS
  // =====================================================

  loadDocumentsForLegalFile(
    legalFile: LegalFile
  ): void {

    this.fileDocumentService
      .getDocumentsByFileId(
        legalFile.id
      )
      .subscribe({

        next: (
          documents:
            FileUploadResponse[]
        ) => {

          legalFile.documents =
            documents;

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING DOCUMENTS:',
            error
          );

          legalFile.documents = [];

        }

      });

  }


  // =====================================================
  // DOWNLOAD DOCUMENT
  // =====================================================

  downloadDocument(
    document: FileUploadResponse
  ): void {

    this.fileDocumentService
      .downloadFile(
        document.id
      )
      .subscribe({

        next: (
          blob: Blob
        ) => {

          const url =
            window.URL.createObjectURL(
              blob
            );

          const link =
            window.document.createElement(
              'a'
            );

          link.href = url;

          link.download =
            document.documentName;

          link.click();

          window.URL.revokeObjectURL(url);

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR DOWNLOADING DOCUMENT:',
            error
          );

        }

      });

  }


  // =====================================================
  // CREATE LEGAL FILE FORM
  // =====================================================

  openCreateForm(): void {

    this.showForm = true;

    this.resetForm();

    this.uploadStatus = 'idle';

    this.uploadStatusMessage = '';

    this.cdr.detectChanges();

  }


  closeCreateForm(): void {

    this.showForm = false;

    this.resetForm();

    this.cdr.detectChanges();

  }


  resetForm(): void {

    this.legalFileForm.reset({

      caseNo: '',

      dateReceived: '',

      timeReceived: '',

      spmsTypeId: null,

      requestingOfficeId: null,

      documentTypeId: null,

      documentFormatId: null,

      contactDetails: ''

    });

    this.selectedDocumentFile = null;

    this.uploadStatus = 'idle';

    this.uploadStatusMessage = '';

  }


  // =====================================================
  // REPLACE DOCUMENT
  // =====================================================

  openReplaceDocument(
    document: FileUploadResponse
  ): void {

    this.selectedReplaceDocument =
      document;

    this.selectedReplaceFile = null;

    this.showReplaceModal = true;

    this.cdr.detectChanges();

  }


  closeReplaceModal(): void {

    this.showReplaceModal = false;

    this.selectedReplaceDocument = null;

    this.selectedReplaceFile = null;

    this.cdr.detectChanges();

  }


  onReplaceFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedReplaceFile = null;

      return;

    }

    this.selectedReplaceFile =
      input.files[0];

    this.cdr.detectChanges();

  }


  confirmReplaceDocument(): void {

    if (
      !this.selectedReplaceDocument ||
      !this.selectedReplaceFile
    ) {

      return;

    }

    const documentId =
      this.selectedReplaceDocument.id;

    const newFile =
      this.selectedReplaceFile;

    this.fileDocumentService
      .replaceFile(
        documentId,
        newFile
      )
      .subscribe({

        next: (
          response: FileUploadResponse
        ) => {

          console.log(
            'FILE REPLACED:',
            response
          );

          this.closeReplaceModal();

          this.loadLegalFiles();

          this.cdr.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR REPLACING FILE:',
            error
          );

        }

      });

  }


  replaceDocument(
    document: FileUploadResponse
  ): void {

    this.openReplaceDocument(document);

  }


  // =====================================================
  // DELETE SELECTED FILES
  // =====================================================

  deleteSelectedFiles(): void {

    if (
      this.selectedFiles.size === 0
    ) {

      console.log(
        'No legal files selected.'
      );

      return;

    }

    const selectedIds =
      Array.from(
        this.selectedFiles
      );

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected legal file(s)?`
      );

    if (!confirmed) {
      return;
    }

    let completedDeletes = 0;

    selectedIds.forEach(
      fileId => {

        this.legalFileServiceTs
          .deleteLegalFile(fileId)
          .subscribe({

            next: () => {

              completedDeletes++;

              this.selectedFiles.delete(
                fileId
              );

              this.legalFiles =
                this.legalFiles.filter(
                  file =>
                    file.id !== fileId
                );

              if (
                completedDeletes ===
                selectedIds.length
              ) {

                this.selectedFiles.clear();

                this.allSelected = false;

                this.selectedRowId = null;

                this.loadLegalFiles();

                this.cdr.detectChanges();

              }

            },

            error: (
              error: unknown
            ) => {

              console.error(
                `ERROR DELETING LEGAL FILE ${fileId}:`,
                error
              );

            }

          });

      }

    );

  }


  // =====================================================
  // FINAL DOCUMENT
  // =====================================================

  closeFinalDocument(): void {

    this.showFinalDocumentModal = false;

    this.selectedFinalDocumentFile = null;

    this.finalDocuments = [];

    this.finalDocumentForm = {

      fileId: 0,

      documentName: '',

      filePath: '',

      remarks: ''

    };

  }


  loadFinalDocuments(
    fileId: number
  ): void {

    this.loadingFinalDocuments = true;

    this.finalDocumentService
      .getByFileId(fileId)
      .subscribe({

        next: (
          documents
        ) => {

          this.finalDocuments =
            documents;

          this.loadingFinalDocuments = false;

          this.cdr.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Error loading final documents:',
            error
          );

          this.finalDocuments = [];

          this.loadingFinalDocuments = false;

          this.cdr.detectChanges();

        }

      });

  }


  openFinalDocument(
    file: LegalFile
  ): void {

    if (
      file.currentStage !== 'RESOLVED'
    ) {

      alert(
        'Final document can only be created after the file is resolved.'
      );

      return;

    }

    this.selectedFinalDocumentFile =
      file;

    this.finalDocumentForm = {

      fileId: file.id!,

      documentName: '',

      filePath: '',

      remarks: ''

    };

    this.finalDocuments = [];

    this.showFinalDocumentModal = true;

    this.loadFinalDocuments(
      file.id!
    );

  }


  saveFinalDocument(): void {

    if (
      !this.selectedFinalDocumentFile
    ) {

      alert(
        'No legal file selected.'
      );

      return;

    }

    if (
      !this.finalDocumentForm.documentName
        .trim()
    ) {

      alert(
        'Document name is required.'
      );

      return;

    }

    this.savingFinalDocument = true;

    const request:
      CreateFinalDocument = {

      fileId:
        this.selectedFinalDocumentFile.id!,

      documentName:
        this.finalDocumentForm.documentName
          .trim(),

      filePath:
        this.finalDocumentForm.filePath?.trim()
          || null,

      remarks:
        this.finalDocumentForm.remarks?.trim()
          || null

    };

    this.finalDocumentService
      .createFinalDocument(request)
      .subscribe({

        next: (
          document
        ) => {

          console.log(
            'Final document created:',
            document
          );

          this.savingFinalDocument = false;

          this.loadFinalDocuments(
            this.selectedFinalDocumentFile!.id!
          );

          this.finalDocumentForm = {

            fileId:
              this.selectedFinalDocumentFile!.id!,

            documentName: '',

            filePath: '',

            remarks: ''

          };

          this.successMessage =
            'Final document saved successfully.';

          this.showSuccessNotification = true;

          this.cdr.detectChanges();

          this.hideSuccessNotification();

        },

        error: (
          error
        ) => {

          console.error(
            'Error saving final document:',
            error
          );

          this.savingFinalDocument = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to save final document.';

          this.showErrorNotification = true;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CREATE LEGAL FILE
  // =====================================================

  saveLegalFile(): void {

    if (
      this.legalFileForm.invalid
    ) {

      this.legalFileForm.markAllAsTouched();

      return;

    }

    const formValue =
      this.legalFileForm.getRawValue();

    const legalFile:
      CreateLegalFile = {

      caseNo:
        formValue.caseNo!,

      dateReceived:
        formValue.dateReceived!,

      timeReceived:
        formValue.timeReceived || '',

      spmsTypeId:
        formValue.spmsTypeId,

      requestingOfficeId:
        formValue.requestingOfficeId,

      documentTypeId:
        formValue.documentTypeId,

      documentFormatId:
        formValue.documentFormatId,

      contactDetails:
        formValue.contactDetails || ''

    };

    const fileToUpload =
      this.selectedDocumentFile;

    const documentFormatId =
      formValue.documentFormatId;

    this.showSuccessNotification = false;

    this.showErrorNotification = false;

    this.successMessage = '';

    this.errorMessage = '';

    this.uploadStatus = 'idle';

    this.uploadStatusMessage = '';

    this.legalFileServiceTs
      .createLegalFile(legalFile)
      .subscribe({

        next: (
          data: LegalFile
        ) => {

          console.log(
            'LEGAL FILE CREATED:',
            data
          );

          if (
            fileToUpload &&
            data.id
          ) {

            this.uploadStatus = 'uploading';

            this.uploadStatusMessage =
              'Uploading document...';

            this.fileDocumentService
              .uploadFile(
                data.id,
                fileToUpload,
                documentFormatId
              )
              .subscribe({

                next: (
                  response: FileUploadResponse
                ) => {

                  console.log(
                    'FILE UPLOADED:',
                    response
                  );

                  this.uploadStatus = 'success';

                  this.uploadStatusMessage =
                    'Document uploaded successfully ✓';

                  this.showForm = false;

                  this.resetForm();

                  this.loadLegalFiles();

                  this.successMessage =
                    `Legal file ${data.caseNo} and document were saved successfully.`;

                  this.showSuccessNotification = true;

                  this.cdr.detectChanges();

                  this.hideSuccessNotification();

                },

                error: (
                  error: unknown
                ) => {

                  console.error(
                    'FILE UPLOAD ERROR:',
                    error
                  );

                  this.uploadStatus = 'error';

                  this.uploadStatusMessage =
                    'File upload failed. Please try again.';

                  this.errorMessage =
                    `Legal file ${data.caseNo} was created, but the document upload failed.`;

                  this.showErrorNotification = true;

                  this.cdr.detectChanges();

                }

              });

            return;

          }


          // -----------------------------------------------
          // CREATED WITHOUT DOCUMENT
          // -----------------------------------------------

          this.showForm = false;

          this.resetForm();

          this.loadLegalFiles();

          this.successMessage =
            `Legal file ${data.caseNo} was saved successfully.`;

          this.showSuccessNotification = true;

          this.cdr.detectChanges();

          this.hideSuccessNotification();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR CREATING LEGAL FILE:',
            error
          );

          this.errorMessage =
            error &&
            typeof error === 'object' &&
            'error' in error
              ? (error as any).error?.message ||
                'Unable to save the legal file. Please try again.'
              : 'Unable to save the legal file. Please try again.';

          this.showErrorNotification = true;

          this.cdr.detectChanges();

          setTimeout(() => {

            this.showErrorNotification = false;

            this.cdr.detectChanges();

          }, 5000);

        }

      });

  }

}