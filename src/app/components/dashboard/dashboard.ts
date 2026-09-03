import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { LegalFileServiceTs } from '../../service/legal-file.service.ts';
import { LegalFile } from '../../model/legalFiles/legal-files-model.js';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  // All legal files from backend
  legalFiles: LegalFile[] = [];

  // Files separated by status
  pendingFiles: LegalFile[] = [];
  outFiles: LegalFile[] = [];
  resolvedFiles: LegalFile[] = [];
  archivedFiles: LegalFile[] = [];
  cancelledFiles: LegalFile[] = [];

  constructor(
    private legalFileService: LegalFileServiceTs,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLegalFiles();
  }


  // =========================================================
  // LOAD ALL LEGAL FILES
  // =========================================================

  loadLegalFiles(): void {

    this.legalFileService.getAllLegalFiles().subscribe({

      next: (data: LegalFile[]) => {

        console.log('DASHBOARD LEGAL FILES:', data);

        // Store all files
        this.legalFiles = data;

        // Separate files by status
        this.filterByStatus();

        // Force UI update
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error loading legal files:',
          error
        );

      }

    });

  }


  // =========================================================
  // FILTER FILES BY STATUS
  // =========================================================

  filterByStatus(): void {

    this.pendingFiles = this.legalFiles.filter(
      file =>
        file.statusName?.trim().toLowerCase() === 'pending'
    );


    this.outFiles = this.legalFiles.filter(
      file =>
        file.statusName?.trim().toLowerCase() === 'out'
    );


    this.resolvedFiles = this.legalFiles.filter(
      file =>
        file.statusName?.trim().toLowerCase() === 'resolved'
    );


    this.archivedFiles = this.legalFiles.filter(
      file =>
        file.statusName?.trim().toLowerCase() === 'archived'
    );


    this.cancelledFiles = this.legalFiles.filter(
      file =>
        file.statusName?.trim().toLowerCase() === 'cancelled'
    );

  }

}