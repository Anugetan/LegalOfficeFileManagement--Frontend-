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

  loginData: LoginRequest = {
    username: '',
    password: ''
  };

  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(): void {

    this.errorMessage = '';

    if (
      !this.loginData.username ||
      !this.loginData.password
    ) {

      this.errorMessage =
        'Username and password are required.';

      this.cdr.detectChanges();

      return;
    }

    this.loading = true;

    this.cdr.detectChanges();

    this.authService
      .login(this.loginData)
      .subscribe({

        next: (response) => {

          console.log(
            'Login successful:',
            response
          );

          this.loading = false;

          this.cdr.detectChanges();

          this.router.navigate([
            '/dashboard'
          ]);
        },

        error: (error) => {

          console.error(
            'Login error:',
            error
          );

          this.loading = false;

          if (error.status === 401) {

            this.errorMessage =
              'Invalid username or password.';

          } else if (error.status === 403) {

            this.errorMessage =
              'Access forbidden. Check your Spring Security configuration.';

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