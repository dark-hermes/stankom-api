# Audit Helper Documentation

## Overview
The audit helper automatically populates `createdById` and `updatedById` fields in your DTOs based on the authenticated user making the request.

## Components

### 1. AuditInterceptor
**Location:** `src/common/interceptors/audit.interceptor.ts`

An interceptor that automatically adds audit fields to request bodies:
- `createdById` - Added for POST requests (create operations)
- `updatedById` - Added for PUT/PATCH requests (update operations)

### 2. CurrentUserId Decorator
**Location:** `src/common/decorators/current-user-id.decorator.ts`

A parameter decorator to extract the current user ID from the request:
```typescript
@Get('profile')
getProfile(@CurrentUserId() userId: number) {
  // userId is automatically extracted from request.user.id
  return this.service.getProfile(userId);
}
```

## Usage

### Step 1: Apply to Controller
Add the `@UseInterceptors(AuditInterceptor)` and `@UseGuards(JwtAuthGuard)` decorators to your controller:

```typescript
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@Controller('news')
@UseGuards(JwtAuthGuard)  // Ensures user is authenticated
@UseInterceptors(AuditInterceptor)  // Auto-populates audit fields
export class NewsController {
  // ... your endpoints
}
```

### Step 2: Update DTOs
Remove validation decorators from audit fields in your DTOs:

**CreateDto:**
```typescript
export class CreateNewsDto {
  @IsString()
  title: string;
  
  // Other fields...
  
  // This field is auto-populated by AuditInterceptor
  createdById?: number;
}
```

**UpdateDto:**
```typescript
export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;
  
  // Other fields...
  
  // This field is auto-populated by AuditInterceptor
  updatedById?: number;
}
```

### Step 3: Use in Service
The audit fields will be automatically populated before reaching your service:

```typescript
async create(dto: CreateNewsDto) {
  // dto.createdById is now populated with the authenticated user's ID
  if (!dto.createdById) {
    throw new Error('createdById is required');
  }
  
  return this.prisma.news.create({
    data: {
      ...dto,
      createdBy: { connect: { id: dto.createdById } },
    },
  });
}
```

## How It Works

1. User makes a request with authentication cookie
2. `JwtAuthGuard` validates the JWT and adds user object to `request.user`
3. `AuditInterceptor` reads `request.user.id` and adds it to `request.body`
4. Controller receives DTO with audit fields already populated
5. Service can use the audit fields to link to the user

## Example Flow

```
POST /news
Cookie: access_token=...
Body: {
  "title": "New Article",
  "slug": "new-article",
  "categoryId": 1
}

↓ After JwtAuthGuard
request.user = { id: 5, email: "user@example.com", ... }

↓ After AuditInterceptor
request.body = {
  "title": "New Article",
  "slug": "new-article", 
  "categoryId": 1,
  "createdById": 5  ← Automatically added!
}

↓ Service receives
dto = {
  title: "New Article",
  slug: "new-article",
  categoryId: 1,
  createdById: 5
}
```

## Benefits

✅ **No manual user ID passing** - Automatically extracted from authentication
✅ **Consistent auditing** - Applied uniformly across all endpoints
✅ **Type-safe** - Works with TypeScript strict mode
✅ **Flexible** - Can be applied at controller or method level
✅ **Secure** - Only works with authenticated requests

## Applied To

Currently implemented in:
- ✅ News Module (`src/news/news.controller.ts`)
  - POST /news - Auto-populates `createdById`
  - PUT /news/:id - Auto-populates `updatedById`
  - POST /news/categories - Auto-populates `createdById`
  - PUT /news/categories/:id - Auto-populates `updatedById`
  - POST /news/tags - Auto-populates `createdById`
  - PUT /news/tags/:id - Auto-populates `updatedById`

## Swagger Documentation

When using with Swagger, you can hide audit fields from the API documentation since they're auto-populated:

```typescript
export class CreateNewsDto {
  @ApiProperty({ example: 'Article Title' })
  title: string;
  
  // No @ApiProperty needed - hidden from Swagger UI
  createdById?: number;
}
```

Users won't see `createdById` in the Swagger UI, making it clear that it's automatically handled.
