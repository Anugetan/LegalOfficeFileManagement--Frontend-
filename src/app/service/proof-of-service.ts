import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../env/environment';
import { CreateProofOfService, ProofOfService } from '../model/proof-of-service/proof-of-service';


@Injectable({
  providedIn: 'root'
})
export class ProofOfServiceService {

  private apiUrl =`${environment.apiUrl}/proof-of-service`;


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // CREATE PROOF OF SERVICE
  // =========================================================

  createProofOfService(
    request: CreateProofOfService
  ): Observable<ProofOfService> {

    return this.http.post<ProofOfService>(
      this.apiUrl,
      request
    );
  }


  // =========================================================
  // GET BY LEGAL FILE
  // =========================================================

  getByFileId(
    fileId: number
  ): Observable<ProofOfService[]> {

    return this.http.get<ProofOfService[]>(
      `${this.apiUrl}/file/${fileId}`
    );
  }

}