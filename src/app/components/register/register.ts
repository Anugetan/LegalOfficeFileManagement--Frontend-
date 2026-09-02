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

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

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

    if (
      this.registerData.password !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Passwords do not match.';

      this.cdr.detectChanges();

      return;
    }

    this.loading = true;

    this.cdr.detectChanges();

    this.authService
      .register(this.registerData)
      .subscribe({

        next: (response) => {

          console.log(
            'Registration successful:',
            response
          );

          this.loading = false;

          this.successMessage =
            'Registration successful! Redirecting to login...';

          this.cdr.detectChanges();

          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 1500);
        },

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
}