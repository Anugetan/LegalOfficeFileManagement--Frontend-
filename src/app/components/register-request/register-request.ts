import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { AdminUserService } from '../../service/AdminUserService';
import { PendingUser } from '../../model/auth/pending-users.model';


@Component({
  selector: 'app-registration-requests',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './register-request.html',
  styleUrls: ['./register-request.css']
})
export class RegistrationRequestsComponent implements OnInit {

  pendingUsers: PendingUser[] = [];

  loading = false;

  errorMessage = '';

  successMessage = '';


  constructor(
    private adminUserService: AdminUserService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    console.log(
      'RegistrationRequestsComponent initialized'
    );

    this.loadPendingUsers();
  }


  // =====================================================
  // LOAD PENDING USERS
  // =====================================================

  loadPendingUsers(): void {

    console.log(
      'Calling getPendingUsers()...'
    );


    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.cdr.detectChanges();


    this.adminUserService
      .getPendingUsers()
      .pipe(

        finalize(() => {

          console.log(
            'Request finished'
          );

          this.loading = false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (users: PendingUser[]) => {

          console.log(
            'PENDING USERS RECEIVED:',
            users
          );

          console.log(
            'NUMBER OF USERS:',
            users.length
          );


          this.pendingUsers = users;


          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'ERROR LOADING REGISTRATION REQUESTS:',
            error
          );


          this.errorMessage =
            'Unable to load registration requests.';


          this.cdr.detectChanges();

        }

      });
  }


  // =====================================================
  // APPROVE USER
  // =====================================================

  approveUser(user: PendingUser): void {

    const confirmed = confirm(
      `Are you sure you want to approve ${user.fullName}?`
    );


    if (!confirmed) {
      return;
    }


    this.adminUserService
      .approveUser(user.id)
      .subscribe({

        // ===============================================
        // APPROVED
        // ===============================================

        next: (updatedUser: PendingUser) => {

          console.log(
            'User approved:',
            updatedUser
          );


          this.successMessage =
            `${user.fullName} has been approved successfully.`;


          this.errorMessage = '';


          this.removeUserFromList(
            user.id
          );


          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Error approving user:',
            error
          );


          this.errorMessage =
            'Unable to approve this user.';


          this.cdr.detectChanges();

        }

      });
  }


  // =====================================================
  // REJECT USER
  // =====================================================

  rejectUser(user: PendingUser): void {

    const confirmed = confirm(
      `Are you sure you want to reject ${user.fullName}?`
    );


    if (!confirmed) {
      return;
    }


    this.adminUserService
      .rejectUser(user.id)
      .subscribe({

        // ===============================================
        // REJECTED
        // ===============================================

        next: (updatedUser: PendingUser) => {

          console.log(
            'User rejected:',
            updatedUser
          );


          this.successMessage =
            `${user.fullName} has been rejected.`;


          this.errorMessage = '';


          this.removeUserFromList(
            user.id
          );


          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Error rejecting user:',
            error
          );


          this.errorMessage =
            'Unable to reject this user.';


          this.cdr.detectChanges();

        }

      });
  }


  // =====================================================
  // REMOVE USER FROM DISPLAY
  // =====================================================

  private removeUserFromList(
    userId: number
  ): void {

    this.pendingUsers =
      this.pendingUsers.filter(
        user => user.id !== userId
      );


    this.cdr.detectChanges();

  }

}