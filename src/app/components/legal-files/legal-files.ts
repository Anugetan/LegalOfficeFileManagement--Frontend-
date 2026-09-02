import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
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
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './legal-files.html',
  styleUrl: './legal-files.css'
})
export class LegalFiles implements OnInit {

  // =========================================
  // TABLE DATA
  // =========================================

  legalFiles: LegalFile[] = [];


  // =========================================
  // DROPDOWN DATA
  // =========================================

  statuses: Status[] = [];

  spmsTypes: SpmsType[] = [];

  offices: Office[] = [];

  documentTypes: DocumentType[] = [];

  documentFormats: DocumentFormat[] = [];


  // =========================================
  // FORM VISIBILITY
  // =========================================

  showForm = false;


  // =========================================
  // FORM
  // =========================================

  legalFileForm!: ReturnType<FormBuilder['group']>;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private fb: FormBuilder,
    private legalFileServiceTs: LegalFileServiceTs
  ) {

    this.legalFileForm = this.fb.group({

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

      // Store ID in form
      statusId: [
        null as number | null
      ],

      // Store ID in form
      spmsTypeId: [
        null as number | null
      ],

      // Store ID in form
      requestingOfficeId: [
        null as number | null
      ],

      // Store ID in form
      documentTypeId: [
        null as number | null
      ],

      // Store ID in form
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


  // =========================================
  // INITIALIZE
  // =========================================

  ngOnInit(): void {

    this.loadLegalFiles();

    this.loadStatuses();

    this.loadSpmsTypes();

    this.loadOffices();

    this.loadDocumentTypes();

    this.loadDocumentFormats();

  }


  // =========================================
  // GET ALL LEGAL FILES
  // =========================================

  loadLegalFiles(): void {

    this.legalFileServiceTs
      .getAllLegalFiles()
      .subscribe({

        next: (data: LegalFile[]) => {

          console.log(
            'Legal Files:',
            data
          );

          this.legalFiles = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading legal files:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD STATUSES
  // =========================================

  loadStatuses(): void {

    this.legalFileServiceTs
      .getStatuses()
      .subscribe({

        next: (data: Status[]) => {

          console.log(
            'Statuses:',
            data
          );

          this.statuses = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading statuses:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD SPMS TYPES
  // =========================================

  loadSpmsTypes(): void {

    this.legalFileServiceTs
      .getSpmsTypes()
      .subscribe({

        next: (data: SpmsType[]) => {

          console.log(
            'SPMS Types:',
            data
          );

          this.spmsTypes = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading SPMS types:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD OFFICES
  // =========================================

  loadOffices(): void {

    this.legalFileServiceTs
      .getOffices()
      .subscribe({

        next: (data: Office[]) => {

          console.log(
            'Offices:',
            data
          );

          this.offices = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading offices:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD DOCUMENT TYPES
  // =========================================

  loadDocumentTypes(): void {

    this.legalFileServiceTs
      .getDocumentTypes()
      .subscribe({

        next: (data: DocumentType[]) => {

          console.log(
            'Document Types:',
            data
          );

          this.documentTypes = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading document types:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD DOCUMENT FORMATS
  // =========================================

  loadDocumentFormats(): void {

    this.legalFileServiceTs
      .getDocumentFormats()
      .subscribe({

        next: (data: DocumentFormat[]) => {

          console.log(
            'Document Formats:',
            data
          );

          this.documentFormats = data;

        },

        error: (error: unknown) => {

          console.error(
            'Error loading document formats:',
            error
          );

        }

      });

  }


  // =========================================
  // OPEN CREATE FORM
  // =========================================

  openCreateForm(): void {

    this.showForm = true;

    this.resetForm();

  }


  // =========================================
  // CLOSE CREATE FORM
  // =========================================

  closeCreateForm(): void {

    this.showForm = false;

    this.resetForm();

  }


  // =========================================
  // RESET FORM
  // =========================================

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


 saveLegalFile(): void {

  // =========================================
  // VALIDATE FORM
  // =========================================

  if (this.legalFileForm.invalid) {
    this.legalFileForm.markAllAsTouched();
    return;
  }


  // =========================================
  // GET FORM VALUES
  // =========================================

  const formValue = this.legalFileForm.getRawValue();


  // =========================================
  // BUILD REQUEST
  // =========================================

const legalFile: CreateLegalFile = {

  caseNo: formValue.caseNo!,

  dateReceived: formValue.dateReceived!,

  timeReceived: formValue.timeReceived!,

  dateCompleted: formValue.dateCompleted || null,

  // MUST MATCH LegalFileRequest.java
  statusId: formValue.statusId,

  spmsTypeId: formValue.spmsTypeId,

  requestingOfficeId: formValue.requestingOfficeId,

  documentTypeId: formValue.documentTypeId,

  documentFormatId: formValue.documentFormatId,

  contactDetails: formValue.contactDetails || '',

  currentStage: formValue.currentStage!

};


  // =========================================
  // DEBUG
  // =========================================

  console.log(
    'Sending Legal File:',
    legalFile
  );


  // =========================================
  // SEND TO BACKEND
  // =========================================

  this.legalFileServiceTs
    .createLegalFile(legalFile)
    .subscribe({

      next: (data: LegalFile) => {

        console.log(
          'Legal file created:',
          data
        );


        // Close form
        this.showForm = false;


        // Reset form
        this.resetForm();


        // Reload table
        this.loadLegalFiles();

      },

      error: (error: unknown) => {

        console.error(
          'Error creating legal file:',
          error
        );

      }

    });

}

}