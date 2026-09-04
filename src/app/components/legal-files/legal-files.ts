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

import { LegalFileServiceTs } from '../../service/legal-file.service.ts';

import { CreateLegalFile } from '../../model/legalFiles/create-legal-files';
import { FileDocumentService } from '../../service/FileDocumentService';
import { FileUploadResponse } from '../../model/fileupload/file-upload';


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

  // =====================================================
  // SELECTED FILES
  // =====================================================

  selectedFiles = new Set<number>();

  allSelected = false;


  // =====================================================
  // STATUS CHANGES
  // =====================================================

  statusChanges = new Map<number, number>();

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
  // FORM
  // =====================================================

  legalFileForm!: ReturnType<FormBuilder['group']>;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private fb: FormBuilder,
    private legalFileServiceTs: LegalFileServiceTs,
    private fileDocumentService: FileDocumentService,
    private cdr: ChangeDetectorRef

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

    if (statusId === null || statusId === undefined) {

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

    const priority: Record<string, number> = {

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

    }

    else {

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

    }

    else {

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


    // ---------------------------------------------
    // Check if changed back to original
    // ---------------------------------------------

    if (
      newStatusId ===
      originalStatusId
    ) {

      this.statusChanges.delete(
        file.id
      );

    }

    else {

      this.statusChanges.set(
        file.id,
        newStatusId
      );

    }


    // ---------------------------------------------
    // Find selected status
    // ---------------------------------------------

    const selectedStatus =
      this.statuses.find(
        status =>
          status.id === newStatusId
      );


    // ---------------------------------------------
    // Update table object immediately
    // ---------------------------------------------

    file.statusId =
      newStatusId;


    file.statusName =
      selectedStatus?.statusName ?? '';


    // ---------------------------------------------
    // Re-sort table
    // ---------------------------------------------

    this.legalFiles =
      this.sortLegalFiles(
        this.legalFiles
      );


    // ---------------------------------------------
    // Force UI update
    // ---------------------------------------------

    this.cdr.detectChanges();

  }


  // =====================================================
  // CHECK STATUS CHANGES
  // =====================================================

  hasStatusChanges(): boolean {

    return this.statusChanges.size > 0;

  }

  onDocumentFileSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {

    this.selectedDocumentFile = null;

    return;

  }

  this.selectedDocumentFile = input.files[0];

  console.log(
    'SELECTED FILE:',
    this.selectedDocumentFile
  );

}

uploadDocument(legalFileId: number): void {

  if (!this.selectedDocumentFile) {
    return;
  }

  const documentFormatId =
    this.legalFileForm
      .get('documentFormatId')
      ?.value;

  this.fileDocumentService
    .uploadFile(
      legalFileId,
      this.selectedDocumentFile,
      documentFormatId
    )
    .subscribe({

      next: (response: FileUploadResponse) => {

        console.log(
          'FILE UPLOADED:',
          response
        );

        this.selectedDocumentFile = null;

      },

      error: (error: unknown) => {

        console.error(
          'FILE UPLOAD ERROR:',
          error
        );

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

      next: (data: LegalFile[]) => {

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
              .getDocumentsByFileId(file.id)
              .subscribe({

                next: (documents: FileUploadResponse[]) => {

                  file.documents = documents;

                  console.log(
                    'DOCUMENTS FOR CASE:',
                    file.caseNo,
                    documents
                  );

                  this.cdr.detectChanges();

                },

                error: (error: unknown) => {

                  console.error(
                    'ERROR LOADING DOCUMENTS FOR CASE:',
                    file.caseNo,
                    error
                  );

                  file.documents = [];

                }

              });

          }
        );


        // ---------------------------------------------
        // Force UI update
        // ---------------------------------------------

        this.cdr.detectChanges();

      },


      error: (error: unknown) => {

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

        next: (data: Status[]) => {

          console.log(
            'STATUSES:',
            data
          );


          this.statuses = data;


          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

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

        next: (data: SpmsType[]) => {

          console.log(
            'SPMS TYPES:',
            data
          );


          this.spmsTypes = data;


          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

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

        next: (data: Office[]) => {

          console.log(
            'OFFICES:',
            data
          );


          this.offices = data;


          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

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

        next: (data: DocumentType[]) => {

          console.log(
            'DOCUMENT TYPES:',
            data
          );


          this.documentTypes = data;


          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

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

        next: (data: DocumentFormat[]) => {

          console.log(
            'DOCUMENT FORMATS:',
            data
          );


          this.documentFormats = data;


          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

          console.error(
            'ERROR LOADING DOCUMENT FORMATS:',
            error
          );

        }

      });

  }

    // =====================================================
  // LOAD DOCUMENT ForLegalFile
  // =====================================================

  loadDocumentsForLegalFile(
  legalFile: LegalFile
): void {

  this.fileDocumentService
    .getDocumentsByFileId(legalFile.id)
    .subscribe({

      next: (documents: FileUploadResponse[]) => {

        legalFile.documents = documents;

        console.log(
          'DOCUMENTS FOR CASE:',
          legalFile.caseNo,
          documents
        );

      },

      error: (error: unknown) => {

        console.error(
          'ERROR LOADING DOCUMENTS:',
          error
        );

        legalFile.documents = [];

      }

    });
}


downloadDocument(
  document: FileUploadResponse
): void {

  console.log(
    'DOWNLOADING DOCUMENT:',
    document
  );

  this.fileDocumentService
    .downloadFile(document.id)
    .subscribe({

      next: (blob: Blob) => {

        const url =
          window.URL.createObjectURL(blob);

        const link =
          window.document.createElement('a');

        link.href = url;

        link.download =
          document.documentName;

        link.click();

        window.URL.revokeObjectURL(url);

      },

      error: (error: unknown) => {

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

    this.showForm = true;

    this.resetForm();

    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE CREATE FORM
  // =====================================================

  closeCreateForm(): void {

    this.showForm = false;

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


    // ---------------------------------------------
    // Create copy of changes
    // ---------------------------------------------

    const changes =
      Array.from(
        this.statusChanges.entries()
      );


    // ---------------------------------------------
    // Counter
    // ---------------------------------------------

    let completedUpdates = 0;


    // ---------------------------------------------
    // Update each legal file
    // ---------------------------------------------

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


        // ---------------------------------------------
        // Build request
        // ---------------------------------------------

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
            file.currentStage ?? 'RECEIVED'

        };


        console.log(
          'UPDATING LEGAL FILE:',
          fileId
        );


        console.log(
          'REQUEST:',
          legalFile
        );


        // ---------------------------------------------
        // PUT REQUEST
        // ---------------------------------------------

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


              // ---------------------------------------------
              // Update original status
              // ---------------------------------------------

              this.originalStatusIds.set(

                fileId,

                updatedFile.statusId ?? null

              );


              // ---------------------------------------------
              // Update table object
              // ---------------------------------------------

              const index =
                this.legalFiles.findIndex(
                  item =>
                    item.id === fileId
                );


              if (index !== -1) {

                this.legalFiles[index] =
                  updatedFile;

              }


              // ---------------------------------------------
              // Count completed updates
              // ---------------------------------------------

              completedUpdates++;


              // ---------------------------------------------
              // When ALL updates finish
              // ---------------------------------------------

              if (
                completedUpdates ===
                changes.length
              ) {

                console.log(
                  'ALL STATUS UPDATES COMPLETED'
                );


                // Clear pending changes

                this.statusChanges.clear();


                // Reload database

                this.loadLegalFiles();


                this.cdr.detectChanges();

              }

              else {

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

    // ---------------------------------------------
    // Check selection
    // ---------------------------------------------

    if (
      this.selectedFiles.size === 0
    ) {

      console.log(
        'No legal files selected.'
      );

      return;

    }


    // ---------------------------------------------
    // Convert Set to Array
    // ---------------------------------------------

    const selectedIds =
      Array.from(
        this.selectedFiles
      );


    // ---------------------------------------------
    // Confirmation
    // ---------------------------------------------

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


    // ---------------------------------------------
    // Counter
    // ---------------------------------------------

    let completedDeletes = 0;


    // ---------------------------------------------
    // Delete each selected file
    // ---------------------------------------------

    selectedIds.forEach(
      fileId => {

        this.legalFileServiceTs
          .deleteLegalFile(fileId)
          .subscribe({

            next: () => {

              console.log(
                'LEGAL FILE DELETED:',
                fileId
              );


              completedDeletes++;


              // ---------------------------------------------
              // Remove from selected files
              // ---------------------------------------------

              this.selectedFiles.delete(
                fileId
              );


              // ---------------------------------------------
              // Remove from table immediately
              // ---------------------------------------------

              this.legalFiles =
                this.legalFiles.filter(
                  file =>
                    file.id !== fileId
                );


              // ---------------------------------------------
              // When all deletes finish
              // ---------------------------------------------

              if (
                completedDeletes ===
                selectedIds.length
              ) {

                console.log(
                  'ALL SELECTED FILES DELETED'
                );


                this.selectedFiles.clear();

                this.allSelected = false;


                // ---------------------------------------------
                // Reload database
                // ---------------------------------------------

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

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  if (this.legalFileForm.invalid) {

    this.legalFileForm.markAllAsTouched();

    console.log(
      'FORM INVALID:',
      this.legalFileForm.getRawValue()
    );

    return;

  }


  // =====================================================
  // GET FORM VALUES
  // =====================================================

  const formValue =
    this.legalFileForm.getRawValue();


  // =====================================================
  // BUILD LEGAL FILE REQUEST
  // =====================================================

  const legalFile: CreateLegalFile = {

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


  // =====================================================
  // DEBUG
  // =====================================================

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
    this.selectedDocumentFile
  );


  // =====================================================
  // CREATE LEGAL FILE
  // =====================================================

  this.legalFileServiceTs
    .createLegalFile(legalFile)
    .subscribe({

      // =================================================
      // SUCCESS
      // =================================================

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


        // =================================================
        // UPLOAD DOCUMENT IF SELECTED
        // =================================================

        if (
          this.selectedDocumentFile &&
          data.id
        ) {

          console.log(
            'UPLOADING DOCUMENT...'
          );


          this.uploadDocument(
            data.id
          );

        }


        // =================================================
        // CLOSE FORM
        // =================================================

        this.showForm = false;


        // =================================================
        // RESET FORM
        // =================================================

        this.resetForm();


        // =================================================
        // RELOAD LEGAL FILES
        // =================================================

        this.loadLegalFiles();


        // =================================================
        // UPDATE UI
        // =================================================

        this.cdr.detectChanges();

      },


      // =================================================
      // ERROR
      // =================================================

      error: (
        error: unknown
      ) => {

        console.error(
          'ERROR CREATING LEGAL FILE:',
          error
        );

      }

    });

}

}