import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFinalDocument, FinalDocument } from '../model/final-document/final-document';
import { environment } from '../env/environment';



@Injectable({
  providedIn: 'root'
})
export class FinalDocumentService {

  private apiUrl = `${environment.apiUrl}/final-documents`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // CREATE FINAL DOCUMENT
  // ==========================================

  createFinalDocument(
    request: CreateFinalDocument
  ): Observable<FinalDocument> {

    return this.http.post<FinalDocument>(
      this.apiUrl,
      request
    );
  }

  // ==========================================
  // GET FINAL DOCUMENTS BY LEGAL FILE
  // ==========================================

  getByFileId(
    fileId: number
  ): Observable<FinalDocument[]> {

    return this.http.get<FinalDocument[]>(
      `${this.apiUrl}/file/${fileId}`
    );
  }
}