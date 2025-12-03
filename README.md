# Stankom API

API Backend untuk landing page Stankom yang dibangun dengan NestJS, Prisma, dan PostgreSQL.

## 📋 Deskripsi

Stankom API adalah sistem backend yang mengelola konten landing page untuk Standar Kompetensi Indonesia, mencakup berita, pengumuman, layanan, galeri, FAQ, dan konten statis lainnya dengan fitur manajemen pengguna dan autentikasi JWT.

## 🏗️ Arsitektur Sistem

### Stack Teknologi

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.9.x
- **Database**: PostgreSQL 17 (melalui Prisma ORM)
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Pino (nestjs-pino)
- **File Upload**: Google Cloud Storage
- **Containerization**: Docker & Docker Compose

### Diagram Arsitektur

```mermaid
graph TB
  Client[Client]
  subgraph API[API Layer]
    Gateway[HTTP Server\nNestJS]
    Swagger[Swagger UI\n/api-docs]
  end

  subgraph Middleware[Middleware]
    CORS[CORS]
    Cookies[Cookie Parser]
    Validation[Validation Pipe]
    Logger[Pino Logger]
  end

  subgraph App[Application Modules]
    Auth[AuthModule]
    Users[UsersModule]
    Content[News/Announcements/FAQ/Gallery/Histories/Hero/Structures/Roles-Responsibilities]
    Social[SocialMedias/SocialMediaPosts]
    Services[ServicesModule]
    Stats[StatisticsModule]
    Guest[GuestModule]
    Storage[StorageModule]
    PrismaM[PrismaModule]
  end

  subgraph Infra[Infrastructure]
    DB[(PostgreSQL)]
  end

  Client --> Gateway
  Gateway --> CORS
  Gateway --> Cookies
  Gateway --> Validation
  Gateway --> Logger
  Gateway --> Swagger

  CORS --> Auth
  CORS --> Users
  CORS --> Content
  CORS --> Social
  CORS --> Services
  CORS --> Stats
  CORS --> Guest
  CORS --> Storage
  CORS --> PrismaM

  Auth --> PrismaM
  Users --> PrismaM
  Content --> PrismaM
  Social --> PrismaM
  Services --> PrismaM
  Stats --> PrismaM
  Storage --> PrismaM

  PrismaM --> DB
```

### API Documentation

- Swagger: otomatis dibuat di non-production pada `GET /api-docs`.
- Global prefix: `api/v1` (lihat `main.ts`).

Endpoint list (contoh representatif, lihat controller untuk detail lengkap):

- Auth (`/api/v1/auth`)
  - `POST /register` – registrasi
  - `POST /login` – login, menghasilkan `accessToken`
  - `GET /profile` – profil user login
  - `POST /logout` – logout
- Users (`/api/v1/users`): `POST`, `GET`, `GET/:id`, `PATCH/:id`, `DELETE/:id`
- News (`/api/v1/news` dan kategori via `guest`): daftar, detail, by slug, by kategori
- Announcements (`/api/v1/announcements`): CRUD + upload lampiran
- Services (`/api/v1/services`): CRUD, update ikon, detail
- FAQ (`/api/v1/faq`): CRUD + publik
- Gallery (`/api/v1/galleries`): CRUD, images one-to-many
- Hero (`/api/v1/hero`): get + update + update banner
- Histories (`/api/v1/histories`): CRUD
- Roles-Responsibilities (`/api/v1/roles-responsibilities`): get + update
- Structures (`/api/v1/structures`): get + update
- Social Medias (`/api/v1/social-medias`): CRUD
- Social Media Posts (`/api/v1/social-media-posts`): CRUD
- Statistics (`/api/v1/statistics` + `categories`): CRUD
- Public (`/api/v1/public/*`): agregasi service, faq, news, galleries, dll.

Contoh request & response:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

```json
{
  "accessToken": "<jwt>"
}
```

Status code umum: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500.

### ERD & Database Schema

Lihat ERD lengkap di section "🗄️ ERD & Database Schema" di bagian bawah. (Duplikat sebelumnya di sini dihapus agar tidak merusak format Markdown dan diagram Mermaid.)

### Flow Data Request

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant M as Middleware
    participant Auth as Auth Guard
    participant Ctrl as Controller
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>G: HTTP Request
    G->>M: Validate CORS & Cookies
    M->>Auth: Check JWT Token
    Auth->>Ctrl: Route to Controller
    Ctrl->>S: Business Logic
    S->>P: Query Builder
    P->>DB: SQL Query
    DB-->>P: Result Set
    P-->>S: Typed Data
    S-->>Ctrl: Processed Data
    Ctrl-->>G: Response DTO
    G-->>C: JSON Response
```

## 📁 Struktur Direktori

```
stankom-api/
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeder
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   │
│   ├── auth/                   # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts     # JWT, login, register
│   │   ├── auth.controller.ts
│   │   ├── strategies/         # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/             # Auth guards
│   │   └── dto/                # Auth DTOs
│   │
│   ├── users/                  # User management module
│   │   ├── users.module.ts
│   │   ├── users.service.ts    # User CRUD operations
│   │   ├── users.controller.ts
│   │   └── dto/                # User DTOs
│   │
│   ├── news/                   # News & categories module
│   │   ├── news.module.ts
│   │   ├── news.service.ts
│   │   ├── news.controller.ts
│   │   ├── news-categories.service.ts
│   │   ├── news-categories.controller.ts
│   │   └── dto/
│   │
│   ├── announcements/          # Announcements module
│   │   ├── announcements.module.ts
│   │   ├── announcements.service.ts
│   │   ├── announcements.controller.ts
│   │   └── dto/
│   │
│   ├── services/               # Services catalog module
│   │   ├── services.module.ts
│   │   ├── services.service.ts
│   │   ├── services.controller.ts
│   │   └── dto/
│   │
│   ├── faq/                    # FAQ module
│   │   ├── faq.module.ts
│   │   ├── faq.service.ts
│   │   ├── faq.controller.ts
│   │   └── dto/
│   │
│   ├── gallery/                # Gallery module
│   │   ├── gallery.module.ts
│   │   ├── gallery.service.ts
│   │   ├── gallery.controller.ts
│   │   └── dto/
│   │
│   ├── hero/                   # Hero section module
│   │   ├── hero.module.ts
│   │   ├── hero.service.ts
│   │   ├── hero.controller.ts
│   │   └── dto/
│   │
│   ├── histories/              # History module
│   │   ├── histories.module.ts
│   │   ├── histories.service.ts
│   │   └── histories.controller.ts
│   │
│   ├── roles-responsibilities/ # Roles & Responsibilities module
│   │   ├── roles-responsibilities.module.ts
│   │   ├── roles-responsibilities.service.ts
│   │   └── roles-responsibilities.controller.ts
│   │
│   ├── structures/             # Organization structure module
│   │   ├── structures.module.ts
│   │   ├── structures.service.ts
│   │   └── structures.controller.ts
│   │
│   ├── director-profiles/      # Director profiles module
│   │   ├── director-profiles.module.ts
│   │   ├── director-profiles.service.ts
│   │   └── director-profiles.controller.ts
│   │
│   ├── social-medias/          # Social media links module
│   │   ├── social-medias.module.ts
│   │   ├── social-medias.service.ts
│   │   └── social-medias.controller.ts
│   │
│   ├── social-media-posts/     # Social media posts module
│   │   ├── social-media-posts.module.ts
│   │   ├── social-media-posts.service.ts
│   │   └── social-media-posts.controller.ts
│   │
│   ├── statistics/             # Statistics module
│   │   ├── statistics.module.ts
│   │   ├── statistics.service.ts
│   │   └── statistics.controller.ts
│   │
│   ├── guest/                  # Public endpoints module
│   │   ├── guest.module.ts
│   │   ├── guest.service.ts
│   │   └── guest.controller.ts
│   │
│   ├── storage/                # File upload module
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts
│   │   └── upload.controller.ts
│   │
│   ├── prisma/                 # Prisma service (global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts   # Database connection handler
│   │
│   ├── common/                 # Shared utilities
│   │   ├── dto/                # Common DTOs
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── interceptors/       # Response interceptors
│   │   ├── middleware/         # Custom middleware
│   │   └── utils/              # Helper functions
│   │
│   ├── config/                 # Configuration files
│   │   └── pino-logger.config.ts
│   │
│   └── types/                  # TypeScript type definitions
│
├── test/                       # E2E tests
│   ├── jest-e2e.json
│   ├── global-setup.js
│   └── *.e2e-spec.ts
│
├── ops/                        # Operations & deployment
│   └── caddy/                  # Caddy reverse proxy config
│       └── Caddyfile
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
- Cookie-based token management

**Services:**
- `AuthService`: Business logic untuk authentication
  - `register()`: Registrasi user baru
  - `login()`: Autentikasi user, generate JWT token
  - `validateUser()`: Validasi credentials

**Guards & Strategies:**
- `JwtStrategy`: Passport strategy untuk validasi JWT dari cookie
- `JwtAuthGuard`: Guard untuk protect routes

---

#### 2. **Users Module** (`users/`)

**Tanggung Jawab:**
- Manajemen user (CRUD)
- User data management

**Services:**
- `UsersService`: User management logic
  - `findAll()`: List users dengan pagination
  - `findOne()`: Get user by ID
  - `findOneByEmail()`: Get user by email
  - `create()`: Create new user dengan bcrypt hashing
  - `update()`: Update user data
  - `remove()`: Delete user

---

#### 3. **News Module** (`news/`)

**Tanggung Jawab:**
- Manajemen berita dan kategori
- Tags management (many-to-many)
- Status management (draft, published, archived)

**Services:**
- `NewsService`: News CRUD operations
- `NewsCategoriesService`: Category management

---

#### 4. **Announcements Module** (`announcements/`)

**Tanggung Jawab:**
- Manajemen pengumuman (CRUD)
- Upload attachment (opsional)

**Services:**
- `AnnouncementsService`: Announcement business logic

---

### Penjelasan Relasi Antar Tabel

#### 1. User Relations

**User → Content (One-to-Many)**
- Seorang user dapat membuat multiple konten (news, announcements, faq, services, dll)
- Setiap konten memiliki `createdById` dan `updatedById` untuk audit trail
- Foreign Keys: `createdById`, `updatedById` references `User.id`

#### 2. News Relations

**NewsCategory ↔ News (One-to-Many)**
- Satu kategori dapat memiliki banyak berita
- Setiap berita memiliki satu kategori
- Foreign Key: `categoryId` references `NewsCategory.id`

### Development Environment

**Menjalankan dengan Docker:**

```bash
# Start all services (API, PostgreSQL, PgAdmin)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

**Services yang berjalan:**
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`

**Menjalankan tanpa Docker:**

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm run seed

# Start development server
pnpm run start:dev
```

### Production Environment

**Docker Production Setup:**

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Production Services:**
- API: Internal port 3000 (accessed via Caddy)
- Caddy: Reverse proxy on ports 80/443
- Automatic HTTPS via Let's Encrypt

### Multi-Stage Dockerfile

```dockerfile
FROM node:22-alpine AS base          # Base image
FROM base AS prod_dependencies       # Production deps only
FROM base AS builder                 # Build stage
FROM base AS development             # Dev environment
FROM base AS production              # Production image (optimized)
```

**Optimizations:**
- Layer caching untuk dependencies
- Production-only dependencies
- Prisma Client pre-generated
- Security best practices (non-root user, minimal image)

---

## 🛠️ Cara Menjalankan Aplikasi

### Prerequisites

- Node.js 22.x
- pnpm 9.x
- PostgreSQL 17 (atau via Docker)
- Google Cloud Storage account (untuk file upload)

### Setup Lokal

1. **Clone repository:**

```bash
git clone https://github.com/dark-hermes/stankom-api.git
cd stankom-api
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Setup environment variables:**

Buat file `.env` di root project:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stankom_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cookies
COOKIE_SECRET=your-super-secret-cookie-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Local Uploads
UPLOAD_DEST=uploads
```

4. **Setup database:**

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm run seed

# Open Prisma Studio (optional)
pnpm prisma studio
```

5. **Start development server:**

```bash
pnpm run start:dev
```

Server akan berjalan di `http://localhost:3000/api/v1`  
Swagger docs di `http://localhost:3000/api-docs`

### Scripts Tersedia

```bash
# Development
pnpm run start:dev        # Start with watch mode
pnpm run start:debug      # Start with debug mode

# Build
pnpm run build            # Build for production

# Production
pnpm run start:prod       # Start production build

# Testing
pnpm run test             # Run unit tests
pnpm run test:e2e         # Run E2E tests
pnpm run test:cov         # Run tests with coverage

# Database
pnpm prisma generate      # Generate Prisma Client
pnpm prisma migrate dev   # Create and apply migration
pnpm prisma migrate deploy # Apply migrations (production)
pnpm prisma studio        # Open Prisma Studio GUI
pnpm run seed             # Seed database

# Linting & Formatting
pnpm run lint             # Lint code
pnpm run format           # Format code with Prettier
```

---

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only - WARNING: deletes all data)
npx prisma migrate reset

# Seed database
pnpm run seed

# Open Prisma Studio (GUI)
npx prisma studio
```

### Database Seeding

Seed script (`prisma/seed.ts`) membuat data awal untuk development.

---

## 📝 Environment Variables

### Required Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stankom_db?schema=public
DB_USER=stankom_user
DB_PASSWORD=secure_password
DB_NAME=stankom_db
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cookies
COOKIE_SECRET=your-super-secret-cookie-key

# Public Base URL for generating absolute file URLs
PUBLIC_BASE_URL=http://localhost:3000

# Local Uploads
UPLOAD_DEST=uploads
```

### Environment Variables Explanation

| Variable          | Description                                  | Default                                                | Required    |
| ----------------- | -------------------------------------------- | ------------------------------------------------------ | ----------- |
| `NODE_ENV`        | Environment mode                              | `development`                                          | ✅          |
| `PORT`            | Server port                                   | `3000`                                                 | ✅          |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated)        | -                                                      | ✅          |
| `DATABASE_URL`    | PostgreSQL connection string                  | -                                                      | ✅          |
| `DB_USER`         | Database username (for Docker compose usage)  | -                                                      | ✅ (Docker) |
| `DB_PASSWORD`     | Database password (for Docker compose usage)  | -                                                      | ✅ (Docker) |
| `DB_NAME`         | Database name (for Docker compose usage)      | -                                                      | ✅ (Docker) |
| `DB_PORT`         | Database port (for Docker compose usage)      | `5432`                                                 | ✅ (Docker) |
| `JWT_SECRET`      | JWT signing secret                            | -                                                      | ✅          |
| `COOKIE_SECRET`   | Cookie signing secret                         | -                                                      | ✅          |
| `PUBLIC_BASE_URL` | Base URL for absolute asset links             | -                                                      | ❌          |
| `UPLOAD_DEST`     | Local upload root directory                   | `uploads`                                              | ❌          |

---

## 📋 Server Specification

### Development

- **CPU**: 1 vCPU
- **RAM**: 1 GB
- **Disk**: 10 GB
- **OS**: Linux / macOS / Windows

### Production (Minimum)

- **CPU**: 1-2 vCPU
- **RAM**: 2 GB
- **Disk**: 20 GB SSD
- **OS**: Linux (Ubuntu 22.04 LTS recommended)
- **Database**: PostgreSQL 17 (dapat dipisah ke server terpisah)

### Production (Recommended)

- **CPU**: 2-4 vCPU
- **RAM**: 4 GB
- **Disk**: 50 GB SSD
- **Database**: Managed PostgreSQL atau dedicated PostgreSQL server
- **CDN**: Cloudflare untuk static assets
- **Monitoring**: Uptime monitoring & error tracking

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
git clone https://github.com/dark-hermes/stankom-api.git
cd stankom-api
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
ALLOWED_ORIGINS=https://stankom.id,https://admin.stankom.id

DATABASE_URL=postgresql://stankom_user:secure_password@db:5432/stankom_db
DB_USER=stankom_user
DB_PASSWORD=secure_password
DB_NAME=stankom_db
DB_PORT=5432

JWT_SECRET=<generate-strong-random-secret-min-32-chars>
COOKIE_SECRET=<generate-strong-random-secret>

GCS_BUCKET_NAME=stankom-bucket
GCS_KEY_FILE=./gcs-key.json
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
docker exec -it stankom-api-prod sh

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
curl http://localhost:3000/api/v1/public/news
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
CREATE DATABASE stankom_db;
CREATE USER stankom_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE stankom_db TO stankom_user;
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
pm2 start dist/src/main.js --name stankom-api -i max
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
api.stankom.id {
    reverse_proxy localhost:3000

    encode gzip

    log {
        output file /var/log/caddy/stankom-api.log
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

#### 3. Start Application (PM2)

```bash
# Start API dengan PM2
pm2 start dist/src/main.js --name stankom-api -i max
pm2 save
```

#### 4. Reload Caddy

```bash
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy
```

#### 5. Setup Automatic Updates (Optional)

**Deploy script (`deploy.sh`):**

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Stankom API..."

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile --prod

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
pnpm build

# Restart PM2
pm2 restart stankom-api

echo "✅ Deployment complete!"
```

```bash
# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

---

## 🔄 CI/CD Pipeline

### Recommended CI/CD Setup (GitHub Actions)

**Workflow file (`.github/workflows/deploy.yml`):**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/stankom-api
            git pull origin main
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml exec -T api pnpm prisma migrate deploy
```

**Contoh DDL untuk tabel Users:**

```sql
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**Contoh DDL untuk tabel News:**

```sql
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "status" "NewsStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

ALTER TABLE "News" ADD CONSTRAINT "News_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "News" ADD CONSTRAINT "News_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "User"("id") 
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

---

## 🔐 Dokumentasi Security

### 1. Authentication (Autentikasi)

#### JWT (JSON Web Token)

Aplikasi menggunakan **JWT** sebagai mekanisme autentikasi utama:

**Token Configuration:**
- **Storage**: HttpOnly signed cookie dengan nama `access_token`
- **Extraction**: Via `passport-jwt` extractor dari cookie
- **Secret**: Diambil dari `ConfigService` (`jwt.secret`)
- **Payload**:
  ```json
  {
    "sub": 1,
    "email": "user@example.com",
    "iat": 1701432000,
    "exp": 1701435600
  }
  ```

**JWT Flow:**

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Controller
    participant AS as Auth Service
    participant US as Users Service
    participant DB as Database

    C->>A: POST /auth/login (credentials)
    A->>AS: login()
    AS->>US: validateUser()
    US->>DB: findByEmail()
    DB-->>US: User data
    US->>US: bcrypt.compare()
    US-->>AS: User (without password)
    AS->>AS: Generate JWT
    AS-->>A: { accessToken }
    A-->>C: Set HttpOnly Cookie + JSON response
```

#### Password Security

**Hashing Algorithm: bcrypt**
- Cost factor: 10 rounds (default)
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
- Minimum 8 characters (enforced via validation)
- Validated via `class-validator`

#### Session Management

- **Stateless**: Server tidak menyimpan session state
- **Cookie-based**: JWT dikirim via secure HttpOnly cookies
- **Cookie Secret**: Menggunakan `COOKIE_SECRET` dari environment

### 2. Authorization (Otorisasi)

#### Guards

- **JwtAuthGuard**: Memastikan request memiliki valid JWT
- Protected endpoints menggunakan `@UseGuards(JwtAuthGuard)`
- Public endpoints (di `GuestModule`) tidak menggunakan guard

### 3. Data Protection

#### Encryption & Hashing

| Data Type | Method | Purpose |
|-----------|--------|---------|
| Password | bcrypt (10 rounds) | Irreversible hashing |
| JWT | HS256 (HMAC-SHA256) | Token signing |
| Sensitive Config | Environment Variables | Keep secrets out of code |

#### Audit Logging

Semua konten memiliki audit trail:
- `createdById`: User yang membuat
- `updatedById`: User yang mengupdate terakhir
- `createdAt`: Timestamp creation
- `updatedAt`: Timestamp update

#### Public Endpoint Data Sanitization

**Sensitive Data Protection**: Untuk mencegah kebocoran kredensial, semua public endpoints (`/api/v1/public/*`) otomatis membersihkan data sensitif dari response:

- **Password hashes**: Dihapus dari objek user (`createdBy`, `updatedBy`)
- **Email addresses**: Dihapus dari objek user di public responses
- **Preserved data**: User ID dan name tetap ditampilkan untuk attribution

**Implementation**: 
```typescript
// src/common/utils/sanitize-user-data.ts
export function sanitizeUserData<T>(data: T): T {
  // Recursively removes password and email from user objects
  // Applied to all GuestController responses
}
```

**Protected endpoints** (authenticated admin access) tetap menerima data lengkap untuk keperluan audit dan administrasi.

### 4. Request Protection

#### CORS (Cross-Origin Resource Sharing)

```typescript
// CORS configuration in main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### Input Validation

**class-validator** + **class-transformer**:

```typescript
export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsPositive()
  categoryId: number;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;
}
```

**Global Validation Pipe:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip non-whitelisted properties
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw error on extra properties
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 🔌 API Endpoints

### Public Endpoints

```
GET  /api/v1/public/news                      # List published news
GET  /api/v1/public/news/slug/:slug           # Get news by slug
GET  /api/v1/public/news/categories           # List categories
GET  /api/v1/public/news/categories/:id/news  # News by category
GET  /api/v1/public/announcements             # List announcements
GET  /api/v1/public/galleries                 # List galleries
GET  /api/v1/public/faq                       # List FAQs
GET  /api/v1/public/services                  # List services
GET  /api/v1/public/hero                      # Get hero section
GET  /api/v1/public/histories                 # List histories
GET  /api/v1/public/roles-responsibilities    # Get roles & responsibilities
GET  /api/v1/public/structure                 # Get organization structure
GET  /api/v1/public/director-profiles         # List director profiles
GET  /api/v1/public/social-medias             # List social media links
GET  /api/v1/public/social-media-posts        # List social media posts
GET  /api/v1/public/statistics                # List statistics
GET  /api/v1/public/statistics/categories     # List statistic categories
```

### Authentication

```
POST /api/v1/auth/register     # Register new user
POST /api/v1/auth/login        # Login user
GET  /api/v1/auth/profile      # Get current user profile
POST /api/v1/auth/logout       # Logout user
```

### Protected Endpoints

#### Users (Requires JWT)

```
GET    /api/v1/users?page&limit            # List users (supports pagination)
GET    /api/v1/users/:id                   # Get user detail
POST   /api/v1/users                       # Create user { name, email, password }
PATCH  /api/v1/users/:id                   # Update user { name?, password? }
DELETE /api/v1/users/:id                   # Delete user
```

#### News Management

```
GET    /api/v1/news?status&categoryId&search&page&limit   # List news (filter by status/category, search, pagination)
GET    /api/v1/news/:id                                   # Get news detail by ID
POST   /api/v1/news                                       # Create news { title, excerpt, description, categoryId, status?, tagIds? }
PUT    /api/v1/news/:id                                   # Update news { title?, excerpt?, description?, categoryId?, status?, tagIds? }
DELETE /api/v1/news/:id                                   # Delete news
```

#### News Categories

```
GET    /api/v1/news-categories?page&limit        # List categories (pagination)
GET    /api/v1/news-categories/:id               # Get category detail
POST   /api/v1/news-categories                   # Create category { title }
PUT    /api/v1/news-categories/:id               # Update category { title }
DELETE /api/v1/news-categories/:id               # Delete category
```

#### Announcements

```
GET    /api/v1/announcements?page&limit&search        # List announcements (pagination + optional search)
GET    /api/v1/announcements/:id                      # Get announcement detail
POST   /api/v1/announcements                          # Create { title, description, attachment? }
PUT    /api/v1/announcements/:id                      # Update { title?, description?, attachment? }
DELETE /api/v1/announcements/:id                      # Delete announcement
POST   /api/v1/announcements/:id/upload-attachment    # Upload/replace attachment file
```

#### Services

```
GET    /api/v1/services?page&limit&search          # List services (pagination + search)
GET    /api/v1/services/:id                        # Get service detail
POST   /api/v1/services                            # Create { title, description, icon, link? }
PUT    /api/v1/services/:id                        # Update { title?, description?, icon?, link? }
PUT    /api/v1/services/:id/icon                   # Update service icon (multipart/form-data)
DELETE /api/v1/services/:id                        # Delete service
```

#### FAQ

```
GET    /api/v1/faq        # List FAQs
GET    /api/v1/faq/:id    # Get FAQ detail
POST   /api/v1/faq        # Create FAQ
PUT    /api/v1/faq/:id    # Update FAQ
DELETE /api/v1/faq/:id    # Delete FAQ
```

#### Gallery

```
GET    /api/v1/galleries        # List galleries
GET    /api/v1/galleries/:id    # Get gallery detail
POST   /api/v1/galleries        # Create gallery
PUT    /api/v1/galleries/:id    # Update gallery
DELETE /api/v1/galleries/:id    # Delete gallery
```

#### Hero Section

```
GET  /api/v1/hero         # Get hero section
PUT  /api/v1/hero         # Update hero section
PUT  /api/v1/hero/banner  # Update hero banner
```

#### Histories

```
GET    /api/v1/histories        # List histories
GET    /api/v1/histories/:id    # Get history detail
POST   /api/v1/histories        # Create history
PUT    /api/v1/histories/:id    # Update history
DELETE /api/v1/histories/:id    # Delete history
```

#### Roles & Responsibilities

```
GET  /api/v1/roles-responsibilities  # Get roles & responsibilities
PUT  /api/v1/roles-responsibilities  # Update roles & responsibilities
```

#### Structures

```
GET  /api/v1/structures  # Get organization structure
PUT  /api/v1/structures  # Update organization structure
```

#### Director Profiles

```
GET    /api/v1/director-profiles        # List director profiles
GET    /api/v1/director-profiles/:id    # Get profile detail
POST   /api/v1/director-profiles        # Create profile
PUT    /api/v1/director-profiles/:id    # Update profile
DELETE /api/v1/director-profiles/:id    # Delete profile
```

#### Social Medias

```
GET    /api/v1/social-medias        # List social media links
GET    /api/v1/social-medias/:id    # Get social media detail
POST   /api/v1/social-medias        # Create social media
PUT    /api/v1/social-medias/:id    # Update social media
DELETE /api/v1/social-medias/:id    # Delete social media
```

#### Social Media Posts

```
GET    /api/v1/social-media-posts        # List posts
GET    /api/v1/social-media-posts/:id    # Get post detail
POST   /api/v1/social-media-posts        # Create post
PUT    /api/v1/social-media-posts/:id    # Update post
DELETE /api/v1/social-media-posts/:id    # Delete post
```

#### Statistics

```
GET    /api/v1/statistics                  # List statistics
GET    /api/v1/statistics/:id              # Get statistic detail
POST   /api/v1/statistics                  # Create statistic
PUT    /api/v1/statistics/:id              # Update statistic
DELETE /api/v1/statistics/:id              # Delete statistic
GET    /api/v1/statistics/categories       # List categories
POST   /api/v1/statistics/categories       # Create category
PUT    /api/v1/statistics/categories/:id   # Update category
DELETE /api/v1/statistics/categories/:id   # Delete category
```

#### File Upload

```
POST /api/v1/upload/image  # Upload image; response.url absolute (PUBLIC_BASE_URL + /uploads/images/...) like http://localhost:3000/uploads/images/<file>
```

---



### HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| **200** | OK | Request berhasil |
| **201** | Created | Resource berhasil dibuat |
| **204** | No Content | Request berhasil tanpa response body |
| **400** | Bad Request | Validation error atau invalid input |
| **401** | Unauthorized | Authentication required atau token invalid |
| **403** | Forbidden | User tidak memiliki permission |
| **404** | Not Found | Resource tidak ditemukan |
| **409** | Conflict | Duplicate entry (email/slug sudah ada) |
| **422** | Unprocessable Entity | Business logic error |
| **500** | Internal Server Error | Server error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

<!-- Duplicate minimal deployment section removed (sudah ada bagian "🚀 Deployment Guide") -->

#### 6. **FAQ Module** (`faq/`)

**Tanggung Jawab:**
- Manajemen FAQ
- Public access untuk FAQ list

**Services:**
- `FaqService`: FAQ management

---

#### 7. **Gallery Module** (`gallery/`)

**Tanggung Jawab:**
- Manajemen galeri
- One-to-many images per gallery

**Services:**
- `GalleryService`: Gallery & images management

---

#### 8. **Guest Module** (`guest/`)

**Tanggung Jawab:**
- Endpoint publik tanpa autentikasi
- Agregasi konten untuk frontend

**Services:**
- `GuestService`: Public data access

---

### Infrastructure Modules

#### 9. **Prisma Module** (`prisma/`)

**Tanggung Jawab:**
- Database connection management
- Query execution
- Transaction handling

**Services:**
- `PrismaService`: Global database service
  - Extends `PrismaClient`
  - Connection lifecycle management

---

#### 10. **Storage Module** (`storage/`)

**Tanggung Jawab:**
- File upload ke Google Cloud Storage
- Image optimization

**Services:**
- `StorageService`: GCS integration
  - `uploadFile()`: Upload file ke GCS
  - `deleteFile()`: Delete file dari GCS

---

## 🗄️ ERD & Database Schema

### Model Utama

#### Content Management

- **User**: Data pengguna sistem
- **NewsCategory**: Kategori berita dengan slug
- **News**: Berita dengan status, kategori, dan tags
- **Tag**: Tag untuk berita (many-to-many)
- **NewsTag**: Junction table News <-> Tag
- **Announcement**: Pengumuman dengan attachment
- **Service**: Layanan dengan icon dan link
- **Gallery**: Galeri dengan multiple images
- **GalleryImage**: Gambar dalam galeri
- **Faq**: FAQ dengan question dan answer

#### Static Content

- **HeroSection**: Hero banner dan video
- **History**: Sejarah organisasi
- **RolesResponsibilities**: Peran dan tanggung jawab
- **Structure**: Struktur organisasi
- **DirectorProfile**: Profil direktur dengan order
- **SocialMedia**: Link sosial media (enum type)
- **SocialMediaPost**: Post sosial media
- **StatisticCategory**: Kategori statistik
- **Statistic**: Data statistik

### Penjelasan Relasi

Ringkasan relasi utama antar model:
- `NewsCategory` → `News` (one-to-many; `slug` unik; createdBy/updatedBy `User`)
- `News` — memiliki `category` (fk), createdBy/updatedBy `User`, many-to-many `Tag` via `NewsTag`; status enum `NewsStatus`
- `Tag` — unik `name` dan `slug`
- `Announcement` — createdBy/updatedBy `User`
- `Service` — createdBy/updatedBy `User`
- `Gallery` — memiliki `images` (one-to-many `GalleryImage`)
- `Faq` — createdBy/updatedBy `User`
- `SocialMedia` — enum `SocialMediaType` + `link`
- `SocialMediaPost` — platform enum, createdBy/updatedBy `User`
- `StatisticCategory` — one-to-many `Statistic`
- `Statistic` — fk ke kategori
- `HeroSection`, `RolesResponsibilities`, `Structure`, `DirectorProfile` — konten statis/dikelola

Relasi antar tabel:

- One-to-many: `User` → konten (createdBy/updatedBy), `NewsCategory` → `News`, `Gallery` → `GalleryImage`, `StatisticCategory` → `Statistic`
- Many-to-many: `News` ↔ `Tag` melalui `NewsTag` (composite PK `[newsId, tagId]`)
- Enum: `NewsStatus`, `SocialMediaType`

Struktur tabel (DDL) direpresentasikan oleh Prisma; migrasi tersedia di `prisma/migrations/*`.

ERD (Mermaid):

```mermaid
erDiagram
  User ||--o{ NewsCategory : creates
  User ||--o{ News : creates
  User ||--o{ Announcement : creates
  User ||--o{ Faq : creates
  User ||--o{ Service : creates
  User ||--o{ SocialMediaPost : creates

  NewsCategory ||--o{ News : has

  News }o--o{ Tag : via NewsTag

  StatisticCategory ||--o{ Statistic : has

  Gallery ||--o{ GalleryImage : has

  SocialMediaPost ||--|| User : createdBy

  User {
    int id PK
    string email UK
    string password
    string name
    datetime createdAt
    datetime updatedAt
  }

  NewsCategory {
    int id PK
    string title
    string slug UK
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  News {
    int id PK
    string title
    string slug UK
    string excerpt
    text description
    text image
    enum status
    int categoryId FK
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  Tag {
    int id PK
    string name UK
    string slug UK
    datetime createdAt
    datetime updatedAt
  }

  NewsTag {
    int newsId FK
    int tagId FK
    composite_pk newsId_tagId
  }

  Announcement {
    int id PK
    string title
    text description
    text attachment
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  Service {
    int id PK
    string title
    text description
    text icon
    text link
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  Gallery {
    int id PK
    string title
    text description
    datetime createdAt
    datetime updatedAt
  }

  GalleryImage {
    int id PK
    int galleryId FK
    text image
  }

  Faq {
    int id PK
    string question
    text answer
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  SocialMedia {
    int id PK
    enum name UK
    text link
    datetime createdAt
    datetime updatedAt
  }

  SocialMediaPost {
    int id PK
    enum platform
    text postLink
    int createdById FK
    int updatedById FK
    datetime createdAt
    datetime updatedAt
  }

  StatisticCategory {
    int id PK
    string name
    text link
    datetime createdAt
    datetime updatedAt
  }

  Statistic {
    int id PK
    string name
    int number
    text link
    int categoryId FK
    datetime createdAt
    datetime updatedAt
  }
```

### Repository Git

- Owner: `dark-hermes`
- Repo: `stankom-api`
- Branch: `main`

### Dokumentasi Security

- **Autentikasi**: JWT Bearer disimpan di cookie `access_token` bertanda tangan; diambil oleh `passport-jwt` extractor pada `JwtStrategy`.
- **Otorisasi**: Guard JWT pada endpoint terproteksi; beberapa endpoint publik tersedia di `GuestModule`.
- **Password**: hashing menggunakan `bcrypt` (lihat `AuthService` dan `UsersService`).
- **RBAC**: Peran akses berbasis modul; relasi createdBy/updatedBy memudahkan audit.
- **Validasi**: `ValidationPipe` global dengan `whitelist`, `forbidNonWhitelisted`, dan implicit conversion.
- **CORS**: daftar origin di env `ALLOWED_ORIGINS` (comma-separated), `credentials: true`.
- **Cookies**: `cookie-parser` dengan secret dari `COOKIE_SECRET`; fallback insecure bila tidak diset (log warning).

<!-- Duplicate local deployment guide removed (covered above). -->

Referensi gaya dokumentasi: lihat `siapvokasi-readme.md` untuk contoh lebih komprehensif.
