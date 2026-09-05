import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFileReview, FileReview } from '../model/file-review/file-review';
import { environment } from '../env/environment';




@Injectable({
  providedIn: 'root'
})
export class FileReviewService {

  private readonly apiUrl = `${environment.apiUrl}/file-reviews`;


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // CREATE REVIEW
  // =====================================================

  createReview(
    request: CreateFileReview
  ): Observable<FileReview> {

    return this.http.post<FileReview>(
      this.apiUrl,
      request
    );
  }


  // =====================================================
  // GET ALL REVIEWS FOR FILE
  // =====================================================

  getReviewsByFile(
    fileId: number
  ): Observable<FileReview[]> {

    return this.http.get<FileReview[]>(
      `${this.apiUrl}/file/${fileId}`
    );
  }


  // =====================================================
  // GET REVIEWS BY TYPE
  // =====================================================

  getReviewsByType(
    fileId: number,
    reviewType: string
  ): Observable<FileReview[]> {

    return this.http.get<FileReview[]>(
      `${this.apiUrl}/file/${fileId}/type/${reviewType}`
    );
  }
}