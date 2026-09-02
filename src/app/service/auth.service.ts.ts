import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../model/auth/login-request.model.ts';
import { AuthResponse } from '../model/auth/auth-response.model.ts.js';
import { RegisterRequest } from '../model/auth/register-request.model.ts.js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/auth';

  constructor(
    private http: HttpClient
  ) {}

  // =========================
  // LOGIN
  // =========================

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(

        tap(response => {

          console.log('Login response:', response);

          localStorage.setItem(
            'token',
            response.token
          );

          localStorage.setItem(
            'username',
            response.username
          );

          localStorage.setItem(
            'fullName',
            response.fullName
          );

          localStorage.setItem(
            'role',
            response.role
          );

        })
      );
  }

  // =========================
  // REGISTER
  // =========================

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      request
    );
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
  }

  // =========================
  // GET TOKEN
  // =========================

  getToken(): string | null {

    return localStorage.getItem('token');
  }

  // =========================
  // CHECK LOGIN
  // =========================

  isLoggedIn(): boolean {

    return !!this.getToken();
  }
}