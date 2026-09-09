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

  // Registration success popup
  showSuccessPopup = false;


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

          /*
           * Do NOT automatically login.
           *
           * The account is now:
           *
           * registrationStatus = PENDING
           * active = false
           *
           * The administrator must approve it first.
           */

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


          if (error.status === 409) {

            this.errorMessage =
              'Username or email already exists.';

          } else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Invalid registration information.';

          } else if (error.status === 403) {

            this.errorMessage =
              'Access forbidden. Check your Spring Security configuration.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Registration failed. Please try again.';

          }

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // CLOSE SUCCESS POPUP
  // =====================================================

  closeSuccessPopup(): void {

    this.showSuccessPopup = false;

    this.cdr.detectChanges();

    // Redirect user to Login
    this.router.navigate([
      '/login'
    ]);
  }

}