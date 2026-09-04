import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FileUploadResponse } from '../model/fileupload/file-upload';
import { environment } from '../env/environment';

@Injectable({
  providedIn: 'root'
})
export class FileDocumentService {

  private apiUrl =
    `${environment.apiUrl}/file-documents`;

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // UPLOAD DOCUMENT
  // ==========================================

  uploadFile(
    fileId: number,
    file: File,
    documentFormatId?: number | null
  ): Observable<FileUploadResponse> {

    const formData = new FormData();

    // Legal File ID
    formData.append(
      'fileId',
      fileId.toString()
    );

    // Actual uploaded file
    formData.append(
      'file',
      file
    );

    // Document Format
    if (
      documentFormatId !== null &&
      documentFormatId !== undefined
    ) {

      formData.append(
        'documentFormatId',
        documentFormatId.toString()
      );

    }

    return this.http.post<FileUploadResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }


  // ==========================================
  // GET DOCUMENTS FOR A LEGAL FILE
  // ==========================================

  getDocumentsByFileId(
    fileId: number
  ): Observable<FileUploadResponse[]> {

    return this.http.get<FileUploadResponse[]>(
      `${this.apiUrl}/file/${fileId}`
    );
  }


  // ==========================================
  // DOWNLOAD DOCUMENT
  // ==========================================

  downloadFile(
    documentId: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/${documentId}/download`,
      {
        responseType: 'blob'
      }
    );
  }

}