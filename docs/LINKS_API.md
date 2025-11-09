# Links API Documentation

## Overview

The Links API module provides complete CRUD operations for managing external links in the STANKOM application. This module follows the same patterns as the FAQ module for consistency and maintainability.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination support with search and filtering
- ✅ JWT Authentication with cookie support
- ✅ Swagger/OpenAPI documentation
- ✅ Type-safe with TypeScript and Prisma
- ✅ Reusable utilities (pagination, search, sorting)

## Database Schema

```prisma
model Link {
  id   Int     @id @default(autoincrement())
  name String?
  url  String  @db.Text
}
```

## Module Structure

```
src/links/
├── dto/
│   ├── create-link.dto.ts      # DTO for creating links
│   ├── update-link.dto.ts      # DTO for updating links
│   └── link-response.dto.ts    # Response wrapper DTO
├── links.controller.ts         # API endpoints
├── links.service.ts            # Business logic
├── links.module.ts             # Module definition
├── links.controller.spec.ts    # Controller tests
└── links.service.spec.ts       # Service tests
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1/links
```

All endpoints require JWT authentication via cookies.

---

### 1. Create Link

**POST** `/links`

Creates a new link.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Website Resmi",
  "url": "https://example.com"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/links \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Resmi",
    "url": "https://example.com"
  }'
```

**Response (201 Created):**
```json
{
  "message": "Link berhasil dibuat.",
  "data": {
    "id": 1,
    "name": "Website Resmi",
    "url": "https://example.com"
  }
}
```

---

### 2. Get All Links (with Pagination)

**GET** `/links`

Retrieves all links with pagination, search, and sorting support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term (searches in name and url)
- `sortBy` (optional): Sort field and order (e.g., `name:asc`, `id:desc`)

**Example (cURL):**
```bash
# Get all links (page 1, limit 10)
curl -X GET "http://localhost:3000/api/v1/links" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"

# With search and pagination
curl -X GET "http://localhost:3000/api/v1/links?page=1&limit=5&search=resmi&sortBy=name:asc" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Website Resmi",
      "url": "https://example.com"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "links": {
    "first": "http://localhost:3000/api/v1/links?page=1&limit=10",
    "previous": null,
    "next": "http://localhost:3000/api/v1/links?page=2&limit=10",
    "last": "http://localhost:3000/api/v1/links?page=5&limit=10"
  }
}
```

---

### 3. Get Link by ID

**GET** `/links/:id`

Retrieves a single link by its ID.

**Example (cURL):**
```bash
curl -X GET http://localhost:3000/api/v1/links/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Website Resmi",
  "url": "https://example.com"
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Link tidak ditemukan."
}
```

---

### 4. Update Link

**PUT** `/links/:id`

Updates an existing link. All fields are optional.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Website Resmi Updated",
  "url": "https://updated-example.com"
}
```

**Example (cURL):**
```bash
curl -X PUT http://localhost:3000/api/v1/links/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Resmi Updated",
    "url": "https://updated-example.com"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Link berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Website Resmi Updated",
    "url": "https://updated-example.com"
  }
}
```

---

### 5. Delete Link

**DELETE** `/links/:id`

Deletes a link by ID.

**Example (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/v1/links/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "message": "Link berhasil dihapus."
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Link tidak ditemukan."
}
```

---

## DTOs (Data Transfer Objects)

### CreateLinkDto

```typescript
{
  name?: string;    // optional
  url: string;      // required, must be valid URL
}
```

### UpdateLinkDto

```typescript
{
  name?: string;    // optional
  url?: string;     // optional, must be valid URL if provided
}
```

### LinkResponseDto

```typescript
{
  message: string;
  data: Link;
}
```

---

## Validation Rules

### Field Constraints
- `name`: Optional, string
- `url`: Required on creation, string, must be a valid URL format

---

## Reusable Utilities

The Links module leverages reusable utilities for consistency:

### 1. Pagination Helper (`paginate`)
```typescript
import { paginate } from '../common/utils/paginator';

const result = await paginate<Link>(
  this.prisma.link,
  { where, orderBy },
  { page, limit, baseUrl }
);
```

### 2. Search and Filter Helper
```typescript
import { createPrismaWhereClause } from '../common/utils/prisma-helpers';

const where = createPrismaWhereClause<Prisma.LinkWhereInput>(
  query,
  ['name', 'url']
);
```

### 3. Sorting Helper
```typescript
import { createPrismaOrderByClause } from '../common/utils/prisma-helpers';

const orderBy = createPrismaOrderByClause(query.sortBy);
```

---

## Authentication & Authorization

All endpoints are protected with:
- **JwtAuthGuard**: Validates JWT token from cookies

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data (e.g., invalid URL format)
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "statusCode": 404,
  "message": "Link tidak ditemukan.",
  "error": "Not Found"
}
```

---

## Testing

### Unit Tests

Run unit tests:
```bash
pnpm test links
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

3. Look for the "Links" section in the API documentation

---

## Code Patterns Followed

### 1. **Consistent Module Structure**
- Same pattern as FAQ module
- Separation of concerns (Controller → Service → Repository)

### 2. **DTO Validation**
- Using `class-validator` decorators
- Swagger decorations for API documentation
- URL validation with `@IsUrl()`

### 3. **Prisma Integration**
- Type-safe database queries
- Proper handling of nullable fields (`name` is optional)

### 4. **Response Format**
- Consistent response structure
- Indonesian language messages for end users
- Proper HTTP status codes

### 5. **Security**
- JWT authentication on all endpoints
- Cookie-based token storage
- Guards

---

## Integration with Frontend

### Example: Create Link

```javascript
const response = await fetch('http://localhost:3000/api/v1/links', {
  method: 'POST',
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Website Resmi',
    url: 'https://example.com'
  })
});

const result = await response.json();
console.log(result);
```

### Example: Get All Links with Pagination

```javascript
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  search: 'resmi',
  sortBy: 'name:asc'
});

const response = await fetch(`http://localhost:3000/api/v1/links?${params}`, {
  credentials: 'include'
});

const { data, meta, links } = await response.json();
```

### Example: Update Link

```javascript
const response = await fetch('http://localhost:3000/api/v1/links/1', {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Name',
    url: 'https://updated-url.com'
  })
});

const result = await response.json();
```

### Example: Delete Link

```javascript
const response = await fetch('http://localhost:3000/api/v1/links/1', {
  method: 'DELETE',
  credentials: 'include'
});

const result = await response.json();
console.log(result.message); // "Link berhasil dihapus."
```

---

## Postman Collection

See `postman/links-collection.json` for a complete Postman collection with all endpoints.

---

## Conclusion

The Links API module is production-ready with:
- ✅ Complete CRUD operations
- ✅ Pagination and search
- ✅ Authentication and security
- ✅ Comprehensive documentation
- ✅ Consistent patterns with other modules
- ✅ Type safety with TypeScript
- ✅ Reusable utilities
- ✅ URL validation

For questions or issues, please refer to the main project documentation or contact the development team.
