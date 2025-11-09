# Services API Documentation

## Overview

The Services API module provides complete CRUD operations for managing services in the STANKOM application. This module follows the same patterns as other modules (News, Announcements) for consistency and maintainability.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination support with search and filtering
- ✅ File upload for service icons (SVG, PNG, JPG, JPEG)
- ✅ JWT Authentication with cookie support
- ✅ Swagger/OpenAPI documentation
- ✅ Audit interceptor for tracking user actions
- ✅ Type-safe with TypeScript and Prisma
- ✅ Reusable utilities (pagination, search, sorting)

## Database Schema

```prisma
model Service {
  id          Int      @id @default(autoincrement())
  title       String
  description String   @db.Text
  icon        String   @db.Text
  link        String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Module Structure

```
src/services/
├── dto/
│   ├── create-service.dto.ts      # DTO for creating services
│   ├── update-service.dto.ts      # DTO for updating services
│   └── service-response.dto.ts    # Response wrapper DTO
├── services.controller.ts         # API endpoints
├── services.service.ts            # Business logic
├── services.module.ts             # Module definition
├── services.controller.spec.ts    # Controller tests
└── services.service.spec.ts       # Service tests
```

## API Endpoints

### Base URL
```
http://localhost:3000/services
```

All endpoints require JWT authentication via cookies.

---

### 1. Create Service

**POST** `/services`

Creates a new service with an icon upload.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
title: string (required) - Service title
description: string (required) - Service description
link: string (optional) - Service link URL
file: file (required) - Icon file (max 5MB, jpg/jpeg/png/svg)
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/services \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "title=Layanan Perpajakan" \
  -F "description=Layanan perpajakan untuk masyarakat umum" \
  -F "link=https://pajak.stankom.go.id" \
  -F "file=@/path/to/icon.svg"
```

**Response (201 Created):**
```json
{
  "message": "Layanan berhasil dibuat.",
  "data": {
    "id": 1,
    "title": "Layanan Perpajakan",
    "description": "Layanan perpajakan untuk masyarakat umum",
    "icon": "https://storage.googleapis.com/bucket/services/abc-123.svg",
    "link": "https://pajak.stankom.go.id",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T10:00:00.000Z"
  }
}
```

---

### 2. Get All Services (with Pagination)

**GET** `/services`

Retrieves all services with pagination, search, and sorting support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term (searches in title and description)
- `sortBy` (optional): Sort field and order (e.g., `title:asc`, `createdAt:desc`)

**Example (cURL):**
```bash
# Get all services (page 1, limit 10)
curl -X GET "http://localhost:3000/services" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"

# With search and pagination
curl -X GET "http://localhost:3000/services?page=1&limit=5&search=pajak&sortBy=title:asc" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Layanan Perpajakan",
      "description": "Layanan perpajakan untuk masyarakat umum",
      "icon": "https://storage.googleapis.com/bucket/services/abc-123.svg",
      "link": "https://pajak.stankom.go.id",
      "createdAt": "2025-11-09T10:00:00.000Z",
      "updatedAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "links": {
    "first": "http://localhost:3000/services?page=1&limit=10",
    "previous": null,
    "next": "http://localhost:3000/services?page=2&limit=10",
    "last": "http://localhost:3000/services?page=5&limit=10"
  }
}
```

---

### 3. Get Service by ID

**GET** `/services/:id`

Retrieves a single service by its ID.

**Example (cURL):**
```bash
curl -X GET http://localhost:3000/services/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Layanan Perpajakan",
  "description": "Layanan perpajakan untuk masyarakat umum",
  "icon": "https://storage.googleapis.com/bucket/services/abc-123.svg",
  "link": "https://pajak.stankom.go.id",
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Layanan tidak ditemukan."
}
```

---

### 4. Update Service

**PUT** `/services/:id`

Updates an existing service. All fields are optional. Can include a new icon file.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
title: string (optional) - Service title
description: string (optional) - Service description
link: string (optional) - Service link URL
file: file (optional) - New icon file (max 5MB, jpg/jpeg/png/svg)
```

**Example (cURL):**
```bash
# Update title and description only
curl -X PUT http://localhost:3000/services/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "title=Layanan Perpajakan Baru" \
  -F "description=Updated description"

# Update with new icon
curl -X PUT http://localhost:3000/services/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "title=Layanan Perpajakan Baru" \
  -F "file=@/path/to/new-icon.png"
```

**Response (200 OK):**
```json
{
  "message": "Layanan berhasil diperbarui.",
  "data": {
    "id": 1,
    "title": "Layanan Perpajakan Baru",
    "description": "Updated description",
    "icon": "https://storage.googleapis.com/bucket/services/xyz-456.png",
    "link": "https://pajak.stankom.go.id",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T11:00:00.000Z"
  }
}
```

---

### 5. Update Service Icon Only

**PUT** `/services/:id/icon`

Updates only the icon for a specific service.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: file (required) - New icon file (max 5MB, jpg/jpeg/png/svg)
```

**Example (cURL):**
```bash
curl -X PUT http://localhost:3000/services/1/icon \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "file=@/path/to/new-icon.svg"
```

**Response (200 OK):**
```json
{
  "message": "Ikon layanan berhasil diperbarui.",
  "data": {
    "id": 1,
    "title": "Layanan Perpajakan",
    "description": "Layanan perpajakan untuk masyarakat umum",
    "icon": "https://storage.googleapis.com/bucket/services/new-icon-789.svg",
    "link": "https://pajak.stankom.go.id",
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T11:30:00.000Z"
  }
}
```

---

### 6. Delete Service

**DELETE** `/services/:id`

Deletes a service by ID.

**Example (cURL):**
```bash
curl -X DELETE http://localhost:3000/services/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "message": "Layanan berhasil dihapus."
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Layanan tidak ditemukan."
}
```

---

## DTOs (Data Transfer Objects)

### CreateServiceDto

```typescript
{
  title: string;        // required
  description: string;  // required
  icon: string;         // required (set by file upload)
  link?: string;        // optional
}
```

### UpdateServiceDto

```typescript
{
  title?: string;       // optional
  description?: string; // optional
  icon?: string;        // optional (set by file upload)
  link?: string;        // optional
}
```

### ServiceResponseDto

```typescript
{
  message: string;
  data: Service;
}
```

---

## Validation Rules

### File Upload Constraints
- **Max Size:** 5MB
- **Allowed Types:** jpg, jpeg, png, svg
- **Storage:** Google Cloud Storage (GCS)
- **Path:** `services/{filename}`

### Field Constraints
- `title`: Required, string
- `description`: Required, string (stored as TEXT in database)
- `icon`: Required on creation, string (URL)
- `link`: Optional, string (URL)

---

## Reusable Utilities

The Services module leverages reusable utilities for consistency:

### 1. Pagination Helper (`paginate`)
```typescript
import { paginate } from '../common/utils/paginator';

// Automatically handles pagination logic
const result = await paginate<Service>(
  this.prisma.service,
  { where, orderBy },
  { page, limit, baseUrl }
);
```

### 2. Search and Filter Helper
```typescript
import { createPrismaWhereClause } from '../common/utils/prisma-helpers';

// Creates WHERE clause for searching
const where = createPrismaWhereClause<Prisma.ServiceWhereInput>(
  query,
  ['title', 'description']
);
```

### 3. Sorting Helper
```typescript
import { createPrismaOrderByClause } from '../common/utils/prisma-helpers';

// Creates ORDER BY clause from query string
const orderBy = createPrismaOrderByClause(query.sortBy);
```

### 4. File Upload Service
```typescript
import { StorageService } from '../storage/storage.service';

// Uploads file to GCS and returns URL
const url = await this.storageService.uploadFile(file, 'services/');
```

---

## Authentication & Authorization

All endpoints are protected with:
- **JwtAuthGuard**: Validates JWT token from cookies
- **AuditInterceptor**: Tracks user actions (createdBy, updatedBy)

The user ID is automatically extracted from the JWT token and used for audit tracking.

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "statusCode": 404,
  "message": "Layanan tidak ditemukan.",
  "error": "Not Found"
}
```

---

## Testing

### Unit Tests

Run unit tests:
```bash
pnpm test services
```

### E2E Tests

Run end-to-end tests:
```bash
pnpm test:e2e
```

### Manual Testing with Swagger

1. Start the development server:
   ```bash
   pnpm run start:dev
   ```

2. Open Swagger UI:
   ```
   http://localhost:3000/api
   ```

3. Look for the "Services" section in the API documentation

---

## Code Patterns Followed

### 1. **Consistent Module Structure**
- Same pattern as `news` and `announcements` modules
- Separation of concerns (Controller → Service → Repository)

### 2. **DTO Validation**
- Using `class-validator` decorators
- Swagger decorations for API documentation

### 3. **Prisma Integration**
- Type-safe database queries
- Proper handling of nullable fields

### 4. **File Upload Pattern**
- Multipart form data handling
- Integration with Google Cloud Storage
- Proper validation (size, type)

### 5. **Response Format**
- Consistent response structure
- Indonesian language messages for end users
- Proper HTTP status codes

### 6. **Security**
- JWT authentication on all endpoints
- Cookie-based token storage
- Guards and interceptors

---

## Integration with Frontend

### Example: Create Service with File Upload

```javascript
const formData = new FormData();
formData.append('title', 'Layanan Perpajakan');
formData.append('description', 'Layanan perpajakan untuk masyarakat');
formData.append('link', 'https://pajak.stankom.go.id');
formData.append('file', iconFile);

const response = await fetch('http://localhost:3000/services', {
  method: 'POST',
  credentials: 'include', // Include cookies
  body: formData
});

const result = await response.json();
console.log(result);
```

### Example: Get All Services with Pagination

```javascript
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  search: 'pajak',
  sortBy: 'title:asc'
});

const response = await fetch(`http://localhost:3000/services?${params}`, {
  credentials: 'include'
});

const { data, meta, links } = await response.json();
```

---

## Conclusion

The Services API module is production-ready with:
- ✅ Complete CRUD operations
- ✅ File upload support
- ✅ Pagination and search
- ✅ Authentication and security
- ✅ Comprehensive documentation
- ✅ Consistent patterns with other modules
- ✅ Type safety with TypeScript
- ✅ Reusable utilities

For questions or issues, please refer to the main project documentation or contact the development team.
