import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PendingUser } from '../model/auth/pending-users.model';
import { environment } from '../env/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient
  ) {}

  getPendingUsers(): Observable<PendingUser[]> {

    return this.http.get<PendingUser[]>(
      `${this.apiUrl}/registration-requests`
    );
  }

  approveUser(id: number): Observable<PendingUser> {

    return this.http.put<PendingUser>(
      `${this.apiUrl}/users/${id}/approve`,
      {}
    );
  }

  rejectUser(id: number): Observable<PendingUser> {

    return this.http.put<PendingUser>(
      `${this.apiUrl}/users/${id}/reject`,
      {}
    );
  }
}