import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../service/auth.service.ts';
import { RegisterRequest } from '../../model/auth/register-request.model.ts';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerData: RegisterRequest = {
    username: '',
    fullName: '',
    email: '',
    password: ''
  };

  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  loading = false;

  // =====================================================
  // REGISTRATION POPUP
  // =====================================================

  showSuccessPopup = false;

  // Popup title
  popupTitle = '';

  // Popup message
  popupMessage = '';

  // Popup type
  popupType: 'success' | 'pending' | 'rejected' | 'offline' = 'success';


  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // REGISTER
  // =====================================================

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    // =====================================================
    // VALIDATE FIELDS
    // =====================================================

    if (
      !this.registerData.username ||
      !this.registerData.fullName ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Please complete all fields.';

      this.cdr.detectChanges();

      return;
    }


    // =====================================================
    // VALIDATE PASSWORD
    // =====================================================

    if (
      this.registerData.password !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Passwords do not match.';

      this.cdr.detectChanges();

      return;
    }


    // =====================================================
    // START LOADING
    // =====================================================

    this.loading = true;

    this.cdr.detectChanges();


    // =====================================================
    // SEND REGISTRATION REQUEST
    // =====================================================

    this.authService
      .register(this.registerData)
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (response) => {

          console.log(
            'Registration successful:',
            response
          );

          this.loading = false;

          this.errorMessage = '';

          // =================================================
          // REGISTRATION IS PENDING
          // =================================================

          this.popupType = 'pending';

          this.popupTitle =
            'Registration Submitted';

          this.popupMessage =
            'Your registration request has been submitted successfully. An administrator will review your registration request. You will be able to login after your registration has been approved.';

          this.showSuccessPopup = true;

          this.cdr.detectChanges();
        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'Registration error:',
            error
          );

          this.loading = false;


          // =================================================
          // BACKEND IS NOT REACHABLE
          // =================================================
          //
          // If Spring Boot is stopped, Railway is down,
          // network is unavailable, or the frontend cannot
          // reach the backend, show the popup from Angular.
          //

          if (
            error.status === 0 ||
            error.status === 502 ||
            error.status === 503 ||
            error.status === 504
          ) {

            this.popupType = 'offline';

            this.popupTitle =
              'Registration Service Unavailable';

            this.popupMessage =
              'The registration service is currently unavailable. Please try again later.';

            this.showSuccessPopup = true;

            this.cdr.detectChanges();

            return;
          }


          // =================================================
          // USERNAME / EMAIL ALREADY EXISTS
          // =================================================

          if (error.status === 409) {

            this.errorMessage =
              'Username or email already exists.';

          }


          // =================================================
          // BAD REQUEST
          // =================================================

          else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Invalid registration information.';

          }


          // =================================================
          // FORBIDDEN
          // =================================================

          else if (error.status === 403) {

            this.errorMessage =
              'Access forbidden. Check your Spring Security configuration.';

          }


          // =================================================
          // OTHER ERROR
          // =================================================

          else {

            this.errorMessage =
              error.error?.message ||
              'Registration failed. Please try again.';
          }

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // CLOSE POPUP
  // =====================================================

  closeSuccessPopup(): void {

    this.showSuccessPopup = false;

    this.cdr.detectChanges();

    // Redirect to Login
    this.router.navigate([
      '/login'
    ]);
  }

}