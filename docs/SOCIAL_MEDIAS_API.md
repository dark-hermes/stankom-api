# Social Medias API Documentation

## Overview

The Social Medias API module provides complete CRUD operations for managing social media links in the STANKOM application. This module follows established patterns for consistency and maintainability.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination support with search and filtering
- ✅ JWT Authentication with cookie support
- ✅ Swagger/OpenAPI documentation
- ✅ Type-safe with TypeScript and Prisma
- ✅ Reusable utilities (pagination, search, sorting)

## Database Schema

```prisma
model SocialMedia {
  id   Int    @id @default(autoincrement())
  name String
  link String @db.Text
}
```

## Module Structure

```
src/social-medias/
├── dto/
│   ├── create-social-media.dto.ts      # DTO for creating social medias
│   ├── update-social-media.dto.ts      # DTO for updating social medias
│   └── social-media-response.dto.ts    # Response wrapper DTO
├── social-medias.controller.ts         # API endpoints
├── social-medias.service.ts            # Business logic
├── social-medias.module.ts             # Module definition
├── social-medias.controller.spec.ts    # Controller tests
└── social-medias.service.spec.ts       # Service tests
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1/social-medias
```

All endpoints require JWT authentication via cookies.

---

### 1. Create Social Media

**POST** `/social-medias`

Creates a new social media link.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Instagram STANKOM",
  "link": "https://instagram.com/stankom"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instagram STANKOM",
    "link": "https://instagram.com/stankom"
  }'
```

**Response (201 Created):**
```json
{
  "message": "Media sosial berhasil dibuat.",
  "data": {
    "id": 1,
    "name": "Instagram STANKOM",
    "link": "https://instagram.com/stankom"
  }
}
```

**Validation Rules:**
- `name`: Required, must be a non-empty string
- `link`: Required, must be a valid URL

---

### 2. Get All Social Medias (with Pagination)

**GET** `/social-medias`

Retrieves all social medias with pagination, search, and sorting support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term (searches in name and link)
- `sortBy` (optional): Sort field and order (e.g., `name:asc`, `id:desc`)

**Example (cURL):**
```bash
# Get all social medias (page 1, limit 10)
curl -X GET "http://localhost:3000/api/v1/social-medias" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"

# With search and pagination
curl -X GET "http://localhost:3000/api/v1/social-medias?page=1&limit=5&search=instagram&sortBy=name:asc" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Instagram STANKOM",
      "link": "https://instagram.com/stankom"
    },
    {
      "id": 2,
      "name": "Facebook STANKOM",
      "link": "https://facebook.com/stankom"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  },
  "links": {
    "first": "http://localhost:3000/api/v1/social-medias?page=1&limit=10",
    "previous": null,
    "next": "http://localhost:3000/api/v1/social-medias?page=2&limit=10",
    "last": "http://localhost:3000/api/v1/social-medias?page=2&limit=10"
  }
}
```

---

### 3. Get Social Media by ID

**GET** `/social-medias/:id`

Retrieves a single social media by its ID.

**Example (cURL):**
```bash
curl -X GET http://localhost:3000/api/v1/social-medias/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Instagram STANKOM",
  "link": "https://instagram.com/stankom"
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Media sosial tidak ditemukan."
}
```

---

### 4. Update Social Media

**PUT** `/social-medias/:id`

Updates an existing social media. All fields are optional.

**Headers:**
```
Cookie: access_token=YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "name": "Instagram Official STANKOM",
  "link": "https://instagram.com/stankom_official"
}
```

**Example (cURL):**
```bash
curl -X PUT http://localhost:3000/api/v1/social-medias/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instagram Official STANKOM"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Media sosial berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Instagram Official STANKOM",
    "link": "https://instagram.com/stankom"
  }
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Media sosial tidak ditemukan."
}
```

---

### 5. Delete Social Media

**DELETE** `/social-medias/:id`

Deletes a social media by its ID.

**Example (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/v1/social-medias/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "message": "Media sosial berhasil dihapus."
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Media sosial tidak ditemukan."
}
```

---

## Implementation Patterns

### 1. DTOs (Data Transfer Objects)

The module uses class-validator decorators for input validation:

**CreateSocialMediaDto:**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSocialMediaDto {
  @ApiProperty({
    example: 'Instagram STANKOM',
    description: 'Social media name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'https://instagram.com/stankom',
    description: 'Social media link/URL',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link: string;
}
```

**UpdateSocialMediaDto:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateSocialMediaDto } from './create-social-media.dto';

export class UpdateSocialMediaDto extends PartialType(CreateSocialMediaDto) {}
```

### 2. Service Layer

The service uses:
- **PrismaService** for database operations
- **paginate** utility for consistent pagination
- **createPrismaWhereClause** for search functionality
- **createPrismaOrderByClause** for sorting
- Proper error handling with `NotFoundException`

Example service method:
```typescript
async findAll(
  query: FilterSearchQueryDto,
  req?: RequestWithBaseUrl,
): Promise<PaginatedResponse<SocialMedia>> {
  const searchableFields = ['name', 'link'];
  const where = createPrismaWhereClause<Prisma.SocialMediaWhereInput>(
    query,
    searchableFields,
  );
  const orderBy = createPrismaOrderByClause(query.sortBy);

  const baseUrl = req
    ? `${req.protocol}://${req.get('host')}${req.baseUrl}`
    : null;

  return paginate<SocialMedia>(
    this.prisma.socialMedia,
    {
      where,
      orderBy,
    },
    {
      page: query.page,
      limit: query.limit,
      baseUrl,
    },
  );
}
```

### 3. Controller Layer

The controller uses:
- **@ApiTags** for Swagger grouping
- **@ApiCookieAuth** for authentication documentation
- **@UseGuards(JwtAuthGuard)** for JWT authentication
- **@ApiOperation** for endpoint descriptions
- **@ApiResponse** for response documentation
- Proper HTTP status codes

### 4. Reusable Utilities

**Pagination:**
- Automatically calculates total pages
- Provides navigation links (first, previous, next, last)
- Accepts page and limit parameters

**Search:**
- Searches across multiple fields
- Case-insensitive search
- Uses Prisma's `OR` conditions

**Sorting:**
- Format: `field:direction` (e.g., `name:asc`, `id:desc`)
- Default sorting by ID descending

---

## Common Use Cases

### Example 1: Create Multiple Social Medias

```bash
# Create Instagram
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Instagram STANKOM", "link": "https://instagram.com/stankom"}'

# Create Facebook
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Facebook STANKOM", "link": "https://facebook.com/stankom"}'

# Create YouTube
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "YouTube STANKOM", "link": "https://youtube.com/@stankom"}'
```

### Example 2: Search Social Medias

```bash
# Search for Instagram
curl -X GET "http://localhost:3000/api/v1/social-medias?search=instagram" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

### Example 3: Get Paginated Results

```bash
# Get first 5 results
curl -X GET "http://localhost:3000/api/v1/social-medias?page=1&limit=5" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"

# Get next page
curl -X GET "http://localhost:3000/api/v1/social-medias?page=2&limit=5" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

---

## Testing

### Manual Testing with Postman

Import the Postman collection from:
```
postman/social-medias-collection.json
```

The collection includes:
- All CRUD operations
- Environment variables for baseUrl and token
- Example requests with sample data

### Automated Testing

Run unit tests:
```bash
pnpm test social-medias
```

Run e2e tests:
```bash
pnpm test:e2e
```

---

## Error Handling

The API returns consistent error responses:

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": ["link must be a URL address"],
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid JWT:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found** - Resource not found:
```json
{
  "statusCode": 404,
  "message": "Media sosial tidak ditemukan."
}
```

---

## Related Modules

- **Links Module** - Similar pattern for managing external links
- **Services Module** - Service management with icon uploads
- **FAQ Module** - Simple Q&A management

---

## Notes

- All timestamps are handled automatically by Prisma (if added in schema)
- The module uses Indonesian messages for consistency with other modules
- JWT authentication is required for all endpoints
- The API follows RESTful conventions
- Swagger documentation is available at `/api-docs`
