import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LoginRequest } from '../../model/auth/login-request.model.ts';
import { AuthService } from '../../service/auth.service.ts.js';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // =========================================
  // LOGIN DATA
  // =========================================

  loginData: LoginRequest = {
    username: '',
    password: ''
  };


  // =========================================
  // REMEMBER USERNAME
  // =========================================

  rememberUsername = false;


  // =========================================
  // LOGIN STATE
  // =========================================

  errorMessage = '';

  loading = false;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================
  // LOGIN
  // =========================================

  login(): void {

    // Clear previous error
    this.errorMessage = '';


    // =======================================
    // VALIDATE INPUT
    // =======================================

    if (
      !this.loginData.username ||
      !this.loginData.password
    ) {

      this.errorMessage =
        'Username and password are required.';

      this.cdr.detectChanges();

      return;
    }


    // =======================================
    // LOADING
    // =======================================

    this.loading = true;

    this.cdr.detectChanges();


    // =======================================
    // CALL BACKEND LOGIN API
    // =======================================

    this.authService
      .login(this.loginData)
      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (response) => {

          console.log(
            'Login successful:',
            response
          );


          this.loading = false;

          this.cdr.detectChanges();


          // =================================
          // SAVE USERNAME
          // =================================

          if (this.rememberUsername) {

            localStorage.setItem(
              'rememberedUsername',
              this.loginData.username
            );

          } else {

            localStorage.removeItem(
              'rememberedUsername'
            );

          }


          // =================================
          // GO TO MENU BAR
          // =================================

          this.router.navigate([
            '/menubar'
          ]);
        },


        // ===================================
        // ERROR
        // ===================================

        error: (error) => {

          console.error(
            'Login error:',
            error
          );


          this.loading = false;


          // =================================
          // 401 - INVALID LOGIN
          // =================================

          if (error.status === 401) {

            this.errorMessage =
              'Invalid username or password.';


          // =================================
          // 403 - FORBIDDEN
          // =================================

          } else if (error.status === 403) {

            this.errorMessage =
              'Access forbidden. Check your Spring Security configuration.';


          // =================================
          // OTHER ERROR
          // =================================

          } else {

            this.errorMessage =
              error.error?.message ||
              'Login failed. Please try again.';
          }


          this.cdr.detectChanges();
        }
      });
  }
}