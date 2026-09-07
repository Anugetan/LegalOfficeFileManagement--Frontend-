import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  InitialReview,
  InitialReviewRequest
} from '../model/initial-review/initial-review';
import { environment } from '../env/environment';


@Injectable({
  providedIn: 'root'
})
export class InitialReviewService {

  private apiUrl = `${environment.apiUrl}/initial-reviews`;

  constructor(
    private http: HttpClient
  ) {}

  createReview(
    request: InitialReviewRequest
  ): Observable<InitialReview> {

    return this.http.post<InitialReview>(
      this.apiUrl,
      request
    );
  }

  getReviewsByFile(
    fileId: number
  ): Observable<InitialReview[]> {

    return this.http.get<InitialReview[]>(
      `${this.apiUrl}/file/${fileId}`
    );
  }
}