import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ProofOfService as ProofOfServiceModel,
  CreateProofOfService
} from '../../model/proof-of-service/proof-of-service';

import {
  LegalFile
} from '../../model/legalFiles/legal-files-model';

import {
  FinalDocument
} from '../../model/final-document/final-document';

import {
  FinalDocumentService
} from '../../service/FinalDocumentService';

import {
  LegalFileServiceTs
} from '../../service/legal-file.service';

import {
  ProofOfServiceService
} from '../../service/proof-of-service';


@Component({
  selector: 'app-proof-of-service',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './proof-of-service.html',
  styleUrls: ['./proof-of-service.css']
})
export class ProofOfServiceComponent implements OnInit {

  // ============================================================
  // CURRENT LEGAL FILE
  // ============================================================

  legalFile: LegalFile | null = null;

  fileId = 0;


  // ============================================================
  // ELIGIBLE FILES
  // ============================================================

  eligibleFiles: LegalFile[] = [];

  loadingEligibleFiles = false;
  filesWithFinalDocuments = new Set<number>();


  // ============================================================
  // FINAL DOCUMENTS
  // ============================================================

  finalDocuments: FinalDocument[] = [];

  loadingFinalDocuments = false;

  selectedFinalDocument: FinalDocument | null = null;


  // ============================================================
  // PROOF OF SERVICE HISTORY
  // ============================================================

  proofOfServices: ProofOfServiceModel[] = [];

  loadingProofOfServices = false;


  // ============================================================
  // FORM
  // ============================================================

  savingProofOfService = false;

  proofOfServiceForm: CreateProofOfService = {

    fileId: 0,

    status: 'SUBMITTED',

    proofFilePath: '',

    remarks: ''
  };

  // ============================================================
// PROCESS MODAL
// ============================================================

showProcessModal = false;

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  showSuccessNotification = false;

  showErrorNotification = false;

  successMessage = '';

  errorMessage = '';


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private legalFileService: LegalFileServiceTs,

    private finalDocumentService: FinalDocumentService,

    private proofOfServiceService: ProofOfServiceService,

    private route: ActivatedRoute,

    private router: Router,

    private cdr: ChangeDetectorRef
  ) {}


  // ============================================================
  // INIT
  // ============================================================

ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    const id = params.get('fileId');

    console.log('ROUTE FILE ID:', id);

    if (id) {

      this.fileId = Number(id);

      this.proofOfServiceForm.fileId = this.fileId;

      console.log('LOADING FILE:', this.fileId);

      this.loadLegalFile();
      this.loadFinalDocuments();
      this.loadProofOfServices();

    } else {

      this.fileId = 0;

      this.proofOfServiceForm.fileId = 0;

      this.loadEligibleFiles();

    }

  });

}


  // ============================================================
  // LOAD ELIGIBLE FILES
  // ============================================================

  loadEligibleFiles(): void {

  this.loadingEligibleFiles = true;

  this.legalFileService
    .getAllLegalFiles()
    .subscribe({

      next: (files) => {

        // Only resolved files
        const resolvedFiles = (files || []).filter(
          file => file.currentStage === 'RESOLVED'
        );

        this.eligibleFiles = resolvedFiles;

        this.filesWithFinalDocuments.clear();

        if (resolvedFiles.length === 0) {

          this.loadingEligibleFiles = false;
          this.cdr.detectChanges();

          return;
        }

        let completedRequests = 0;

        resolvedFiles.forEach(file => {

          this.finalDocumentService
            .getByFileId(file.id)
            .subscribe({

              next: (documents) => {

                if (
                  documents &&
                  documents.length > 0
                ) {

                  this.filesWithFinalDocuments.add(
                    file.id
                  );
                }

                completedRequests++;

                if (
                  completedRequests ===
                  resolvedFiles.length
                ) {

                  this.loadingEligibleFiles = false;

                  this.cdr.detectChanges();
                }
              },

              error: (error) => {

                console.error(
                  `Error loading final document for file ${file.id}:`,
                  error
                );

                completedRequests++;

                if (
                  completedRequests ===
                  resolvedFiles.length
                ) {

                  this.loadingEligibleFiles = false;

                  this.cdr.detectChanges();
                }
              }

            });

        });

      },

      error: (error) => {

        console.error(
          'Error loading eligible files:',
          error
        );

        this.eligibleFiles = [];

        this.loadingEligibleFiles = false;

        this.showError(
          'Unable to load eligible legal files.'
        );

        this.cdr.detectChanges();
      }

    });
}
hasFinalDocument(fileId: number): boolean {

  return this.filesWithFinalDocuments.has(fileId);
}

canProcessFile(file: LegalFile): boolean {

  return (
    file.currentStage === 'RESOLVED' &&
    this.hasFinalDocument(file.id)
  );
}


  // ============================================================
  // PROCESS FILE
  // ============================================================
processFile(file: LegalFile): void {

  console.log('================================');
  console.log('OPEN PROOF OF SERVICE MODAL');
  console.log('File ID:', file.id);
  console.log('Case No:', file.caseNo);
  console.log('================================');

  // Set selected file
  this.legalFile = file;
  this.fileId = file.id;

  // Set form file ID
  this.proofOfServiceForm.fileId = file.id;

  // Default status
  this.proofOfServiceForm.status = 'SUBMITTED';

  // Clear previous values
  this.proofOfServiceForm.proofFilePath = '';
  this.proofOfServiceForm.remarks = '';

  // Clear previous documents
  this.finalDocuments = [];
  this.selectedFinalDocument = null;

  // Open modal
  this.showProcessModal = true;

  // Load final documents
  this.loadingFinalDocuments = true;

  this.finalDocumentService
    .getByFileId(file.id)
    .subscribe({

      next: (documents) => {

        this.finalDocuments = documents || [];

        if (this.finalDocuments.length > 0) {

          this.selectedFinalDocument =
            this.finalDocuments[0];

        }

        this.loadingFinalDocuments = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error loading final documents:',
          error
        );

        this.finalDocuments = [];

        this.selectedFinalDocument = null;

        this.loadingFinalDocuments = false;

        this.showError(
          'Unable to load final document.'
        );

        this.cdr.detectChanges();
      }

    });

}



  // ============================================================
  // LOAD LEGAL FILEloadEligibleFiles
  // ============================================================

  loadLegalFile(): void {

    if (!this.fileId) {
      return;
    }

    this.legalFileService
      .getLegalFileById(this.fileId)
      .subscribe({

        next: (file) => {

          this.legalFile = file;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading legal file:',
            error
          );

          this.legalFile = null;

          this.showError(
            'Unable to load legal file.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  // ============================================================
  // LOAD FINAL DOCUMENTS
  // ============================================================

  loadFinalDocuments(): void {

    if (!this.fileId) {

      this.finalDocuments = [];

      this.selectedFinalDocument = null;

      return;
    }

    this.loadingFinalDocuments = true;

    this.finalDocumentService
      .getByFileId(this.fileId)
      .subscribe({

        next: (documents) => {

          this.finalDocuments =
            documents || [];

          /*
           * Automatically select the first
           * available final document.
           */
          if (this.finalDocuments.length > 0) {

            this.selectedFinalDocument =
              this.finalDocuments[0];

          } else {

            this.selectedFinalDocument =
              null;
          }

          this.loadingFinalDocuments = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading final documents:',
            error
          );

          this.finalDocuments = [];

          this.selectedFinalDocument = null;

          this.loadingFinalDocuments = false;

          this.showError(
            'Unable to load final documents.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  // ============================================================
  // SELECT FINAL DOCUMENT
  // ============================================================

  prepareProofOfService(
    finalDocument: FinalDocument
  ): void {

    this.selectedFinalDocument =
      finalDocument;

    this.proofOfServiceForm.fileId =
      this.fileId;

    this.proofOfServiceForm.status =
      'SUBMITTED';

    this.proofOfServiceForm.proofFilePath =
      finalDocument.filePath || '';

    this.proofOfServiceForm.remarks =
      '';

    this.cdr.detectChanges();
  }


  // ============================================================
  // LOAD PROOF OF SERVICE HISTORY
  // ============================================================

  loadProofOfServices(): void {

    if (!this.fileId) {
      return;
    }

    this.loadingProofOfServices = true;

    this.proofOfServiceService
      .getByFileId(this.fileId)
      .subscribe({

        next: (data) => {

          this.proofOfServices =
            data || [];

          this.loadingProofOfServices = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading proof of service:',
            error
          );

          this.proofOfServices = [];

          this.loadingProofOfServices = false;

          this.cdr.detectChanges();
        }
      });
  }


  // ============================================================
  // SAVE PROOF OF SERVICE
  // ============================================================

  saveProofOfService(): void {

    // ----------------------------------------------------------
    // CHECK FILE
    // ----------------------------------------------------------

    if (!this.fileId || !this.legalFile) {

      this.showError(
        'No legal file selected.'
      );

      return;
    }


    // ----------------------------------------------------------
    // CHECK CURRENT STAGE
    // ----------------------------------------------------------

    if (
      this.legalFile.currentStage !==
      'RESOLVED'
    ) {

      this.showError(
        'Proof of Service can only be processed for a resolved file.'
      );

      return;
    }


    // ----------------------------------------------------------
    // CHECK FINAL DOCUMENT
    // ----------------------------------------------------------

    if (this.finalDocuments.length === 0) {

      this.showError(
        'This legal file does not have a final document yet.'
      );

      return;
    }


    // ----------------------------------------------------------
    // CHECK SELECTED FINAL DOCUMENT
    // ----------------------------------------------------------

    if (!this.selectedFinalDocument) {

      this.showError(
        'Please select a final document.'
      );

      return;
    }


    // ----------------------------------------------------------
    // CHECK STATUS
    // ----------------------------------------------------------

    if (
      !this.proofOfServiceForm.status
    ) {

      this.showError(
        'Please select a proof of service status.'
      );

      return;
    }


    // ----------------------------------------------------------
    // CHECK PROOF FILE PATH
    // ----------------------------------------------------------

    if (
      !this.proofOfServiceForm.proofFilePath ||
      !this.proofOfServiceForm.proofFilePath.trim()
    ) {

      this.showError(
        'Please enter the proof of service file path.'
      );

      return;
    }


    // ----------------------------------------------------------
    // PREPARE REQUEST
    // ----------------------------------------------------------

    const request: CreateProofOfService = {

      fileId: this.fileId,

      status:
        this.proofOfServiceForm.status,

      proofFilePath:
        this.proofOfServiceForm.proofFilePath,

      remarks:
        this.proofOfServiceForm.remarks || ''
    };


    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    this.savingProofOfService = true;

    this.proofOfServiceService
      .createProofOfService(request)
      .subscribe({

        next: () => {

          this.savingProofOfService = false;

          this.showSuccess(
            'Proof of Service saved successfully.'
          );

          /*
           * Reload history after saving.
           */
          this.loadProofOfServices();

          /*
           * Reload legal file in case the
           * backend changes its state.
           */
          this.loadLegalFile();

          /*
           * Reset remarks.
           */
          this.proofOfServiceForm.remarks = '';

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error saving Proof of Service:',
            error
          );

          this.savingProofOfService = false;

          let message =
            'Unable to save Proof of Service.';

          if (
            error?.error?.message
          ) {

            message =
              error.error.message;

          } else if (
            typeof error?.error === 'string'
          ) {

            message =
              error.error;
          }

          this.showError(message);

          this.cdr.detectChanges();
        }
      });
  }


  // ============================================================
  // CHECK FINAL DOCUMENT
  // ============================================================

  hasFinalDocumentForFile(): boolean {

    return this.finalDocuments.length > 0;
  }


  // ============================================================
  // STATUS CLASS
  // ============================================================

  getStatusClass(
    status: string | null | undefined
  ): string {

    if (!status) {
      return '';
    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  // ============================================================
  // SUCCESS NOTIFICATION
  // ============================================================

  showSuccess(message: string): void {

    this.successMessage = message;

    this.showSuccessNotification = true;

    this.showErrorNotification = false;

    setTimeout(() => {

      this.showSuccessNotification = false;

      this.cdr.detectChanges();

    }, 3000);
  }


  // ============================================================
  // ERROR NOTIFICATION
  // ============================================================

  showError(message: string): void {

    this.errorMessage = message;

    this.showErrorNotification = true;

    this.showSuccessNotification = false;

    setTimeout(() => {

      this.showErrorNotification = false;

      this.cdr.detectChanges();

    }, 4000);
  }


  // ============================================================
  // GO BACK
  // ============================================================
goBack(): void {
  this.showProcessModal = false;

  this.legalFile = null;
  this.fileId = 0;

  this.finalDocuments = [];
  this.selectedFinalDocument = null;

  this.proofOfServices = [];

  this.proofOfServiceForm = {
    fileId: 0,
    status: 'SUBMITTED',
    proofFilePath: '',
    remarks: ''
  };

  this.cdr.detectChanges();
}
}