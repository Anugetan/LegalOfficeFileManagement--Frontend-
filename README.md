# Legal Office Management System

A web-based **Legal Office Management System** for managing, monitoring, and tracking legal files throughout their processing workflow.

Built with **Angular**, **Spring Boot**, and **PostgreSQL**.

## Features

* User registration and login
* JWT authentication
* Legal file management
* Case and status tracking
* Document type and format management
* File actions and reviews
* Final document and proof of service management
* Dashboard for monitoring legal files

## Technology Stack

**Frontend**

* Angular 21
* TypeScript
* HTML & CSS
* RxJS

**Backend**

* Java
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA
* Maven

**Database**

* PostgreSQL

**Tools**

* Visual Studio Code
* Eclipse
* Git & GitHub
* Postman

## System Architecture

```text
Angular Frontend
       ↓
  REST API / HTTP
       ↓
Spring Boot Backend
       ↓
   JPA / Hibernate
       ↓
PostgreSQL Database
```

### Authentication

```text
Angular
   ↓
Login / Register
   ↓
Spring Boot
   ↓
Spring Security + JWT
   ↓
PostgreSQL
```

## Legal File Workflow

```text
RECEIVED
    ↓
INITIAL REVIEW
    ↓
FOR REVIEW
    ↓
FINAL DOCUMENT
    ↓
COMPLETED
```

## Database

Main tables:

```text
users
statuses
spms_types
offices
document_types
logbook_types
document_formats
legal_files
file_actions
file_documents
initial_reviews
file_reviews
final_documents
proof_of_service
```

The `legal_files` table serves as the **central record** of the system.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
ng serve
```

Open:

```text
http://localhost:4200/
```

Build the project:

```bash
ng build
```

Run tests:

```bash
ng test
```

## Deployment

Planned deployment:

```text
Angular Frontend → Vercel
Spring Boot API  → Railway
PostgreSQL       → Database Server
```

## Project Status

* [/] Angular project setup
* [/] Login & registration
* [/] JWT authentication
* [/] Dashboard
* [/] Legal Files interface
* [/] PostgreSQL database
* [/] Spring Boot backend foundation
* [/] Legal file editing
* [/] Status updating
* [/] Document management
* [/] Review workflow
* [/] Production deployment

## Author

**Jonathan Eguna**

Built with **Angular, Spring Boot, Java, Spring Security, JWT, and PostgreSQL**.
