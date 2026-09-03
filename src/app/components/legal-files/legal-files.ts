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


  // =====================================================
  // SELECTED FILES
  // =====================================================

  selectedFiles = new Set<number>();

  allSelected = false;


  // =====================================================
  // STATUS CHANGES
  // =====================================================

  /*
   * Stores:
   *
   * legalFileId -> new statusId
   *
   * Example:
   *
   * 5 -> 2
   * 8 -> 4
   */

  statusChanges = new Map<number, number>();


  /*
   * Stores the original status before the user
   * changes the dropdown.
   *
   * legalFileId -> original statusId
   */

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

  /*
   * This method is used by the HTML:
   *
   * [ngClass]="getStatusClass(file.statusId)"
   *
   * It finds the status name using the status ID
   * and returns the CSS class.
   *
   * Example:
   *
   * statusId = 1
   *
   * statusName = "PENDING"
   *
   * returns:
   *
   * "status-select status-pending"
   */

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

    // ---------------------------------------------
    // Validate
    // ---------------------------------------------

    if (
      this.legalFileForm.invalid
    ) {

      this.legalFileForm
        .markAllAsTouched();

      console.log(
        'FORM INVALID:',
        this.legalFileForm.getRawValue()
      );

      return;

    }


    // ---------------------------------------------
    // Get form values
    // ---------------------------------------------

    const formValue =
      this.legalFileForm.getRawValue();


    // ---------------------------------------------
    // Build request
    // ---------------------------------------------

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


    console.log(
      'SENDING LEGAL FILE:',
      JSON.stringify(
        legalFile,
        null,
        2
      )
    );


    // ---------------------------------------------
    // Send POST request
    // ---------------------------------------------

    this.legalFileServiceTs
      .createLegalFile(
        legalFile
      )
      .subscribe({

        next: (
          data: LegalFile
        ) => {

          console.log(
            'LEGAL FILE CREATED:',
            data
          );


          console.log(
            'RETURNED STATUS ID:',
            data.statusId
          );


          console.log(
            'RETURNED STATUS NAME:',
            data.statusName
          );


          // ---------------------------------------------
          // Close form
          // ---------------------------------------------

          this.showForm = false;


          // ---------------------------------------------
          // Reset form
          // ---------------------------------------------

          this.resetForm();


          // ---------------------------------------------
          // Reload data
          // ---------------------------------------------

          this.loadLegalFiles();


          this.cdr.detectChanges();

        },


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