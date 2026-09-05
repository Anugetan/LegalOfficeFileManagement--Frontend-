
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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

import {
  LegalFileServiceTs
} from '../../service/legal-file.service.ts';

import {
  CreateLegalFile
} from '../../model/legalFiles/create-legal-files';

import {
  FileDocumentService
} from '../../service/FileDocumentService';

import {
  FileUploadResponse
} from '../../model/fileupload/file-upload';


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


  // =====================================================
  // SAVE NOTIFICATIONS
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
  // STATUS CHANGES
  // =====================================================

  statusChanges =
    new Map<number, number>();

  originalStatusIds =
    new Map<number, number | null>();


  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  statuses: Status[] = [];

  spmsTypes: SpmsType[] = [];

  offices: Office[] = [];

  documentTypes: DocumentType[] = [];

  documentFormats: DocumentFormat[] = [];


  // =====================================================
  // FORM VISIBILITY
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

        dateCompleted: [
          ''
        ],

        statusId: [
          null as number | null,
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
        ],

        currentStage: [
          'RECEIVED',
          Validators.required
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
  // GET STATUS CSS CLASS
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
  // SORT LEGAL FILES BY STATUS
  // =====================================================

  sortLegalFiles(
    files: LegalFile[]
  ): LegalFile[] {

    const priority:
      Record<string, number> = {

      pending: 1,

      out: 2,

      archived: 3,

      resolved: 4,

      cancelled: 5

    };


    return [...files].sort(
      (a, b) => {

        const statusA =
          (a.statusName ?? '')
            .trim()
            .toLowerCase();


        const statusB =
          (b.statusName ?? '')
            .trim()
            .toLowerCase();


        const priorityA =
          priority[statusA] ?? 99;


        const priorityB =
          priority[statusB] ?? 99;


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


  // =====================================================
  // TOGGLE SINGLE CHECKBOX
  // =====================================================

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


  // =====================================================
  // SELECT / DESELECT ALL
  // =====================================================

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


  // =====================================================
  // UPDATE SELECT ALL STATE
  // =====================================================

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
  // STATUS CHANGED
  // =====================================================

  onStatusChange(

    file: LegalFile,

    newStatusId: number

  ): void {

    const originalStatusId =
      this.originalStatusIds.get(
        file.id
      ) ?? null;


    if (
      newStatusId ===
      originalStatusId
    ) {

      this.statusChanges.delete(
        file.id
      );

    } else {

      this.statusChanges.set(
        file.id,
        newStatusId
      );

    }


    const selectedStatus =
      this.statuses.find(
        status =>
          status.id === newStatusId
      );


    file.statusId =
      newStatusId;

    file.statusName =
      selectedStatus?.statusName ?? '';


    this.legalFiles =
      this.sortLegalFiles(
        this.legalFiles
      );


    this.cdr.detectChanges();

  }


  // =====================================================
  // CHECK STATUS CHANGES
  // =====================================================

  hasStatusChanges(): boolean {

    return this.statusChanges.size > 0;

  }


  // =====================================================
  // SELECT DOCUMENT DURING CREATE
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

      this.selectedDocumentFile =
        null;

      this.uploadStatus =
        'idle';

      this.uploadStatusMessage =
        '';

      return;

    }


    this.selectedDocumentFile =
      input.files[0];


    this.uploadStatus =
      'idle';

    this.uploadStatusMessage =
      '';


    console.log(
      'SELECTED FILE:',
      this.selectedDocumentFile
    );


    this.cdr.detectChanges();

  }


  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  uploadDocument(
    legalFileId: number
  ): void {

    if (
      !this.selectedDocumentFile
    ) {

      return;

    }


    const fileToUpload =
      this.selectedDocumentFile;


    const documentFormatId =
      this.legalFileForm
        .get('documentFormatId')
        ?.value;


    // =============================================
    // UPLOAD STARTED
    // =============================================

    this.uploadStatus =
      'uploading';

    this.uploadStatusMessage =
      'Uploading file...';


    this.cdr.detectChanges();


    // =============================================
    // UPLOAD FILE
    // =============================================

    this.fileDocumentService
      .uploadFile(
        legalFileId,
        fileToUpload,
        documentFormatId
      )
      .subscribe({

        // =========================================
        // SUCCESS
        // =========================================

        next: (
          response: FileUploadResponse
        ) => {

          console.log(
            'FILE UPLOADED:',
            response
          );


          this.uploadStatus =
            'success';

          this.uploadStatusMessage =
            'File uploaded successfully ✓';


          this.selectedDocumentFile =
            null;


          this.cdr.detectChanges();

        },


        // =========================================
        // ERROR
        // =========================================

        error: (
          error: unknown
        ) => {

          console.error(
            'FILE UPLOAD ERROR:',
            error
          );


          this.uploadStatus =
            'error';

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

          console.log(
            'LEGAL FILES FROM DATABASE:',
            data
          );


          // ---------------------------------------------
          // Save original status IDs
          // ---------------------------------------------

          this.originalStatusIds.clear();


          data.forEach(
            file => {

              this.originalStatusIds.set(

                file.id,

                file.statusId ?? null

              );

            }
          );


          // ---------------------------------------------
          // Clear unsaved status changes
          // ---------------------------------------------

          this.statusChanges.clear();


          // ---------------------------------------------
          // Sort and display
          // ---------------------------------------------

          this.legalFiles =
            this.sortLegalFiles(
              data
            );


          // ---------------------------------------------
          // Remove selections that no longer exist
          // ---------------------------------------------

          const existingIds =
            new Set(
              data.map(
                file =>
                  file.id
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


          // ---------------------------------------------
          // Update select-all checkbox
          // ---------------------------------------------

          this.updateAllSelected();


          // ---------------------------------------------
          // Load documents for each legal file
          // ---------------------------------------------

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


                    console.log(
                      'DOCUMENTS FOR CASE:',
                      file.caseNo,
                      documents
                    );


                    this.cdr.detectChanges();

                  },


                  error: (
                    error: unknown
                  ) => {

                    console.error(
                      'ERROR LOADING DOCUMENTS FOR CASE:',
                      file.caseNo,
                      error
                    );


                    file.documents =
                      [];

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

        }

      });

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

          console.log(
            'STATUSES:',
            data
          );


          this.statuses =
            data;


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

          console.log(
            'SPMS TYPES:',
            data
          );


          this.spmsTypes =
            data;


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

          console.log(
            'OFFICES:',
            data
          );


          this.offices =
            data;


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

          console.log(
            'DOCUMENT TYPES:',
            data
          );


          this.documentTypes =
            data;


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

          console.log(
            'DOCUMENT FORMATS:',
            data
          );


          this.documentFormats =
            data;


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
  // LOAD DOCUMENTS FOR LEGAL FILE
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


          console.log(
            'DOCUMENTS FOR CASE:',
            legalFile.caseNo,
            documents
          );


          this.cdr.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR LOADING DOCUMENTS:',
            error
          );


          legalFile.documents =
            [];

        }

      });

  }


  // =====================================================
  // DOWNLOAD DOCUMENT
  // =====================================================

  downloadDocument(
    document: FileUploadResponse
  ): void {

    console.log(
      'DOWNLOADING DOCUMENT:',
      document
    );


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


          link.href =
            url;


          link.download =
            document.documentName;


          link.click();


          window.URL.revokeObjectURL(
            url
          );

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
  // OPEN CREATE FORM
  // =====================================================

  openCreateForm(): void {

    this.showForm =
      true;


    this.resetForm();


    this.uploadStatus =
      'idle';

    this.uploadStatusMessage =
      '';


    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  closeCreateForm(): void {

    this.showForm =
      false;


    this.resetForm();


    this.cdr.detectChanges();

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.legalFileForm.reset({

      caseNo: '',

      dateReceived: '',

      timeReceived: '',

      dateCompleted: '',

      statusId: null,

      spmsTypeId: null,

      requestingOfficeId: null,

      documentTypeId: null,

      documentFormatId: null,

      contactDetails: '',

      currentStage: 'RECEIVED'

    });


    this.selectedDocumentFile =
      null;


    this.uploadStatus =
      'idle';

    this.uploadStatusMessage =
      '';

  }


  // =====================================================
  // OPEN REPLACE DOCUMENT MODAL
  // =====================================================

  openReplaceDocument(
    document: FileUploadResponse
  ): void {

    console.log(
      'OPEN REPLACE MODAL:',
      document
    );


    this.selectedReplaceDocument =
      document;


    this.selectedReplaceFile =
      null;


    this.showReplaceModal =
      true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE REPLACE DOCUMENT MODAL
  // =====================================================

  closeReplaceModal(): void {

    this.showReplaceModal =
      false;


    this.selectedReplaceDocument =
      null;


    this.selectedReplaceFile =
      null;


    this.cdr.detectChanges();

  }


  // =====================================================
  // SELECT REPLACEMENT FILE
  // =====================================================

  onReplaceFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedReplaceFile =
        null;

      return;

    }


    this.selectedReplaceFile =
      input.files[0];


    console.log(
      'SELECTED REPLACEMENT FILE:',
      this.selectedReplaceFile
    );


    this.cdr.detectChanges();

  }


  // =====================================================
  // CONFIRM REPLACE DOCUMENT
  // =====================================================

  confirmReplaceDocument(): void {

    if (
      !this.selectedReplaceDocument ||
      !this.selectedReplaceFile
    ) {

      console.warn(
        'NO DOCUMENT OR REPLACEMENT FILE SELECTED'
      );

      return;

    }


    const documentId =
      this.selectedReplaceDocument.id;


    const newFile =
      this.selectedReplaceFile;


    console.log(
      'REPLACING DOCUMENT ID:',
      documentId
    );


    console.log(
      'NEW FILE:',
      newFile.name
    );


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
            'FILE REPLACED SUCCESSFULLY:',
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


  // =====================================================
  // OLD DIRECT REPLACE METHOD
  // =====================================================

  replaceDocument(
    document: FileUploadResponse
  ): void {

    this.openReplaceDocument(
      document
    );

  }


  // =====================================================
  // UPDATE CHANGED STATUSES
  // =====================================================

  updateChangedStatuses(): void {

    if (
      this.statusChanges.size === 0
    ) {

      console.log(
        'No status changes.'
      );

      return;

    }


    console.log(
      'STATUS CHANGES:',
      Array.from(
        this.statusChanges.entries()
      )
    );


    const changes =
      Array.from(
        this.statusChanges.entries()
      );


    let completedUpdates =
      0;


    changes.forEach(
      ([fileId, newStatusId]) => {

        const file =
          this.legalFiles.find(
            item =>
              item.id === fileId
          );


        if (!file) {

          console.error(
            'Legal file not found:',
            fileId
          );

          return;

        }


        const legalFile:
          CreateLegalFile = {

          caseNo:
            file.caseNo,

          dateReceived:
            file.dateReceived,

          timeReceived:
            file.timeReceived ?? '',

          dateCompleted:
            file.dateCompleted ?? null,

          statusId:
            newStatusId,

          spmsTypeId:
            file.spmsTypeId ?? null,

          requestingOfficeId:
            file.requestingOfficeId ?? null,

          documentTypeId:
            file.documentTypeId ?? null,

          documentFormatId:
            file.documentFormatId ?? null,

          contactDetails:
            file.contactDetails ?? '',

          currentStage:
            file.currentStage ??
            'RECEIVED'

        };


        console.log(
          'UPDATING LEGAL FILE:',
          fileId
        );


        console.log(
          'REQUEST:',
          legalFile
        );


        this.legalFileServiceTs
          .updateLegalFile(
            fileId,
            legalFile
          )
          .subscribe({

            next: (
              updatedFile: LegalFile
            ) => {

              console.log(
                'LEGAL FILE UPDATED:',
                updatedFile
              );


              this.originalStatusIds.set(

                fileId,

                updatedFile.statusId ??
                null

              );


              const index =
                this.legalFiles.findIndex(
                  item =>
                    item.id === fileId
                );


              if (index !== -1) {

                this.legalFiles[index] =
                  updatedFile;

              }


              completedUpdates++;


              if (
                completedUpdates ===
                changes.length
              ) {

                console.log(
                  'ALL STATUS UPDATES COMPLETED'
                );


                this.statusChanges.clear();


                this.loadLegalFiles();


                this.cdr.detectChanges();

              } else {

                this.legalFiles =
                  this.sortLegalFiles(
                    [...this.legalFiles]
                  );


                this.cdr.detectChanges();

              }

            },


            error: (
              error: unknown
            ) => {

              console.error(

                `ERROR UPDATING LEGAL FILE ${fileId}:`,

                error

              );

            }

          });

      }

    );

  }


  // =====================================================
  // DELETE SELECTED LEGAL FILES
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


    console.log(
      'DELETING LEGAL FILES:',
      selectedIds
    );


    let completedDeletes =
      0;


    selectedIds.forEach(
      fileId => {

        this.legalFileServiceTs
          .deleteLegalFile(
            fileId
          )
          .subscribe({

            next: () => {

              console.log(
                'LEGAL FILE DELETED:',
                fileId
              );


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

                console.log(
                  'ALL SELECTED FILES DELETED'
                );


                this.selectedFiles.clear();

                this.allSelected =
                  false;


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
  // CREATE LEGAL FILE
  // =====================================================

  saveLegalFile(): void {

    // ===================================================
    // VALIDATE FORM
    // ===================================================

    if (
      this.legalFileForm.invalid
    ) {

      this.legalFileForm.markAllAsTouched();


      console.log(
        'FORM INVALID:',
        this.legalFileForm.getRawValue()
      );


      return;

    }


    // ===================================================
    // GET FORM VALUES
    // ===================================================

    const formValue =
      this.legalFileForm.getRawValue();


    // ===================================================
    // BUILD LEGAL FILE REQUEST
    // ===================================================

    const legalFile:
      CreateLegalFile = {

      caseNo:
        formValue.caseNo!,

      dateReceived:
        formValue.dateReceived!,

      timeReceived:
        formValue.timeReceived || '',

      dateCompleted:
        formValue.dateCompleted || null,

      statusId:
        formValue.statusId,

      spmsTypeId:
        formValue.spmsTypeId,

      requestingOfficeId:
        formValue.requestingOfficeId,

      documentTypeId:
        formValue.documentTypeId,

      documentFormatId:
        formValue.documentFormatId,

      contactDetails:
        formValue.contactDetails || '',

      currentStage:
        formValue.currentStage!

    };


    // ===================================================
    // IMPORTANT:
    // Save the selected file in a variable BEFORE
    // the async request starts.
    // ===================================================

    const fileToUpload =
      this.selectedDocumentFile;


    const documentFormatId =
      formValue.documentFormatId;


    // ===================================================
    // RESET NOTIFICATIONS
    // ===================================================

    this.showSuccessNotification =
      false;

    this.showErrorNotification =
      false;

    this.successMessage =
      '';

    this.errorMessage =
      '';


    // ===================================================
    // RESET UPLOAD STATUS
    // ===================================================

    this.uploadStatus =
      'idle';

    this.uploadStatusMessage =
      '';


    // ===================================================
    // DEBUG
    // ===================================================

    console.log(
      'SENDING LEGAL FILE:',
      JSON.stringify(
        legalFile,
        null,
        2
      )
    );


    console.log(
      'SELECTED DOCUMENT:',
      fileToUpload
    );


    // ===================================================
    // CREATE LEGAL FILE
    // ===================================================

    this.legalFileServiceTs
      .createLegalFile(
        legalFile
      )
      .subscribe({

        // ===============================================
        // LEGAL FILE CREATED
        // ===============================================

        next: (
          data: LegalFile
        ) => {

          console.log(
            'LEGAL FILE CREATED:',
            data
          );


          console.log(
            'NEW LEGAL FILE ID:',
            data.id
          );


          console.log(
            'RETURNED STATUS ID:',
            data.statusId
          );


          console.log(
            'RETURNED STATUS NAME:',
            data.statusName
          );


          // =============================================
          // DOCUMENT WAS SELECTED
          // =============================================

          if (
            fileToUpload &&
            data.id
          ) {

            console.log(
              'LEGAL FILE CREATED.'
            );

            console.log(
              'NOW UPLOADING DOCUMENT...'
            );


            // -------------------------------------------
            // Show uploading state
            // -------------------------------------------

            this.uploadStatus =
              'uploading';

            this.uploadStatusMessage =
              'Uploading document...';


            this.cdr.detectChanges();


            // -------------------------------------------
            // Upload document
            // -------------------------------------------

            this.fileDocumentService
              .uploadFile(
                data.id,
                fileToUpload,
                documentFormatId
              )
              .subscribe({

                // =======================================
                // DOCUMENT UPLOAD SUCCESS
                // =======================================

                next: (
                  response: FileUploadResponse
                ) => {

                  console.log(
                    'FILE UPLOADED:',
                    response
                  );


                  this.uploadStatus =
                    'success';

                  this.uploadStatusMessage =
                    'Document uploaded successfully ✓';


                  // ---------------------------------------
                  // CLOSE CREATE FORM
                  // ---------------------------------------

                  this.showForm =
                    false;


                  // ---------------------------------------
                  // RESET FORM
                  // ---------------------------------------

                  this.resetForm();


                  // ---------------------------------------
                  // RELOAD DATA
                  // ---------------------------------------

                  this.loadLegalFiles();


                  // ---------------------------------------
                  // SHOW SUCCESS NOTIFICATION
                  // ---------------------------------------

                  this.successMessage =
                    `Legal file ${data.caseNo} and document were saved successfully.`;

                  this.showSuccessNotification =
                    true;


                  this.cdr.detectChanges();


                  // ---------------------------------------
                  // AUTO HIDE NOTIFICATION
                  // ---------------------------------------

                  setTimeout(() => {

                    this.showSuccessNotification =
                      false;

                    this.cdr.detectChanges();

                  }, 5000);

                },


                // =======================================
                // DOCUMENT UPLOAD ERROR
                // =======================================

                error: (
                  error: unknown
                ) => {

                  console.error(
                    'FILE UPLOAD ERROR:',
                    error
                  );


                  this.uploadStatus =
                    'error';

                  this.uploadStatusMessage =
                    'File upload failed. Please try again.';


                  // ---------------------------------------
                  // Legal file exists but document failed
                  // ---------------------------------------

                  this.errorMessage =
                    `Legal file ${data.caseNo} was created, but the document upload failed.`;

                  this.showErrorNotification =
                    true;


                  this.cdr.detectChanges();

                }

              });


            return;

          }


          // =================================================
          // NO DOCUMENT SELECTED
          // =================================================

          console.log(
            'LEGAL FILE SAVED WITHOUT DOCUMENT.'
          );


          // -----------------------------------------------
          // CLOSE FORM
          // -----------------------------------------------

          this.showForm =
            false;


          // -----------------------------------------------
          // RESET FORM
          // -----------------------------------------------

          this.resetForm();


          // -----------------------------------------------
          // RELOAD DATA
          // -----------------------------------------------

          this.loadLegalFiles();


          // -----------------------------------------------
          // SUCCESS NOTIFICATION
          // -----------------------------------------------

          this.successMessage =
            `Legal file ${data.caseNo} was saved successfully.`;

          this.showSuccessNotification =
            true;


          this.cdr.detectChanges();


          // -----------------------------------------------
          // AUTO HIDE
          // -----------------------------------------------

          setTimeout(() => {

            this.showSuccessNotification =
              false;

            this.cdr.detectChanges();

          }, 5000);

        },


        // ===============================================
        // CREATE LEGAL FILE ERROR
        // ===============================================

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR CREATING LEGAL FILE:',
            error
          );


          this.errorMessage =
            'Unable to save the legal file. Please try again.';


          this.showErrorNotification =
            true;


          this.cdr.detectChanges();


          // ---------------------------------------------
          // AUTO HIDE ERROR
          // ---------------------------------------------

          setTimeout(() => {

            this.showErrorNotification =
              false;

            this.cdr.detectChanges();

          }, 5000);

        }

      });

  }

}

