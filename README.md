# Legal Office Management System - Frontend

Frontend application for the **Legal Office Management System**.

This application provides a web-based interface for managing legal files, registration requests, proof of service, user authentication, and other legal office processes.

The frontend is built using **Angular** and communicates with a **Spring Boot REST API** backend.

---

## 🚀 Project Overview

The Legal Office Management System is designed to help legal offices manage and track files throughout their workflow.

The frontend provides interfaces for:

- User registration
- User login
- Administrator registration approval
- Dashboard
- Legal file management
- Legal file tracking
- Proof of Service
- User access control
- File and document information
- Status tracking
- Communication with the backend REST API

---

## 🛠️ Technologies Used

### Frontend

- Angular
- TypeScript
- HTML5
- CSS3
- Bootstrap
- RxJS

### Backend Integration

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- REST API

### Database

- PostgreSQL

### Development Tools

- Visual Studio Code
- Eclipse
- Postman
- Git
- GitHub

---

## 🏗️ Application Architecture

The frontend communicates with the Spring Boot backend through REST APIs.


Angular Frontend
      |
      | HTTP / REST API
      v
Spring Boot Backend
      |
      | JPA / Hibernate
      v
PostgreSQL Database

The frontend is organized using Angular components, services, models, routing, and authentication functionality.

🔐 Authentication

The application uses JWT authentication.

The authentication process is:

User
  |
  v
Login
  |
  v
Angular AuthService
  |
  v
Spring Boot Authentication API
  |
  v
Spring Security
  |
  v
JWT Token
  |
  v
Angular Local Storage
  |
  v
Authenticated Requests

The JWT token is sent with protected backend requests.

Example:

Authorization: Bearer <JWT_TOKEN>
👤 User Registration

New users can register through the registration page.

The system uses an administrator approval workflow.

User Registration
       |
       v
    PENDING
       |
       v
Administrator Review
       |
       +----------------+
       |                |
       v                v
   APPROVED          REJECTED
       |                |
       v                v
   Can Login        Login Blocked

A newly registered user cannot access the system until the administrator approves the registration request.

👨‍💼 Registration Requests

Administrators can access the Registration Requests page.

The administrator can:

View pending users
Approve users
Reject users
Refresh registration requests

Workflow:

Registration Request
        |
        v
      PENDING
        |
   Administrator
      Review
        |
   +----+----+
   |         |
   v         v
APPROVE    REJECT
   |         |
   v         v
APPROVED  REJECTED
   |         |
   v         v
Can Login  Cannot Login

The backend also enforces administrator authorization for these operations.

📊 Dashboard

The dashboard provides an overview of the Legal Office Management System.

The main navigation includes:

Dashboard
Legal Files
Proof of Service
Registration Requests
Logout

The available functionality can be controlled based on the authenticated user's role.

📁 Legal Files

The Legal Files module is used to manage and track legal files.

The interface provides information such as:

Case Number
Date Received
Time Received
Date Completed
Status
SPMS Type
Requesting Office
Document Type
Document Format
Contact Details
Current Stage
Created By
Created Date
Updated Date
📋 Legal File Tracking

Legal files move through different stages of processing.

Example workflow:

RECEIVED
   |
   v
INITIAL REVIEW
   |
   v
PROCESSING
   |
   v
FINAL REVIEW
   |
   v
COMPLETED

The frontend displays the current status and stage of each legal file.

📬 Proof of Service

The Proof of Service module allows users to manage proof of service information related to legal files.

Users can access Proof of Service from the main navigation.

Proof of Service records are associated with legal files using the backend REST API.

🌐 Routing

The application uses Angular Router.

Main routes include:

/login
/register

/menubar
/menubar/dashboard
/menubar/legal-files
/menubar/proof-of-service
/menubar/proof-of-service/:fileId
/menubar/register-request

The root route redirects to:

/login
📂 Project Structure

The Angular project follows a component, service, and model based structure.

src/
└── app/
    │
    ├── components/
    │   │
    │   ├── login/
    │   │   ├── login.ts
    │   │   ├── login.html
    │   │   └── login.css
    │   │
    │   ├── register/
    │   │   ├── register.ts
    │   │   ├── register.html
    │   │   └── register.css
    │   │
    │   ├── dashboard/
    │   │   ├── dashboard.ts
    │   │   ├── dashboard.html
    │   │   └── dashboard.css
    │   │
    │   ├── menubar/
    │   │   ├── menu.ts
    │   │   ├── menu.html
    │   │   └── menu.css
    │   │
    │   ├── legal-files/
    │   │   ├── legal-files.ts
    │   │   ├── legal-files.html
    │   │   └── legal-files.css
    │   │
    │   ├── proof-of-service/
    │   │   ├── proof-of-service.ts
    │   │   ├── proof-of-service.html
    │   │   └── proof-of-service.css
    │   │
    │   └── register-request/
    │       ├── register-request.ts
    │       ├── register-request.html
    │       └── register-request.css
    │
    ├── model/
    │   ├── auth/
    │   │   ├── auth-response.model.ts
    │   │   ├── login-request.model.ts
    │   │   ├── register-request.model.ts
    │   │   └── pending-users.model.ts
    │   │
    │   └── legalFiles/
    │       └── legal-files-model.ts
    │
    ├── service/
    │   ├── auth.service.ts
    │   ├── AdminUserService.ts
    │   ├── legal-file.service.ts
    │   └── ...
    │
    ├── env/
    │   └── environment.ts
    │
    ├── app.routes.ts
    └── ...
🔌 Services

Angular services are responsible for communication between the frontend and the Spring Boot backend.

AuthService

Responsible for:

User registration
User login
Authentication state
JWT storage
User information

Main endpoints:

POST /api/auth/register
POST /api/auth/login
AdminUserService

Responsible for administrator registration management.

Functions include:

getPendingUsers()
approveUser()
rejectUser()

Backend endpoints:

GET /api/admin/registration-requests

PUT /api/admin/users/{id}/approve

PUT /api/admin/users/{id}/reject
Legal File Service

Responsible for communication between the Legal Files component and the backend.

It handles operations related to:

Creating legal files
Retrieving legal files
Updating legal files
File status
File workflow
Document information
🧩 Models

Models define the structure of data received from and sent to the backend.

Examples include:

AuthResponse
LoginRequest
RegisterRequest
PendingUser
LegalFile

Example PendingUser model:

export interface PendingUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: string;
  active: boolean;
  registrationStatus: string;
  createdAt: string;
}
🛡️ Role-Based Access

The application supports user roles.

Example roles:

ADMIN
USER

Administrators can access administrative functions such as:

Registration Requests

The backend also enforces authorization rules.

The frontend should not be treated as the only security layer.

💾 Local Storage

After successful authentication, the application stores authentication information in the browser's local storage.

Example information:

JWT Token
User ID
Username
Full Name
Role

The JWT token is used when accessing protected backend endpoints.

⚙️ Environment Configuration

Backend API configuration is stored in the Angular environment configuration.

Example development configuration:

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

For production, the API URL should point to the deployed Spring Boot backend.

Example:

export const environment = {
  production: true,
  apiUrl: 'YOUR_PRODUCTION_API_URL'
};

Do not commit private credentials or secrets to GitHub.

▶️ Running the Frontend Locally
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
2. Navigate to the project
cd LegalOfficeFrontend
3. Install dependencies
npm install
4. Start the Angular development server
ng serve

Or:

npm start

The application will normally be available at:

http://localhost:4200
🔗 Backend Requirement

The Angular frontend requires the Spring Boot backend to be running.

Example local configuration:

Frontend
http://localhost:4200
        |
        v
Backend
http://localhost:8080
        |
        v
PostgreSQL

Make sure the backend is running before testing features that require API communication.

🧪 Testing

The frontend can be tested together with the backend using:

Browser Developer Tools
Postman
Angular development server

Recommended test flow:

1. Open Registration
        |
        v
2. Create User Account
        |
        v
3. Registration becomes PENDING
        |
        v
4. Login as ADMIN
        |
        v
5. Open Registration Requests
        |
        v
6. Approve User
        |
        v
7. Login as Approved User
        |
        v
8. Access Dashboard
        |
        v
9. Manage Legal Files
🚨 Registration Messages

The application provides user feedback for different registration states.

Successful Registration
Registration Submitted

Your registration request has been submitted successfully.

An administrator will review your registration request.

You will be able to login after your registration has been approved.
Pending Account
Your registration is still pending administrator approval.
Rejected Account
You don't have permission to access the Legal Office system.

Your registration request was rejected by the administrator.
🔄 Application Flow

The complete frontend workflow is:

                    REGISTER
                       |
                       v
                    PENDING
                       |
                       v
              ADMINISTRATOR REVIEW
                       |
                +------+------+
                |             |
                v             v
             APPROVE        REJECT
                |             |
                v             v
            APPROVED       REJECTED
                |             |
                v             v
              LOGIN       LOGIN BLOCKED
                |
                v
             JWT TOKEN
                |
                v
            DASHBOARD
                |
        +-------+-------+
        |               |
        v               v
   LEGAL FILES    PROOF OF SERVICE
🚀 Production Deployment

The frontend can be deployed using Vercel.

Typical production architecture:

┌──────────────────────────┐
│          Vercel          │
│                          │
│    Angular Frontend      │
└────────────┬─────────────┘
             |
             | HTTPS / REST API
             v
┌──────────────────────────┐
│         Railway          │
│                          │
│     Spring Boot API      │
└────────────┬─────────────┘
             |
             v
┌──────────────────────────┐
│       PostgreSQL         │
└──────────────────────────┘
📦 Build for Production

To create a production build:

ng build

The generated production files will be placed in the Angular build output directory.

These files can then be deployed to a hosting platform such as Vercel.

🌍 Deployment Configuration

Before deploying, update the frontend API configuration to use the production backend.

Example:

export const environment = {
  production: true,
  apiUrl: 'YOUR_RAILWAY_BACKEND_API_URL'
};

The backend must also allow requests from the deployed frontend domain through CORS.

🔒 Security Considerations

The application follows several security practices:

JWT-based authentication
Spring Security authorization
BCrypt password hashing
Role-based access
Protected backend endpoints
Registration approval workflow
HTTPS in production
Environment-based API configuration

The frontend should never be treated as the only security layer.

Authorization must always be enforced by the backend.

📱 Responsive Interface

The application interface is designed for use on different screen sizes.

Main interface elements include:

Sidebar navigation
Dashboard
Tables
Forms
Status indicators
Registration approval interface
Confirmation dialogs
Success and error messages
📄 License

This project is developed for the management of legal office files and related administrative processes.

👨‍💻 Developer

Jonathan Eguna

Software Engineer
