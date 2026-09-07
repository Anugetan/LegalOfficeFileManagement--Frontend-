import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  LegalFile
} from '../../model/legalFiles/legal-files-model.js';

import {
  LegalFileServiceTs
} from '../../service/legal-file.service.js';



import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FinalDocumentService } from '../../service/FinalDocumentService.js';
import { FinalDocument } from '../../model/final-document/final-document.js';


@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // =========================================================
  // ALL LEGAL FILES
  // =========================================================

  legalFiles: LegalFile[] = [];


  // =========================================================
  // STATUS FILES
  // =========================================================

  pendingFiles: LegalFile[] = [];

  outFiles: LegalFile[] = [];

  resolvedFiles: LegalFile[] = [];

  archivedFiles: LegalFile[] = [];

  cancelledFiles: LegalFile[] = [];


  // =========================================================
  // FINAL DOCUMENTS
  // =========================================================

  finalDocuments: FinalDocument[] = [];

  finalDocumentFiles: LegalFile[] = [];

  loadingFinalDocuments = false;


  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  recentFiles: LegalFile[] = [];


  // =========================================================
  // LOADING
  // =========================================================

  loading = false;


  // =========================================================
  // ERROR
  // =========================================================

  errorMessage = '';


  constructor(
    private legalFileService: LegalFileServiceTs,
    private finalDocumentService: FinalDocumentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZE
  // =========================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  loadDashboard(): void {

    this.loading = true;
    this.errorMessage = '';

    this.legalFileService
      .getAllLegalFiles()
      .subscribe({

        next: (data: LegalFile[]) => {

          console.log(
            'DASHBOARD LEGAL FILES:',
            data
          );

          this.legalFiles = data || [];

          this.filterByStatus();

          this.prepareRecentFiles();

          this.loadFinalDocuments();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading dashboard files:',
            error
          );

          this.loading = false;

          this.errorMessage =
            'Unable to load legal files.';

          this.cdr.detectChanges();
        }

      });

  }


  // =========================================================
  // FILTER BY STATUS
  // =========================================================

  filterByStatus(): void {

    this.pendingFiles =
      this.legalFiles.filter(
        file =>
          file.statusName
            ?.trim()
            .toLowerCase() === 'pending'
      );


    this.outFiles =
      this.legalFiles.filter(
        file =>
          file.statusName
            ?.trim()
            .toLowerCase() === 'out'
      );


    this.resolvedFiles =
      this.legalFiles.filter(
        file =>
          file.statusName
            ?.trim()
            .toLowerCase() === 'resolved'
      );


    this.archivedFiles =
      this.legalFiles.filter(
        file =>
          file.statusName
            ?.trim()
            .toLowerCase() === 'archived'
      );


    this.cancelledFiles =
      this.legalFiles.filter(
        file =>
          file.statusName
            ?.trim()
            .toLowerCase() === 'cancelled'
      );

  }


  // =========================================================
  // LOAD FINAL DOCUMENTS
  // =========================================================

  loadFinalDocuments(): void {

    this.loadingFinalDocuments = true;

    this.finalDocuments = [];

    this.finalDocumentFiles = [];


    /*
     * Only RESOLVED files can have final documents
     */

    if (this.resolvedFiles.length === 0) {

      this.loadingFinalDocuments = false;

      this.cdr.detectChanges();

      return;
    }


    const requests =
      this.resolvedFiles.map(file =>

        this.finalDocumentService
          .getByFileId(file.id)
          .pipe(
            catchError(error => {

              console.error(
                `Error loading final documents for file ${file.id}:`,
                error
              );

              return of([]);

            })
          )

      );


    forkJoin(requests)
      .subscribe({

        next: (results: FinalDocument[][]) => {

          results.forEach(
            (documents: FinalDocument[]) => {

              if (
                documents &&
                documents.length > 0
              ) {

                this.finalDocuments.push(
                  ...documents
                );

              }

            }
          );


          /*
           * Sort newest final documents first
           */

          this.finalDocuments.sort(
            (a, b) => {

              const dateA =
                a.finalizedAt
                  ? new Date(a.finalizedAt).getTime()
                  : 0;

              const dateB =
                b.finalizedAt
                  ? new Date(b.finalizedAt).getTime()
                  : 0;

              return dateB - dateA;

            }
          );


          /*
           * Find the legal files that have
           * at least one final document
           */

          const fileIds =
            new Set(
              this.finalDocuments.map(
                document => document.fileId
              )
            );


          this.finalDocumentFiles =
            this.legalFiles.filter(
              file => fileIds.has(file.id)
            );


          this.loadingFinalDocuments = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading final documents:',
            error
          );

          this.loadingFinalDocuments = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // RECENT FILES
  // =========================================================

  prepareRecentFiles(): void {

    this.recentFiles =
      [...this.legalFiles]
        .sort((a, b) => {

          const dateA =
            a.createdAt
              ? new Date(a.createdAt).getTime()
              : 0;

          const dateB =
            b.createdAt
              ? new Date(b.createdAt).getTime()
              : 0;

          return dateB - dateA;

        })
        .slice(0, 6);

  }


  // =========================================================
  // STATUS COUNT
  // =========================================================

  get totalFiles(): number {

    return this.legalFiles.length;

  }


  // =========================================================
  // FINAL DOCUMENT COUNT
  // =========================================================

  get finalDocumentCount(): number {

    return this.finalDocuments.length;

  }


  // =========================================================
  // GET STATUS CLASS
  // =========================================================

  getStatusClass(file: LegalFile): string {

    const status =
      file.statusName
        ?.trim()
        .toLowerCase();


    switch (status) {

      case 'pending':
        return 'pending';

      case 'out':
        return 'out';

      case 'resolved':
        return 'resolved';

      case 'archived':
        return 'archived';

      case 'cancelled':
        return 'cancelled';

      default:
        return 'pending';

    }

  }


  // =========================================================
  // GET STAGE LABEL
  // =========================================================

  getStageLabel(file: LegalFile): string {

    if (!file.currentStage) {
      return 'Received';
    }

    return file.currentStage
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );

  }


  // =========================================================
  // GET ACTIVITY TITLE
  // =========================================================

  getActivityTitle(file: LegalFile): string {

    const stage =
      file.currentStage
        ?.toUpperCase();


    switch (stage) {

      case 'RECEIVED':
        return 'New legal file received';

      case 'INITIAL_REVIEW':
        return 'File under initial review';

      case 'FINAL_REVIEW':
        return 'File under final review';

      case 'RESOLVED':
        return 'File resolved';

      case 'OUT':
        return 'File sent out';

      default:
        return 'Legal file updated';

    }

  }


  // =========================================================
  // GET ACTIVITY ICON
  // =========================================================

  getActivityIcon(file: LegalFile): string {

    const stage =
      file.currentStage
        ?.toUpperCase();


    switch (stage) {

      case 'RECEIVED':
        return '＋';

      case 'INITIAL_REVIEW':
        return '📝';

      case 'FINAL_REVIEW':
        return '✓';

      case 'RESOLVED':
        return '✓';

      case 'OUT':
        return '➤';

      default:
        return '📄';

    }

  }


  // =========================================================
  // VIEW LEGAL FILE
  // =========================================================

  viewLegalFiles(): void {

    this.router.navigate([
      '/menubar/legal-files'
    ]);

  }


  // =========================================================
  // VIEW PROOF OF SERVICE
  // =========================================================

  viewProofOfService(): void {

    this.router.navigate([
      '/menubar/proof-of-service'
    ]);

  }


  // =========================================================
  // ADD LEGAL FILE
  // =========================================================

  addLegalFile(): void {

    this.router.navigate([
      '/menubar/legal-files'
    ]);

  }


  // =========================================================
  // VIEW FILE
  // =========================================================

  viewFile(file: LegalFile): void {

    /*
     * Currently opens Legal Files page.
     *
     * Later you can change this to:
     *
     * /menubar/legal-files/:id
     *
     * if you create a detail page.
     */

    this.router.navigate([
      '/menubar/legal-files'
    ]);

  }


  // =========================================================
  // VIEW FINAL DOCUMENTS
  // =========================================================

  viewFinalDocuments(): void {

    this.router.navigate([
      '/menubar/legal-files'
    ]);

  }


  // =========================================================
  // REFRESH
  // =========================================================

  refreshDashboard(): void {

    this.loadDashboard();

  }

}