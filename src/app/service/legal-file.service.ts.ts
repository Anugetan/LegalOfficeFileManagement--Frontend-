
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LegalFile,
  Status,
  SpmsType,
  Office,
  DocumentType,
  DocumentFormat
} from '../model/legalFiles/legal-files-model';

import { CreateLegalFile } from '../model/legalFiles/create-legal-files';


@Injectable({
  providedIn: 'root'
})
export class LegalFileServiceTs {

  // =========================================
  // API URLS
  // =========================================

  private apiUrl = '/api/legal-files';

  private lookupUrl = '/api/legal-file-options';


  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // LEGAL FILES
  // =========================================

  getAllLegalFiles(): Observable<LegalFile[]> {

    return this.http.get<LegalFile[]>(
      this.apiUrl
    );

  }


  // =========================================
  // GET LEGAL FILE BY ID
  // =========================================

  getLegalFileById(
    id: number
  ): Observable<LegalFile> {

    return this.http.get<LegalFile>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================
  // GET LEGAL FILE BY CASE NUMBER
  // =========================================

  getLegalFileByCaseNo(
    caseNo: string
  ): Observable<LegalFile> {

    return this.http.get<LegalFile>(
      `${this.apiUrl}/case/${encodeURIComponent(caseNo)}`
    );

  }


  // =========================================
  // CREATE LEGAL FILE
  // =========================================

  createLegalFile(
    legalFile: CreateLegalFile
  ): Observable<LegalFile> {

    return this.http.post<LegalFile>(
      this.apiUrl,
      legalFile
    );

  }


  // =========================================
  // UPDATE LEGAL FILE
  // =========================================

  updateLegalFile(
    id: number,
    legalFile: CreateLegalFile
  ): Observable<LegalFile> {

    return this.http.put<LegalFile>(
      `${this.apiUrl}/${id}`,
      legalFile
    );

  }


  // =========================================
  // DELETE LEGAL FILE
  // =========================================

  deleteLegalFile(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================
  // DROPDOWN OPTIONS
  // =========================================

  // =========================================
  // GET STATUSES
  // =========================================

  getStatuses(): Observable<Status[]> {

    return this.http.get<Status[]>(
      `${this.lookupUrl}/statuses`
    );

  }


  // =========================================
  // GET SPMS TYPES
  // =========================================

  getSpmsTypes(): Observable<SpmsType[]> {

    return this.http.get<SpmsType[]>(
      `${this.lookupUrl}/spms-types`
    );

  }


  // =========================================
  // GET OFFICES
  // =========================================

  getOffices(): Observable<Office[]> {

    return this.http.get<Office[]>(
      `${this.lookupUrl}/offices`
    );

  }


  // =========================================
  // GET DOCUMENT TYPES
  // =========================================

  getDocumentTypes(): Observable<DocumentType[]> {

    return this.http.get<DocumentType[]>(
      `${this.lookupUrl}/document-types`
    );

  }


  // =========================================
  // GET DOCUMENT FORMATS
  // =========================================

  getDocumentFormats(): Observable<DocumentFormat[]> {

    return this.http.get<DocumentFormat[]>(
      `${this.lookupUrl}/document-formats`
    );

  }

}

