# Legal Office Management System - Frontend

Frontend application for the **Legal Office Management System**.

This application provides a web-based interface for managing legal files, registration requests, proof of service, user authentication, and other legal office processes.

The frontend is built using **Angular** and communicates with a **Spring Boot REST API** backend.

---

# 🚀 Project Overview

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

# 🛠️ Technologies Used

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

# 🏗️ Application Architecture

The frontend communicates with the Spring Boot backend through REST APIs.

```text
┌─────────────────────────┐
│     Angular Frontend    │
│                         │
│  Components             │
│  Services               │
│  Models                 │
│  Routing                │
│  Authentication         │
└────────────┬────────────┘
             │
             │ HTTP / REST API
             ▼
┌─────────────────────────┐
│     Spring Boot API     │
│                         │
│  Controllers            │
│  Services               │
│  Spring Security        │
│  JWT Authentication     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
└─────────────────────────┘


# 👨‍💻 Developer

**Jonathan Eguna**    **Software Engineer**
