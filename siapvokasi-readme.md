# SIAP Vokasi API

API Backend untuk sistem manajemen layanan vokasi yang dibangun dengan NestJS, Prisma, dan PostgreSQL.

## 📋 Deskripsi

SIAP Vokasi API adalah sistem backend yang mengelola berbagai layanan vokasi dengan fitur manajemen pengguna, role-based access control (RBAC), aplikasi layanan, dan workflow approval bertingkat.

## 🏗️ Arsitektur Sistem

### Stack Teknologi

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7.x
- **Database**: PostgreSQL 17 (melalui Prisma ORM)
- **Authentication**: JWT + Passport
- **Authorization**: CASL (Attribute-Based Access Control)
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Email**: Nodemailer
- **File Upload**: Multer
- **Containerization**: Docker & Docker Compose

### Diagram Arsitektur

```mermaid
graph TB
    Client[Client Application]

    subgraph "API Layer"
        Gateway[API Gateway<br/>Port 3000]
        Swagger[Swagger Docs<br/>/api-docs]
    end

    subgraph "Middleware Layer"
        Auth[JWT Auth Guard]
        CASL[CASL Authorization]
        Validation[Validation Pipe]
        Logger[Pino Logger]
        CORS[CORS & Helmet]
    end

    subgraph "Application Layer"
        AuthModule[Auth Module]
        UsersModule[Users Module]
        RolesModule[Roles Module]
        PermissionsModule[Permissions Module]
        ApplicationsModule[Applications Module]
        ServicesModule[Services Module]
        FaqModule[FAQ Module]
        ProfileModule[Profile Module]
    end

    subgraph "Core Services"
        PrismaService[Prisma Service<br/>Database ORM]
        MailerService[Mailer Service<br/>Email Notifications]
        CaslFactory[CASL Ability Factory<br/>Permission Engine]
    end

    subgraph "Infrastructure"
        PostgreSQL[(PostgreSQL 17<br/>Database)]
        FileSystem[File System<br/>Uploads Storage]
        SMTP[SMTP Server<br/>Email Delivery]
    end

    Client --> Gateway
    Gateway --> Swagger
    Gateway --> Auth
    Auth --> CASL
    CASL --> Validation
    Validation --> Logger
    Logger --> CORS

    CORS --> AuthModule
    CORS --> UsersModule
    CORS --> RolesModule
    CORS --> PermissionsModule
    CORS --> ApplicationsModule
    CORS --> ServicesModule
    CORS --> FaqModule
    CORS --> ProfileModule

    AuthModule --> PrismaService
    AuthModule --> MailerService
    UsersModule --> PrismaService
    UsersModule --> CaslFactory
    RolesModule --> PrismaService
    RolesModule --> CaslFactory
    PermissionsModule --> PrismaService
    ApplicationsModule --> PrismaService
    ApplicationsModule --> CaslFactory
    ServicesModule --> PrismaService

    PrismaService --> PostgreSQL
    MailerService --> SMTP
    ApplicationsModule --> FileSystem
    ServicesModule --> FileSystem
```

### Flow Data Request

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Guard
    participant CA as CASL Guard
    participant M as Module/Controller
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>G: HTTP Request
    G->>A: Validate JWT Token
    A->>CA: Check Permissions
    CA->>M: Route to Controller
    M->>S: Business Logic
    S->>P: Query Builder
    P->>DB: SQL Query
    DB-->>P: Result Set
    P-->>S: Typed Data
    S-->>M: Processed Data
    M-->>G: Response DTO
    G-->>C: JSON Response
```

## 📁 Struktur Direktori

```
siap-vokasi-api/
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── migrations/             # Database migrations
│   ├── seed.ts                 # Database seeder
│   └── scripts/                # Database utility scripts
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   │
│   ├── auth/                   # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts     # JWT, login, register, password reset
│   │   ├── auth.controller.ts
│   │   ├── jwt.strategy.ts     # Passport JWT strategy
│   │   ├── jwt-auth.guard.ts   # JWT authentication guard
│   │   └── dto/                # Auth DTOs
│   │
│   ├── users/                  # User management module
│   │   ├── users.module.ts
│   │   ├── users.service.ts    # User CRUD operations
│   │   ├── users.controller.ts
│   │   └── dto/                # User DTOs
│   │
│   ├── roles/                  # Role management module
│   │   ├── roles.module.ts
│   │   ├── roles.service.ts    # Role CRUD & assignment
│   │   ├── roles.controller.ts
│   │   └── dto/
│   │
│   ├── permissions/            # Permission management module
│   │   ├── permissions.module.ts
│   │   ├── permissions.service.ts
│   │   ├── permissions.controller.ts
│   │   └── dto/
│   │
│   ├── casl/                   # Authorization (CASL)
│   │   ├── casl.module.ts
│   │   ├── casl-ability.factory.ts  # Ability builder
│   │   ├── abilities.guard.ts       # CASL authorization guard
│   │   └── abilities.decorator.ts   # Custom decorators
│   │
│   ├── applications/           # Application/Submission module
│   │   ├── applications.module.ts
│   │   ├── applications.service.ts  # Application workflow logic
│   │   ├── applications.controller.ts
│   │   ├── public-applications.controller.ts
│   │   └── dto/
│   │
│   ├── services/               # Service catalog module
│   │   ├── services.module.ts
│   │   ├── services.service.ts      # Service CRUD
│   │   ├── services.controller.ts
│   │   ├── requirements.service.ts  # Requirements management
│   │   ├── requirements.controller.ts
│   │   ├── public-services.controller.ts
│   │   └── dto/
│   │
│   ├── faq/                    # FAQ module
│   │   ├── faq.module.ts
│   │   ├── faq.service.ts
│   │   ├── faq.controller.ts
│   │   ├── public-faq.controller.ts
│   │   └── dto/
│   │
│   ├── profile/                # User profile module
│   │   ├── profile.module.ts
│   │   ├── profile.service.ts
│   │   ├── profile.controller.ts
│   │   └── dto/
│   │
│   ├── prisma/                 # Prisma service (global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts   # Database connection handler
│   │
│   ├── mailer/                 # Email service
│   │   ├── mailer.module.ts
│   │   └── mailer.service.ts   # Nodemailer wrapper
│   │
│   ├── common/                 # Shared utilities
│   │   ├── dto/                # Common DTOs
│   │   ├── interfaces/         # Shared interfaces
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/              # Helper functions
│   │   └── cache/              # Caching utilities
│   │
│   └── types/                  # TypeScript type definitions
│
├── test/                       # E2E tests
│   ├── jest-e2e.json
│   ├── global-setup.ts
│   ├── helpers/                # Test helpers
│   └── fixtures/               # Test data
│
├── uploads/                    # File upload storage
│   ├── avatars/
│   ├── service-documents/
│   └── review-checklist-documents/
│
├── ops/                        # Operations & deployment
│   └── caddy/                  # Caddy reverse proxy config
│
├── postman/                    # API testing collections
│   ├── collections/
│   └── environments/
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── Dockerfile                  # Multi-stage build
└── package.json                # Dependencies & scripts
```

## 🔧 Modul dan Service

### Core Modules

#### 1. **Authentication Module** (`auth/`)

**Tanggung Jawab:**

- User authentication dengan JWT
- Login & Register
- Password reset flow (forgot password, reset password)
- Refresh token management
- Email verification

**Services:**

- `AuthService`: Business logic untuk authentication
  - `register()`: Registrasi user baru
  - `login()`: Autentikasi user
  - `forgotPassword()`: Mengirim link reset password
  - `resetPassword()`: Reset password dengan token
  - `refreshToken()`: Generate new access token

**Guards & Strategies:**

- `JwtStrategy`: Passport strategy untuk validasi JWT
- `JwtAuthGuard`: Guard untuk protect routes

---

#### 2. **Users Module** (`users/`)

**Tanggung Jawab:**

- Manajemen user (CRUD)
- User verification
- Avatar upload
- Role assignment

**Services:**

- `UsersService`: User management logic
  - `findAll()`: List users dengan pagination
  - `findOne()`: Get user by ID
  - `create()`: Create new user
  - `update()`: Update user data
  - `delete()`: Soft delete user
  - `verifyUser()`: Verify user email
  - `uploadAvatar()`: Handle avatar upload

---

#### 3. **Roles Module** (`roles/`)

**Tanggung Jawab:**

- Manajemen role (CRUD)
- Assignment role ke user
- Manage admin roles

**Services:**

- `RolesService`: Role management logic
  - `findAll()`: List roles
  - `findOne()`: Get role by ID
  - `create()`: Create new role
  - `update()`: Update role
  - `delete()`: Delete role
  - `assignPermissions()`: Link permissions to role

---

#### 4. **Permissions Module** (`permissions/`)

**Tanggung Jawab:**

- Manajemen permission (CRUD)
- Define granular access control

**Services:**

- `PermissionsService`: Permission management
  - `findAll()`: List permissions
  - `create()`: Create permission
  - `update()`: Update permission
  - `delete()`: Delete permission

---

#### 5. **CASL Module** (`casl/`)

**Tanggung Jawab:**

- Attribute-Based Access Control (ABAC)
- Dynamic permission evaluation
- Integration dengan Prisma untuk field-level access

**Services:**

- `CaslAbilityFactory`: Build abilities dari user permissions
  - `createForUser()`: Generate ability instance untuk user
  - Support untuk admin roles
  - Support untuk service administrators

**Guards:**

- `AbilitiesGuard`: Check abilities sebelum akses endpoint

---

#### 6. **Applications Module** (`applications/`)

**Tanggung Jawab:**

- Manajemen aplikasi/permohonan layanan
- Multi-stage approval workflow
- Document management
- Status tracking (NEW, PROCESSING, FIXING, REJECTED, COMPLETED)

**Services:**

- `ApplicationsService`: Application workflow logic
  - `findAll()`: List applications dengan filter & pagination
  - `findOne()`: Get application detail
  - `create()`: Submit new application
  - `update()`: Update application
  - `updateStatus()`: Change application status
  - `processStage()`: Process approval stage
  - `createApplicationLog()`: Log application activities

**Controllers:**

- `ApplicationsController`: Protected endpoints
- `PublicApplicationsController`: Public endpoints untuk submission

---

#### 7. **Services Module** (`services/`)

**Tanggung Jawab:**

- Katalog layanan vokasi
- Manajemen requirements per service
- Service administrators assignment
- Approval stages configuration

**Services:**

- `ServicesService`: Service catalog management
  - `findAll()`: List services
  - `findOne()`: Get service detail
  - `create()`: Create new service
  - `update()`: Update service
  - `delete()`: Delete service
  - `assignAdministrators()`: Assign admins to service

- `RequirementsService`: Requirements management
  - `findByService()`: Get requirements untuk service
  - `create()`: Create requirement
  - `update()`: Update requirement
  - `delete()`: Delete requirement
  - `reorder()`: Reorder requirements

**Controllers:**

- `ServicesController`: Protected endpoints
- `RequirementsController`: Requirements CRUD
- `PublicServicesController`: Public catalog access

---

#### 8. **FAQ Module** (`faq/`)

**Tanggung Jawab:**

- Manajemen FAQ
- Public access untuk FAQ list

**Services:**

- `FaqService`: FAQ management
  - `findAll()`: List FAQs
  - `create()`: Create FAQ
  - `update()`: Update FAQ
  - `delete()`: Delete FAQ
  - `reorder()`: Change FAQ order

---

#### 9. **Profile Module** (`profile/`)

**Tanggung Jawab:**

- User profile management
- Update profile data
- Change password

**Services:**

- `ProfileService`: Profile operations
  - `getProfile()`: Get current user profile
  - `updateProfile()`: Update profile
  - `changePassword()`: Change user password

---

### Infrastructure Modules

#### 10. **Prisma Module** (`prisma/`)

**Tanggung Jawab:**

- Database connection management
- Query execution
- Transaction handling

**Services:**

- `PrismaService`: Global database service
  - Extends `PrismaClient`
  - Connection lifecycle management
  - Query middleware

---

#### 11. **Mailer Module** (`mailer/`)

**Tanggung Jawab:**

- Email delivery
- Email templates
- SMTP configuration

**Services:**

- `MailerService`: Email service
  - `sendPasswordResetEmail()`: Send reset password email
  - `sendVerificationEmail()`: Send verification email
  - `sendNotification()`: Send general notification

---

## 🗄️ Database Schema

### Model Utama

#### User Management

- **User**: Data pengguna sistem
- **Role**: Role/peran dalam sistem
- **Permission**: Granular permissions
- **UserRole**: Many-to-many User <-> Role
- **RolePermission**: Many-to-many Role <-> Permission

#### Token Management

- **RefreshToken**: JWT refresh tokens
- **PasswordResetToken**: Password reset tokens dengan expiry

#### Service & Applications

- **Service**: Katalog layanan vokasi
- **Requirement**: Requirements per service
- **Application**: Permohonan layanan dari user
- **ApplicationRequirement**: Status requirement per application
- **ApprovalStage**: Konfigurasi tahapan approval per service
- **ApplicationLog**: Activity log dan audit trail
- **PreStage**: Pre-approval stage data
- **ServiceAdministrator**: Admin assignment ke service

#### Other

- **Faq**: Frequently Asked Questions

### Relasi Diagram

```mermaid
erDiagram
    User ||--o{ UserRole : has
    User ||--o{ RefreshToken : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ Application : submits
    User ||--o{ ApplicationLog : creates
    User ||--o{ ServiceAdministrator : manages

    Role ||--o{ UserRole : assigned
    Role ||--o{ RolePermission : has
    Role ||--o{ ApprovalStage : approves

    Permission ||--o{ RolePermission : granted

    Service ||--o{ Requirement : has
    Service ||--o{ Application : receives
    Service ||--o{ ServiceAdministrator : managed_by
    Service ||--o{ ApprovalStage : has

    Application ||--o{ ApplicationRequirement : tracks
    Application ||--o{ ApplicationLog : logs

    Requirement ||--o{ ApplicationRequirement : checked_in

    ApplicationLog ||--o| PreStage : references

    User {
        int id PK
        string email UK
        string name
        string password
        string avatar
        boolean status
        string instanceName
        datetime createdAt
    }

    Role {
        int id PK
        string name UK
        boolean isAdmin
    }

    Permission {
        int id PK
        string action
        string subject
        string[] fields
        json conditions
        boolean inverted
    }

    Service {
        int id PK
        string name UK
        string document
        string workingTime
        enum fixerType
    }

    Application {
        int id PK
        string code UK
        string applicationName
        enum status
        int currentStageNumber
        int submittedById FK
        int serviceId FK
    }
```

---

## 🗃️ ERD & Database Schema

### Entity Relationship Diagram (Detail)

```mermaid
erDiagram
    User ||--o{ UserRole : "has roles"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ PasswordResetToken : "requests"
    User ||--o{ Application : "submits"
    User ||--o{ ApplicationLog : "performs action"
    User ||--o{ ServiceAdministrator : "manages service"

    Role ||--o{ UserRole : "assigned to"
    Role ||--o{ RolePermission : "has"
    Role ||--o{ ApprovalStage : "can approve"

    Permission ||--o{ RolePermission : "granted via"

    Service ||--o{ Requirement : "defines"
    Service ||--o{ Application : "receives"
    Service ||--o{ ServiceAdministrator : "managed by"
    Service ||--o{ ApprovalStage : "has stages"

    Application ||--o{ ApplicationRequirement : "fulfills"
    Application ||--o{ ApplicationLog : "has history"

    Requirement ||--o{ ApplicationRequirement : "required in"

    ApplicationLog ||--o| PreStage : "may have"

    User {
        int id PK "Auto increment"
        string email UK "Unique constraint"
        string name "Full name"
        string password "Bcrypt hashed"
        string avatar "nullable"
        boolean status "Email verified"
        string instanceName "Organization"
        string instanceEmail
        string instanceProvince
        string instanceDistrict
        string instanceSubDistrict
        string instancePhone
        text instanceAddress
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt "nullable, soft delete"
    }

    Role {
        int id PK
        string name UK "SUPERADMIN, ADMIN, USER"
        boolean isAdmin "Grant full access"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    Permission {
        int id PK
        string action "create, read, update, delete, manage"
        string subject "User, Role, Application, etc"
        array fields "Field-level access"
        json conditions "Conditional rules"
        boolean inverted "Deny permission"
        string reason "nullable, reason for denial"
    }

    UserRole {
        int userId FK
        int roleId FK
        composite_pk userId_roleId
    }

    RolePermission {
        int roleId FK
        int permissionId FK
        composite_pk roleId_permissionId
    }

    RefreshToken {
        int id PK
        string token UK
        timestamp expiresAt
        int userId FK
    }

    PasswordResetToken {
        int id PK
        string token UK
        timestamp expiresAt
        timestamp usedAt "nullable"
        int userId FK
    }

    Service {
        int id PK
        string name UK
        text document "nullable, Google Drive link"
        string workingTime "nullable, e.g., 14 hari kerja"
        enum fixerType "SUBMITTER or ADMIN"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    Requirement {
        int id PK
        int order "Display order"
        string description
        int serviceId FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        unique_constraint serviceId_order
    }

    ServiceAdministrator {
        int userId FK
        int serviceId FK
        composite_pk userId_serviceId
    }

    ApprovalStage {
        int id PK
        int serviceId FK
        int stageNumber "1, 2, 3, etc"
        string stageName "e.g., Verifikasi Tahap 1"
        int approverRoleId FK
        unique_constraint serviceId_stageNumber
    }

    Application {
        int id PK
        string code UK "APP-YYYYMMDD-XXXX"
        string applicationName
        string applicationNumber
        date applicationDate
        string applicantName
        string instanceName
        string applicantEmail
        string applicantPhone
        string applicantProvince
        string applicantDistrict
        string applicantSubDistrict
        text applicantAddress
        text confirmationLetterDocument "nullable, Google Drive"
        text requestLetterDocument "Google Drive"
        text documentLink "nullable"
        text attachmentLink "nullable"
        int serviceId FK
        int submittedById FK
        enum status "NEW, NEW_DOCUMENTS, PROCESSING, FIXING, FIXED, REJECTED, COMPLETED"
        int currentStageNumber "0 for pre-approval"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    ApplicationRequirement {
        int id PK
        int applicationId FK
        int requirementId FK
        boolean status "Fulfilled or not"
        timestamp createdAt
        timestamp updatedAt
    }

    ApplicationLog {
        int id PK
        int applicationId FK
        enum status "NEW, NOT_FULFILLED, FULFILLED, PROCESSING, FIXING, FIXED, REJECTED, COMPLETED"
        text note "nullable"
        text additionalLink "nullable"
        int stageNumber "Which stage this log belongs to"
        int actorId FK "User who performed action"
        int preStageId FK "nullable"
        timestamp createdAt
        timestamp updatedAt
    }

    PreStage {
        int id PK
        enum status "APPROVED, REJECTED"
        text letterLink "Google Drive link"
        timestamp createdAt
        timestamp updatedAt
    }

    Faq {
        int id PK
        int order
        string question
        string answer
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
```

### Penjelasan Relasi Antar Tabel

#### 1. User Management Relations

**User ↔ Role (Many-to-Many via UserRole)**

- Seorang user dapat memiliki multiple roles
- Satu role dapat dimiliki oleh multiple users
- Contoh: User "John" bisa memiliki role "ADMIN" dan "SERVICE_ADMIN" bersamaan

**Role ↔ Permission (Many-to-Many via RolePermission)**

- Satu role dapat memiliki multiple permissions
- Satu permission dapat dimiliki oleh multiple roles
- Implementasi RBAC (Role-Based Access Control)

**User ↔ Service (Many-to-Many via ServiceAdministrator)**

- User dengan role admin bisa manage multiple services
- Satu service bisa dikelola oleh multiple admins
- Digunakan untuk scoped access control

#### 2. Application Relations

**User → Application (One-to-Many)**

- Satu user dapat submit multiple applications
- Setiap application punya satu submitter (creator)
- Foreign Key: `submittedById` references `User.id`

**Service → Application (One-to-Many)**

- Satu service dapat menerima multiple applications
- Setiap application terkait dengan satu service
- Foreign Key: `serviceId` references `Service.id`

**Application ↔ Requirement (Many-to-Many via ApplicationRequirement)**

- Application harus memenuhi requirements dari service
- Tracking status pemenuhan untuk setiap requirement
- Boolean `status` menandakan fulfilled/not fulfilled

#### 3. Workflow Relations

**Service → ApprovalStage (One-to-Many)**

- Setiap service memiliki tahapan approval
- Tahapan diurutkan dengan `stageNumber`
- Setiap stage terhubung ke Role yang bisa approve

**Application → ApplicationLog (One-to-Many)**

- Setiap perubahan status dicatat sebagai log
- Audit trail lengkap untuk tracking
- Linked ke User yang melakukan action (actor)

**ApplicationLog → PreStage (One-to-One, Optional)**

- Hanya log dengan `stageNumber = 0` yang punya PreStage
- PreStage untuk approval/rejection sebelum masuk workflow utama

#### 4. Token Relations

**User → RefreshToken (One-to-Many)**

- User bisa punya multiple active refresh tokens (multiple devices)
- Cascade delete ketika user dihapus

**User → PasswordResetToken (One-to-Many)**

- User bisa request multiple password reset (expired tokens remain)
- Token hanya bisa digunakan sekali (`usedAt` timestamp)

### Primary Keys & Foreign Keys

#### Primary Keys (PK)

| Table                    | Primary Key            | Type      | Strategy       |
| ------------------------ | ---------------------- | --------- | -------------- |
| User                     | id                     | INT       | Auto increment |
| Role                     | id                     | INT       | Auto increment |
| Permission               | id                     | INT       | Auto increment |
| Service                  | id                     | INT       | Auto increment |
| Requirement              | id                     | INT       | Auto increment |
| Application              | id                     | INT       | Auto increment |
| ApplicationLog           | id                     | INT       | Auto increment |
| Faq                      | id                     | INT       | Auto increment |
| **UserRole**             | (userId, roleId)       | Composite | -              |
| **RolePermission**       | (roleId, permissionId) | Composite | -              |
| **ServiceAdministrator** | (userId, serviceId)    | Composite | -              |

#### Foreign Keys (FK) dengan Cascade Rules

| Child Table            | FK Column      | References     | On Delete   | On Update |
| ---------------------- | -------------- | -------------- | ----------- | --------- |
| UserRole               | userId         | User.id        | **CASCADE** | CASCADE   |
| UserRole               | roleId         | Role.id        | **CASCADE** | CASCADE   |
| RolePermission         | roleId         | Role.id        | **CASCADE** | CASCADE   |
| RolePermission         | permissionId   | Permission.id  | **CASCADE** | CASCADE   |
| RefreshToken           | userId         | User.id        | **CASCADE** | CASCADE   |
| PasswordResetToken     | userId         | User.id        | **CASCADE** | CASCADE   |
| Application            | submittedById  | User.id        | RESTRICT    | CASCADE   |
| Application            | serviceId      | Service.id     | RESTRICT    | CASCADE   |
| ApplicationRequirement | applicationId  | Application.id | **CASCADE** | CASCADE   |
| ApplicationRequirement | requirementId  | Requirement.id | RESTRICT    | CASCADE   |
| ApplicationLog         | applicationId  | Application.id | **CASCADE** | CASCADE   |
| ApplicationLog         | actorId        | User.id        | RESTRICT    | CASCADE   |
| ApplicationLog         | preStageId     | PreStage.id    | SET NULL    | CASCADE   |
| Requirement            | serviceId      | Service.id     | RESTRICT    | CASCADE   |
| ServiceAdministrator   | userId         | User.id        | RESTRICT    | CASCADE   |
| ServiceAdministrator   | serviceId      | Service.id     | RESTRICT    | CASCADE   |
| ApprovalStage          | serviceId      | Service.id     | RESTRICT    | CASCADE   |
| ApprovalStage          | approverRoleId | Role.id        | RESTRICT    | CASCADE   |

**Cascade Strategies:**

- **CASCADE**: Otomatis delete/update child records
- **RESTRICT**: Prevent delete/update jika masih ada child records
- **SET NULL**: Set FK ke NULL saat parent dihapus

### Unique Constraints

| Table              | Columns                  | Purpose                        |
| ------------------ | ------------------------ | ------------------------------ |
| User               | email                    | Prevent duplicate email        |
| Role               | name                     | Prevent duplicate role name    |
| Service            | name                     | Prevent duplicate service name |
| Application        | code                     | Unique application identifier  |
| Requirement        | (serviceId, order)       | Unique order per service       |
| ApprovalStage      | (serviceId, stageNumber) | Unique stage per service       |
| RefreshToken       | token                    | Prevent token reuse            |
| PasswordResetToken | token                    | Prevent token reuse            |

### Indexes

Prisma secara otomatis membuat indexes untuk:

- Primary Keys
- Unique constraints
- Foreign Keys

**Additional Manual Indexes (Recommended):**

```sql
CREATE INDEX idx_application_status ON "Application"(status);
CREATE INDEX idx_application_service_id ON "Application"(serviceId);
CREATE INDEX idx_application_submitted_by ON "Application"(submittedById);
CREATE INDEX idx_application_created_at ON "Application"(createdAt DESC);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_application_log_application_id ON "ApplicationLog"(applicationId);
```

### Struktur Tabel (DDL)

**Contoh DDL untuk tabel User:**

```sql
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "instanceName" TEXT NOT NULL,
    "instanceEmail" TEXT NOT NULL,
    "instanceProvince" TEXT NOT NULL,
    "instanceDistrict" TEXT NOT NULL,
    "instanceSubDistrict" TEXT NOT NULL,
    "instancePhone" TEXT NOT NULL,
    "instanceAddress" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**Contoh DDL untuk tabel Application:**

```sql
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "applicationName" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "applicantName" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantPhone" TEXT NOT NULL,
    "applicantProvince" TEXT NOT NULL,
    "applicantDistrict" TEXT NOT NULL,
    "applicantSubDistrict" TEXT NOT NULL,
    "applicantAddress" TEXT NOT NULL,
    "confirmationLetterDocument" TEXT,
    "requestLetterDocument" TEXT NOT NULL,
    "documentLink" TEXT,
    "attachmentLink" TEXT,
    "serviceId" INTEGER NOT NULL,
    "submittedById" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "currentStageNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Application_code_key" ON "Application"("code");

ALTER TABLE "Application"
    ADD CONSTRAINT "Application_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Application"
    ADD CONSTRAINT "Application_submittedById_fkey"
    FOREIGN KEY ("submittedById") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Database Migrations

Semua perubahan schema dikelola melalui Prisma Migrations:

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# View migration history
ls prisma/migrations/

# Apply migrations to production
npx prisma migrate deploy
```

**Migration History:**

```
prisma/migrations/
├── 20251115152639_initial/
├── 20251115220037_align_user_fields_status_and_instance/
├── 20251116093000_add_password_reset_tokens/
├── 20251116120000_unique_requirement_order/
├── 20251117001352_applications_workflow/
├── 20251118014856_add_prestage_status/
├── 20251121095818_add_instance_model/
└── ... (more migrations)
```

## 🔐 Authorization System

### CASL Implementation

Sistem menggunakan **CASL (Conditional Access Control)** untuk authorization:

#### Action Types

- `manage`: Wildcard untuk semua actions
- `create`: Create resources
- `read`: Read resources
- `update`: Update resources
- `delete`: Delete resources

#### Subject Types

- `User`, `Role`, `Permission`
- `Service`, `Requirement`
- `Application`, `ApplicationLog`
- `Faq`
- `all`: Wildcard untuk semua subjects

#### Permission Evaluation Flow

```mermaid
flowchart TD
    A[Request] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Is Admin Role?}
    D -->|Yes| E[Grant All Access]
    D -->|No| F{Is Service Admin?}
    F -->|Yes| G[Grant Service Scoped Access]
    F -->|No| H[Load User Permissions]
    H --> I{Check Abilities}
    I -->|Can| J[Allow Access]
    I -->|Cannot| K[403 Forbidden]
```

### Admin Roles

- Roles dengan `isAdmin = true` atau name `SUPERADMIN` mendapat akses penuh
- Service administrators mendapat akses terbatas ke applications dari service mereka

## 🚀 Application Workflow

### Status Flow

```mermaid
stateDiagram-v2
    [*] --> NEW: Submit Application
    NEW --> NEW_DOCUMENTS: Add Documents
    NEW_DOCUMENTS --> PROCESSING: Admin Review
    PROCESSING --> FIXING: Need Revision
    PROCESSING --> REJECTED: Reject
    PROCESSING --> COMPLETED: Approve
    FIXING --> FIXED: User Fixes
    FIXED --> PROCESSING: Re-submit
    REJECTED --> [*]
    COMPLETED --> [*]
```

### Multi-Stage Approval

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Stage1 as Stage 1 Admin
    participant Stage2 as Stage 2 Admin
    participant StageN as Stage N Admin

    User->>System: Submit Application (Stage 0)
    System->>System: status = NEW, currentStage = 0
    System->>Stage1: Notify Stage 1

    Stage1->>System: Review & Approve
    System->>System: currentStage = 1
    System->>Stage2: Notify Stage 2

    Stage2->>System: Review & Approve
    System->>System: currentStage = 2
    System->>StageN: Notify Stage N

    StageN->>System: Final Approve
    System->>System: status = COMPLETED
    System->>User: Notification
```

### ApplicationLog Tracking

Setiap perubahan status dicatat di `ApplicationLog`:

- **stageNumber**: Tahapan saat log dibuat
- **status**: Status log (NEW, FULFILLED, PROCESSING, FIXING, FIXED, REJECTED, COMPLETED)
- **actorId**: User yang melakukan action
- **note**: Catatan/alasan
- **additionalLink**: Link dokumen pendukung

## Password reset flow

- `POST /auth/forgot-password` accepts `{ email }` and sends a reset link when the email exists.
- `POST /auth/reset-password` accepts `{ token, password, passwordConfirmation }` to finalize the reset.

Environment variables:

- `APP_ORIGIN` – the frontend base URL, defaults to `http://localhost:5173`.
- `PASSWORD_RESET_URL` – optional override for the exact reset page URL (`${APP_ORIGIN}/reset-password` by default).
- `PASSWORD_RESET_EXPIRATION_MINUTES` – token validity window (default `60`).
- `SMTP_DISABLE_SEND` – set to `true` in local/dev to use a JSON transport (no outbound SMTP) and avoid connection timeouts.

## 🔌 API Endpoints

### Public Endpoints

```
GET  /api/v1/services           # List all services
GET  /api/v1/services/:id       # Get service detail
GET  /api/v1/faq                # List FAQs
POST /api/v1/applications       # Submit application (public)
```

### Authentication

```
POST /api/v1/auth/register          # Register user
POST /api/v1/auth/login             # Login
POST /api/v1/auth/logout            # Logout
POST /api/v1/auth/refresh           # Refresh token
POST /api/v1/auth/forgot-password   # Request password reset
POST /api/v1/auth/reset-password    # Reset password with token
```

### Protected Endpoints

#### Users

```
GET    /api/v1/users           # List users (Admin)
GET    /api/v1/users/:id       # Get user detail
POST   /api/v1/users           # Create user
PATCH  /api/v1/users/:id       # Update user
DELETE /api/v1/users/:id       # Delete user
POST   /api/v1/users/:id/verify # Verify user
```

#### Roles

```
GET    /api/v1/roles           # List roles
GET    /api/v1/roles/:id       # Get role detail
POST   /api/v1/roles           # Create role
PATCH  /api/v1/roles/:id       # Update role
DELETE /api/v1/roles/:id       # Delete role
```

#### Permissions

```
GET    /api/v1/permissions     # List permissions
POST   /api/v1/permissions     # Create permission
PATCH  /api/v1/permissions/:id # Update permission
DELETE /api/v1/permissions/:id # Delete permission
```

#### Applications

```
GET    /api/v1/applications                    # List applications
GET    /api/v1/applications/:id                # Get application detail
POST   /api/v1/applications                    # Submit application
PATCH  /api/v1/applications/:id                # Update application
PATCH  /api/v1/applications/:id/status         # Update status
POST   /api/v1/applications/:id/logs           # Add log
GET    /api/v1/applications/:id/requirements   # Get requirements status
```

#### Services (Admin)

```
POST   /api/v1/services                        # Create service
PATCH  /api/v1/services/:id                    # Update service
DELETE /api/v1/services/:id                    # Delete service
GET    /api/v1/services/:id/requirements       # List requirements
POST   /api/v1/services/:id/requirements       # Create requirement
PATCH  /api/v1/requirements/:id                # Update requirement
DELETE /api/v1/requirements/:id                # Delete requirement
```

#### Profile

```
GET    /api/v1/profile         # Get current user profile
PATCH  /api/v1/profile         # Update profile
POST   /api/v1/profile/password # Change password
```

### API Documentation

Swagger documentation tersedia di: `http://localhost:3000/api-docs` (development only)

---

## 📖 API Documentation

### Swagger/OpenAPI

Aplikasi ini menggunakan **Swagger/OpenAPI** untuk dokumentasi API interaktif. Swagger UI menyediakan:

- Daftar lengkap semua endpoints
- Parameter request yang diperlukan
- Schema response
- Try-it-out feature untuk testing langsung
- Authentication dengan JWT token

**Akses Swagger UI:**

```
http://localhost:3000/api-docs
```

> **Note**: Swagger UI hanya tersedia di mode development untuk keamanan.

### Postman Collections

Koleksi Postman tersedia di folder `postman/`:

```
postman/
├── siap-vokasi-api.postman_collection.json
├── collections/
│   ├── clsp-workflow.postman_collection.json
│   ├── Instance.postman_collection.json
│   ├── stage0_to_complete.postman_collection.json
│   └── stage0-workflow.postman_collection.json
└── environments/
    └── siap-vokasi-api.local.postman_environment.json
```

**Import ke Postman:**

1. Buka Postman
2. Click "Import" → "Upload Files"
3. Pilih collection dan environment files
4. Set environment ke "siap-vokasi-api.local"

### Contoh Request & Response

#### 1. Register User

**Request:**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!",
  "instanceName": "Standar Kompetensi Indonesia",
  "instanceEmail": "contact@stankom.id",
  "instanceProvince": "DKI Jakarta",
  "instanceDistrict": "Jakarta Pusat",
  "instanceSubDistrict": "Menteng",
  "instancePhone": "021-1234567",
  "instanceAddress": "Jl. Sudirman No. 123"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "status": false,
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
}
```

#### 2. Login

**Request:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "status": true,
      "roles": [
        {
          "id": 3,
          "name": "USER"
        }
      ]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note**: Tokens juga di-set sebagai HttpOnly cookies.

#### 3. Get All Services (Public)

**Request:**

```http
GET /api/v1/services?page=1&limit=10
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "name": "SKKNI (Standar Kompetensi Kerja Nasional Indonesia)",
      "document": "https://drive.google.com/file/d/xxxxx",
      "workingTime": "14 hari kerja",
      "createdAt": "2025-11-15T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "CLSP (Calon Lembaga Sertifikasi Profesi)",
      "document": "https://drive.google.com/file/d/yyyyy",
      "workingTime": "21 hari kerja",
      "createdAt": "2025-11-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### 4. Submit Application (Protected)

**Request:**

```http
POST /api/v1/applications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceId": 1,
  "applicationName": "Permohonan Sertifikasi SKKNI",
  "applicationNumber": "001/SKKNI/2025",
  "applicationDate": "2025-12-01",
  "applicantName": "PT. Technology Indonesia",
  "instanceName": "PT. Technology Indonesia",
  "applicantEmail": "admin@techindo.com",
  "applicantPhone": "081234567890",
  "applicantProvince": "DKI Jakarta",
  "applicantDistrict": "Jakarta Selatan",
  "applicantSubDistrict": "Kebayoran Baru",
  "applicantAddress": "Jl. Senopati No. 45",
  "requestLetterDocument": "https://drive.google.com/file/d/zzzzz",
  "confirmationLetterDocument": "https://drive.google.com/file/d/aaaaa"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "code": "APP-20251201-0001",
    "applicationName": "Permohonan Sertifikasi SKKNI",
    "status": "NEW",
    "currentStageNumber": 0,
    "serviceId": 1,
    "submittedById": 1,
    "createdAt": "2025-12-01T10:30:00.000Z"
  }
}
```

#### 5. Update Application Status (Admin)

**Request:**

```http
PATCH /api/v1/applications/1/status
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "status": "PROCESSING",
  "stageNumber": 1,
  "note": "Dokumen lengkap, diproses ke tahap berikutnya"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Application status updated successfully",
  "data": {
    "id": 1,
    "code": "APP-20251201-0001",
    "status": "PROCESSING",
    "currentStageNumber": 1,
    "updatedAt": "2025-12-01T11:00:00.000Z"
  }
}
```

### HTTP Status Codes

Aplikasi menggunakan standar HTTP status codes:

| Status Code | Meaning               | Usage                                        |
| ----------- | --------------------- | -------------------------------------------- |
| **200**     | OK                    | Request berhasil                             |
| **201**     | Created               | Resource berhasil dibuat                     |
| **204**     | No Content            | Request berhasil tanpa response body         |
| **400**     | Bad Request           | Validation error atau invalid input          |
| **401**     | Unauthorized          | Authentication required atau token invalid   |
| **403**     | Forbidden             | User tidak memiliki permission               |
| **404**     | Not Found             | Resource tidak ditemukan                     |
| **409**     | Conflict              | Duplicate entry (email sudah terdaftar, dll) |
| **422**     | Unprocessable Entity  | Business logic error                         |
| **429**     | Too Many Requests     | Rate limit exceeded                          |
| **500**     | Internal Server Error | Server error                                 |

### Error Response Format

Semua error response menggunakan format standar:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email"
    },
    {
      "field": "password",
      "message": "password must be longer than or equal to 8 characters"
    }
  ]
}
```

### Authentication

API menggunakan **JWT Bearer Token** yang dikirim melalui:

1. **Authorization Header** (Recommended):

   ```http
   Authorization: Bearer <access_token>
   ```

2. **HttpOnly Cookie**:
   - Cookie name: `access_token`
   - Set automatically setelah login
   - Lebih aman untuk web applications

**Token Expiry:**

- Access Token: 15 minutes
- Refresh Token: 7 days

**Refresh Token Flow:**

```http
POST /api/v1/auth/refresh
Cookie: refresh_token=<refresh_token>

Response:
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

## 🐳 Deployment dengan Docker

### Development Environment

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

**Services:**

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`

### Production Environment

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### Multi-Stage Dockerfile

```dockerfile
FROM node:22-alpine AS base          # Base image
FROM base AS prod_dependencies       # Production deps only
FROM base AS builder                 # Build stage
FROM base AS development             # Dev environment
FROM base AS production              # Production image
```

**Optimizations:**

- Layer caching untuk dependencies
- Production-only dependencies
- Prisma Client pre-generated
- Security best practices (non-root user, minimal image)

## 🛠️ Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### SQLite-backed e2e tests (local, no Postgres required)

If you prefer running e2e tests without a Postgres server, the repository includes a test-only Prisma schema (`prisma/schema.test.prisma`) that uses SQLite. To run the SQLite-backed e2e tests locally:

1. Generate the test Prisma client and push the SQLite schema (creates `dev-test.db`):

```bash
# from repository root
npm run prisma:generate:test
# ensure the TEST_DATABASE_URL env var is set to a file path, then:
npm run prisma:db:push:test
```

2. Run the e2e test suite (uses `TEST_DATABASE_URL`):

```bash
npm run test:e2e
```

Or run the convenience script which generates the client, pushes the schema and runs e2e tests in one go:

```bash
npm run test:e2e:sqlite
```

Notes:

- The test client is generated into `prisma/prisma-test-client` and the SQLite DB file is `dev-test.db` in the repository root.
- `prisma/schema.test.prisma` is intentionally similar to the main schema; for SQLite we store some array fields (like `Permission.fields`) as JSON.
- You can add `dev-test.db` to `.gitignore` if you don't want to commit it.

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npm run seed

# Open Prisma Studio
npx prisma studio
```

### Database Seeding

Seed script (`prisma/seed.ts`) membuat data awal:

- Default roles (SUPERADMIN, ADMIN, USER)
- Default permissions
- Sample services
- Sample users

---

## 🔐 Dokumentasi Security

### 1. Authentication (Autentikasi)

#### JWT (JSON Web Token)

Aplikasi menggunakan **JWT** sebagai mekanisme autentikasi utama:

**Token Types:**

1. **Access Token**
   - Durasi: 15 menit
   - Digunakan untuk: Akses ke protected endpoints
   - Storage: HttpOnly cookie atau Authorization header
   - Payload:
     ```json
     {
       "sub": 1,
       "email": "user@example.com",
       "iat": 1701432000,
       "exp": 1701432900
     }
     ```

2. **Refresh Token**
   - Durasi: 7 hari
   - Digunakan untuk: Generate access token baru
   - Storage: HttpOnly cookie (secure)
   - Disimpan di database untuk tracking dan revocation

**JWT Flow:**

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    participant DB as Database
    participant G as Guards

    C->>A: POST /auth/login (credentials)
    A->>DB: Verify credentials
    DB-->>A: User data
    A->>A: Generate JWT tokens
    A->>DB: Store refresh token
    A-->>C: Access + Refresh tokens (HttpOnly cookies)

    Note over C: Access token expires after 15min

    C->>G: Request with expired token
    G-->>C: 401 Unauthorized
    C->>A: POST /auth/refresh (refresh token)
    A->>DB: Verify refresh token
    DB-->>A: Token valid
    A->>A: Generate new tokens
    A->>DB: Update refresh token
    A-->>C: New access + refresh tokens
```

#### Password Security

**Hashing Algorithm: bcrypt**

- Cost factor: 10 rounds (configurable)
- Salt automatically generated per password
- Resistant to rainbow table attacks

```typescript
// Password hashing implementation
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

**Password Requirements:**

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, dan special characters (recommended)
- Validated via `class-validator`

#### Session Management

- **Stateless**: Server tidak menyimpan session state
- **Cookie-based**: Tokens dikirim via secure HttpOnly cookies
- **Token Refresh**: Automatic refresh sebelum expiry
- **Revocation**: Refresh tokens bisa di-revoke dari database

### 2. Authorization (Otorisasi)

#### RBAC (Role-Based Access Control)

Sistem menggunakan **hierarki roles**:

```mermaid
graph TD
    SUPERADMIN[SUPERADMIN<br/>Full System Access]
    ADMIN[ADMIN<br/>Administrative Access]
    SERVICE_ADMIN[SERVICE_ADMIN<br/>Service-Scoped Access]
    USER[USER<br/>Basic Access]

    SUPERADMIN --> ADMIN
    ADMIN --> SERVICE_ADMIN
    SERVICE_ADMIN --> USER

    style SUPERADMIN fill:#e74c3c,color:#fff
    style ADMIN fill:#e67e22,color:#fff
    style SERVICE_ADMIN fill:#f39c12,color:#fff
    style USER fill:#3498db,color:#fff
```

**Role Capabilities:**

| Role              | Permissions                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **SUPERADMIN**    | - Full access ke semua resources<br/>- Manage users, roles, permissions<br/>- Manage all services & applications<br/>- System configuration  |
| **ADMIN**         | - Manage users (create, update, delete)<br/>- View all applications<br/>- Configure services<br/>- Manage FAQs                               |
| **SERVICE_ADMIN** | - Manage applications untuk assigned services<br/>- Approve/reject applications<br/>- View service analytics<br/>- Update application status |
| **USER**          | - Submit applications<br/>- View own applications<br/>- Update profile<br/>- View public services & FAQs                                     |

#### CASL (Conditional Access Control)

**CASL** memberikan **fine-grained authorization** di level:

- **Action**: create, read, update, delete, manage
- **Subject**: User, Role, Application, Service, dll
- **Field**: Specific fields dalam entity
- **Condition**: Dynamic rules (e.g., own resources only)

**Permission Structure:**

```typescript
interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  subject: 'User' | 'Role' | 'Application' | 'Service' | 'all';
  fields?: string[]; // Optional: field-level access
  conditions?: object; // Optional: conditional rules
  inverted?: boolean; // Optional: deny permission
  reason?: string; // Optional: reason for denial
}
```

**Example Permissions:**

```typescript
// User can read own applications only
{
  action: 'read',
  subject: 'Application',
  conditions: { submittedById: userId }
}

// Service admin can update applications for their services
{
  action: 'update',
  subject: 'Application',
  conditions: { serviceId: { in: managedServiceIds } }
}

// Admin can manage all users
{
  action: 'manage',
  subject: 'User'
}
```

**Authorization Check Flow:**

```mermaid
flowchart TD
    A[Request to Protected Endpoint] --> B[JWT Auth Guard]
    B --> C{Valid Token?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Extract User from Token]
    E --> F[CASL Abilities Guard]
    F --> G[Load User Roles & Permissions]
    G --> H{Is Admin?}
    H -->|Yes| I[Grant Full Access]
    H -->|No| J{Is Service Admin?}
    J -->|Yes| K[Check Service Scope]
    J -->|No| L[Check User Permissions]
    K --> M{Has Permission?}
    L --> M
    M -->|Yes| N[Allow Access]
    M -->|No| O[403 Forbidden]
```

### 3. Data Protection

#### Encryption & Hashing

| Data Type        | Method                | Purpose                  |
| ---------------- | --------------------- | ------------------------ |
| Password         | bcrypt (10 rounds)    | Irreversible hashing     |
| JWT              | HS256 (HMAC-SHA256)   | Token signing            |
| Sensitive Config | Environment Variables | Keep secrets out of code |

#### Soft Delete

- Records tidak dihapus permanent dari database
- Field `deletedAt` timestamp untuk marking
- Prisma middleware filter out deleted records
- Preserves data integrity dan audit trail

```typescript
// Prisma soft delete middleware
prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }
  return next(params);
});
```

#### Audit Logging

Semua critical actions dicatat di **ApplicationLog**:

- Who (actorId)
- What (action/status)
- When (createdAt)
- Why (note)
- Context (stageNumber, additionalLink)

### 4. Request Protection

#### CORS (Cross-Origin Resource Sharing)

```typescript
// CORS configuration
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### Helmet.js

Security headers automatically set:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000
- **Content-Security-Policy**: default-src 'self'

#### Rate Limiting

```typescript
// Express rate limit configuration
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}
```

#### Input Validation

**class-validator** + **class-transformer**:

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(3)
  name: string;
}
```

**Validation Pipe:**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Reject unknown properties
    transform: true, // Auto-transform to DTO types
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

#### XSS Protection

- Input sanitization via validation
- Output encoding (automatic di NestJS responses)
- Content-Type headers properly set
- CSP headers via Helmet

### 5. Environment Security

#### Secrets Management

```env
# Critical secrets (NEVER commit to git)
JWT_SECRET=<strong-random-secret>
COOKIE_SECRET=<strong-random-secret>
DATABASE_URL=postgresql://user:pass@host:5432/db
SMTP_PASSWORD=<app-specific-password>
```

**Best Practices:**

- Use `.env` file (listed in `.gitignore`)
- Different secrets per environment (dev, staging, prod)
- Rotate secrets periodically
- Use secret management service in production (e.g., AWS Secrets Manager, HashiCorp Vault)

#### Production Mode

```typescript
if (process.env.NODE_ENV === 'production') {
  // Disable Swagger UI
  // Enable strict CORS
  // Enhanced logging
  // Error messages sanitized (no stack traces)
}
```

### 6. Cookie Security

```typescript
// Secure cookie options
{
  httpOnly: true,      // Prevent XSS attacks
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  signed: true         // Cookie signing with secret
}
```

### 7. Security Checklist

- [x] JWT authentication dengan expiry
- [x] Refresh token rotation
- [x] Password hashing (bcrypt)
- [x] RBAC implementation
- [x] Fine-grained authorization (CASL)
- [x] CORS configuration
- [x] Helmet security headers
- [x] Rate limiting
- [x] Input validation
- [x] XSS protection
- [x] CSRF protection (SameSite cookies)
- [x] SQL Injection prevention (Prisma ORM)
- [x] Soft delete
- [x] Audit logging
- [x] Environment variables for secrets
- [x] HttpOnly secure cookies
- [x] Error message sanitization

### 8. Security Best Practices

1. **Never commit secrets** to version control
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Keep dependencies updated** (`npm audit`)
5. **Monitor logs** for suspicious activities
6. **Implement 2FA** for admin accounts (future enhancement)
7. **Regular security audits**
8. **Backup database** regularly
9. **Test authentication flows** thoroughly
10. **Document security procedures**

## 🔒 Security Features

### Implemented Security

1. **Authentication & Authorization**
   - JWT-based authentication
   - Refresh token rotation
   - CASL fine-grained authorization
   - Password hashing dengan bcrypt

2. **Request Protection**
   - Helmet.js untuk HTTP headers
   - CORS configuration
   - Rate limiting (express-rate-limit)
   - Input validation (class-validator)
   - XSS protection

3. **Data Protection**
   - Soft delete (preserving data integrity)
   - HttpOnly cookies untuk tokens
   - Password reset token dengan expiry
   - Audit logging (ApplicationLog)

4. **Environment Security**
   - Environment variables untuk secrets
   - Production/development mode separation
   - Secure cookie parsing

## 📝 Environment Variables

### Required Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
APP_ORIGIN=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/siap_vokasi
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=siap_vokasi
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@siapvokasi.com
SMTP_DISABLE_SEND=false

# Password Reset
PASSWORD_RESET_URL=http://localhost:5173/reset-password
PASSWORD_RESET_EXPIRATION_MINUTES=60

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads
```

### Environment Variables Explanation

| Variable                            | Description                            | Default         | Required    |
| ----------------------------------- | -------------------------------------- | --------------- | ----------- |
| `NODE_ENV`                          | Environment mode                       | `development`   | ✅          |
| `PORT`                              | Server port                            | `3000`          | ✅          |
| `APP_ORIGIN`                        | Frontend base URL                      | -               | ✅          |
| `ALLOWED_ORIGINS`                   | CORS allowed origins (comma-separated) | -               | ✅          |
| `DATABASE_URL`                      | PostgreSQL connection string           | -               | ✅          |
| `DB_USER`                           | Database username                      | -               | ✅ (Docker) |
| `DB_PASSWORD`                       | Database password                      | -               | ✅ (Docker) |
| `DB_NAME`                           | Database name                          | -               | ✅ (Docker) |
| `DB_PORT`                           | Database port                          | `5432`          | ✅ (Docker) |
| `JWT_SECRET`                        | JWT signing secret                     | -               | ✅          |
| `JWT_EXPIRES_IN`                    | Access token expiry                    | `15m`           | ❌          |
| `JWT_REFRESH_EXPIRES_IN`            | Refresh token expiry                   | `7d`            | ❌          |
| `COOKIE_SECRET`                     | Cookie signing secret                  | -               | ✅          |
| `SMTP_HOST`                         | SMTP server host                       | -               | ✅          |
| `SMTP_PORT`                         | SMTP server port                       | `587`           | ✅          |
| `SMTP_USER`                         | SMTP username/email                    | -               | ✅          |
| `SMTP_PASSWORD`                     | SMTP password                          | -               | ✅          |
| `SMTP_FROM`                         | Email sender address                   | -               | ✅          |
| `SMTP_DISABLE_SEND`                 | Disable actual email sending (dev)     | `false`         | ❌          |
| `PASSWORD_RESET_URL`                | Password reset page URL                | -               | ❌          |
| `PASSWORD_RESET_EXPIRATION_MINUTES` | Reset token validity                   | `60`            | ❌          |
| `MAX_FILE_SIZE`                     | Max upload file size (bytes)           | `5242880` (5MB) | ❌          |
| `UPLOAD_DEST`                       | File upload directory                  | `./uploads`     | ❌          |

---

## 🚀 Deployment Guide

### Prerequisites

- **Node.js**: v22.x or higher
- **PostgreSQL**: v17 or higher
- **Docker & Docker Compose**: Latest stable version (optional)
- **pnpm**: v9.x or higher

### Option 1: Deployment dengan Docker (Recommended)

#### 1. Clone Repository

```bash
git clone https://github.com/dark-hermes/siap-vokasi-api.git
cd siap-vokasi-api
```

#### 2. Setup Environment Variables

```bash
# Copy template .env
cp .env.example .env

# Edit .env dengan konfigurasi production
nano .env
```

**Production .env Example:**

```env
NODE_ENV=production
PORT=3000
APP_ORIGIN=https://siapvokasi.id
ALLOWED_ORIGINS=https://siapvokasi.id,https://admin.siapvokasi.id

DATABASE_URL=postgresql://siap_user:secure_password@db:5432/siap_vokasi_prod
DB_USER=siap_user
DB_PASSWORD=secure_password
DB_NAME=siap_vokasi_prod
DB_PORT=5432

JWT_SECRET=<generate-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=<generate-strong-random-secret>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@siapvokasi.id
SMTP_PASSWORD=<app-specific-password>
SMTP_FROM=SIAP Vokasi <noreply@siapvokasi.id>
SMTP_DISABLE_SEND=false

PASSWORD_RESET_URL=https://siapvokasi.id/reset-password
PASSWORD_RESET_EXPIRATION_MINUTES=60
```

#### 3. Build dan Run dengan Docker Compose

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d --build

# Verify containers running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f api
```

#### 4. Run Database Migrations

```bash
# Enter container
docker exec -it siap-vokasi-api-prod sh

# Run migrations
npx prisma migrate deploy

# Seed database (first time only)
npm run seed

# Exit container
exit
```

#### 5. Verify Deployment

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Test endpoint
curl http://localhost:3000/api/v1/services
```

### Option 2: Manual Deployment (Tanpa Docker)

#### 1. Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install --frozen-lockfile --prod
```

#### 2. Setup Database

```bash
# Install PostgreSQL 17
sudo apt-get update
sudo apt-get install postgresql-17

# Create database
sudo -u postgres psql
CREATE DATABASE siap_vokasi_prod;
CREATE USER siap_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE siap_vokasi_prod TO siap_user;
\q
```

#### 3. Setup Environment

```bash
# Create .env file
cp .env.example .env

# Edit with production values
nano .env
```

#### 4. Build Application

```bash
# Generate Prisma Client
npx prisma generate

# Build TypeScript
pnpm build

# Run migrations
npx prisma migrate deploy

# Seed database
pnpm run seed
```

#### 5. Start Application

```bash
# Using PM2 (Recommended)
npm install -g pm2
pm2 start dist/src/main.js --name siap-vokasi-api -i max
pm2 save
pm2 startup

# Or direct start
node dist/src/main.js
```

### Option 3: Deployment dengan Reverse Proxy (Caddy)

#### 1. Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 2. Configure Caddy

```bash
# Edit Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**Caddyfile:**

```caddy
api.siapvokasi.id {
    reverse_proxy localhost:3000

    encode gzip

    log {
        output file /var/log/caddy/siap-vokasi-api.log
        format json
    }

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

#### 3. Start Caddy

```bash
sudo systemctl reload caddy
sudo systemctl enable caddy
```

### Server Specifications

#### Minimum Requirements

| Component   | Minimum       | Recommended      |
| ----------- | ------------- | ---------------- |
| **CPU**     | 1 vCore       | 2 vCores         |
| **RAM**     | 1 GB          | 2 GB             |
| **Storage** | 10 GB SSD     | 20 GB SSD        |
| **Network** | 100 Mbps      | 1 Gbps           |
| **OS**      | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

#### Recommended Production Setup

- **Application Server**: 2 vCPU, 4 GB RAM
- **Database Server**: 2 vCPU, 4 GB RAM, 50 GB SSD
- **Load Balancer**: 1 vCPU, 1 GB RAM (if scaling horizontally)

### Docker Configuration

#### Dockerfile (Multi-stage Build)

```dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache git bash curl python3 make g++
WORKDIR /usr/src/app
RUN npm i -g pnpm

# Production dependencies
FROM base AS prod_dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Builder
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/devdb?schema=public" pnpm exec prisma generate
RUN pnpm build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY package.json .
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
```

#### docker-compose.prod.yml

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: siap-vokasi-api-prod
    restart: always
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    networks:
      - siap-network

  db:
    image: postgres:17-alpine
    container_name: siap-vokasi-db-prod
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER} -d ${DB_NAME}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - siap-network

networks:
  siap-network:
    driver: bridge

volumes:
  postgres_data:
```

### CI/CD Pipeline (GitHub Actions Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/siap-vokasi-api
            git pull origin main
            pnpm install --frozen-lockfile --prod
            pnpm build
            npx prisma migrate deploy
            pm2 restart siap-vokasi-api
```

### Maintenance Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker exec siap-vokasi-db-prod pg_dump -U siap_user siap_vokasi_prod > backup-$(date +%Y%m%d).sql

# Restore database
docker exec -i siap-vokasi-db-prod psql -U siap_user siap_vokasi_prod < backup.sql

# Scale horizontally (multiple instances)
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### Monitoring & Logging

```bash
# Application logs
pm2 logs siap-vokasi-api

# System monitoring
pm2 monit

# Container stats
docker stats siap-vokasi-api-prod

# Database connections
docker exec siap-vokasi-db-prod psql -U siap_user -d siap_vokasi_prod -c "SELECT count(*) FROM pg_stat_activity;"
```

### Troubleshooting

**Issue: Container keeps restarting**

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Common causes:
# - Invalid DATABASE_URL
# - Missing environment variables
# - Port already in use
```

**Issue: Database connection failed**

```bash
# Test connection
docker exec siap-vokasi-api-prod npx prisma db execute --stdin < /dev/null

# Verify DATABASE_URL format
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Issue: Migrations failed**

```bash
# Reset migrations (DANGER: data loss)
docker exec siap-vokasi-api-prod npx prisma migrate reset --force

# Or deploy specific migration
docker exec siap-vokasi-api-prod npx prisma migrate deploy
```

## 🧪 Testing

### Test Structure

```
test/
├── auth.e2e-spec.ts                    # Auth endpoints
├── users.e2e-spec.ts                   # User management
├── applications.e2e-spec.ts            # Application workflow
├── applications.admins.e2e-spec.ts     # Admin operations
├── applications-clsp.e2e-spec.ts       # CLSP workflow
├── applications-skkni.e2e-spec.ts      # SKKNI workflow
├── applications-stage0.e2e-spec.ts     # Stage 0 flow
├── services.e2e-spec.ts                # Service catalog
├── faq.e2e-spec.ts                     # FAQ endpoints
└── register-verify.e2e-spec.ts         # Registration flow
```

### Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- applications.e2e-spec.ts

# Run with coverage
npm run test:cov
```

## 📈 Performance Considerations

1. **Database Optimization**
   - Indexed fields (email, code, name)
   - Efficient queries dengan Prisma select/include
   - Pagination untuk large datasets

2. **Caching Strategy**
   - Static file serving untuk uploads
   - Response caching untuk public endpoints

3. **Logging**
   - Pino logger (high performance)
   - Structured logging
   - Log levels per environment

## 🤝 Development Guidelines

### Code Style

- ESLint + Prettier configured
- Husky + lint-staged untuk pre-commit hooks
- TypeScript strict mode

### Git Workflow

```bash
# Feature branch
git checkout -b feature/feature-name

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# Push and create PR
git push origin feature/feature-name
```

### Module Creation

```bash
# Generate new module
nest generate module module-name
nest generate controller module-name
nest generate service module-name
```

---

## 📦 Repository Git

### Repository Information

- **Repository**: [dark-hermes/siap-vokasi-api](https://github.com/dark-hermes/siap-vokasi-api)
- **Branch Strategy**: Git Flow
- **Default Branch**: `main`
- **Protected Branches**: `main`, `develop`

### Branch Strategy

```mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Setup project"

    branch feature/auth
    checkout feature/auth
    commit id: "Add login"
    commit id: "Add register"
    checkout develop
    merge feature/auth

    branch feature/applications
    checkout feature/applications
    commit id: "Add application module"
    commit id: "Add workflow"
    checkout develop
    merge feature/applications

    checkout main
    merge develop tag: "v1.0.0"

    checkout develop
    branch hotfix/security
    checkout hotfix/security
    commit id: "Fix security issue"
    checkout main
    merge hotfix/security tag: "v1.0.1"
    checkout develop
    merge hotfix/security
```

### Branching Model

| Branch Type | Naming Convention        | Purpose               |
| ----------- | ------------------------ | --------------------- |
| `main`      | `main`                   | Production-ready code |
| `develop`   | `develop`                | Integration branch    |
| `feature/*` | `feature/feature-name`   | New features          |
| `bugfix/*`  | `bugfix/bug-description` | Bug fixes             |
| `hotfix/*`  | `hotfix/critical-fix`    | Production hotfixes   |
| `release/*` | `release/v1.0.0`         | Release preparation   |

### Git Workflow

#### 1. Clone Repository

```bash
git clone https://github.com/dark-hermes/siap-vokasi-api.git
cd siap-vokasi-api
```

#### 2. Create Feature Branch

```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-feature
```

#### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"
```

**Conventional Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

#### 4. Push & Create Pull Request

```bash
# Push to remote
git push origin feature/new-feature

# Create PR via GitHub UI
# Target: develop branch
```

#### 5. Code Review & Merge

- Minimum 1 approval required
- All tests must pass
- No merge conflicts
- Squash and merge to develop

### Git Hooks (Husky)

**Pre-commit:**

- Run ESLint
- Run Prettier
- Format staged files

**Pre-push:**

- Run unit tests
- Check for console.log statements

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log
npm-debug.log*

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
dev-test.db

# Uploads
uploads/*
!uploads/.gitkeep

# Prisma
prisma/prisma-test-client/
```

### Commit Message Examples

```bash
# Feature
git commit -m "feat: add password reset functionality"
git commit -m "feat(auth): implement JWT refresh token rotation"

# Bug fix
git commit -m "fix: resolve application status update issue"
git commit -m "fix(users): correct email validation regex"

# Documentation
git commit -m "docs: update API documentation"
git commit -m "docs: add deployment guide"

# Refactor
git commit -m "refactor: simplify authentication service"
git commit -m "refactor(casl): optimize permission checking"

# Test
git commit -m "test: add e2e tests for applications workflow"
git commit -m "test(auth): increase coverage for JWT strategy"

# Chore
git commit -m "chore: update dependencies"
git commit -m "chore: configure husky pre-commit hooks"
```

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Update version in package.json
npm version minor  # or major, patch

# 3. Update CHANGELOG.md
# Document new features, fixes, breaking changes

# 4. Commit changes
git commit -am "chore: bump version to 1.1.0"

# 5. Merge to main
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags

# 6. Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# 7. Delete release branch
git branch -d release/v1.1.0
```

### Contributing Guidelines

#### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

#### Code Review Checklist

- [ ] Code quality and readability
- [ ] Proper error handling
- [ ] Security considerations
- [ ] Performance implications
- [ ] Test coverage
- [ ] Documentation accuracy
- [ ] Breaking changes identified

### Issue Templates

**Bug Report:**

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. ...

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., Ubuntu 22.04]
- Node: [e.g., v22.0.0]
- Version: [e.g., v1.0.0]
```

**Feature Request:**

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How should it work?

## Alternatives Considered

Other approaches you've thought about
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [CASL Documentation](https://casl.js.org/v6/en)
- [Passport Documentation](http://www.passportjs.org/docs)

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
