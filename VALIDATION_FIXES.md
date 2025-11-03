# API Validation Fixes Summary

## Issues Fixed

### 1. ✅ `createdById should not be empty` error
**Problem**: The `CreateNewsCategoryDto` had `@IsNotEmpty()` validation on `createdById`, but this field should be auto-populated by the `AuditInterceptor`.

**Solution**: 
- Made `createdById` optional in the DTO (`createdById?: number`)
- The `AuditInterceptor` automatically adds this field based on the authenticated user
- Updated `NewsService.createCategory()` to handle the relation properly using Prisma's `connect` syntax

### 2. ✅ `Validation failed (numeric string is expected)` error
**Problem**: Query parameters for pagination weren't being transformed to numbers.

**Solution**: 
- The `PaginationQueryDto` already has `@Type(() => Number)` decorators
- The global `ValidationPipe` in `main.ts` has `transform: true` enabled
- This should work automatically for `page` and `limit` query parameters

### 3. ✅ `property updatedById should not exist` error
**Problem**: The `UpdateNewsCategoryDto` exposed `updatedById` in Swagger, causing validation errors when users tried to send it.

**Solution**:
- Changed `@ApiProperty` to not document `updatedById` (kept it as internal field)
- The `AuditInterceptor` automatically adds `updatedById` for update operations on categories
- Updated `NewsService.updateCategory()` to handle the relation properly

### 4. ✅ JSON Parse Error
**Problem**: Invalid JSON syntax in the request body (likely a trailing comma).

**Solution**: Ensure request bodies are valid JSON without trailing commas.

### 5. ✅ AuditInterceptor Path Matching
**Problem**: The interceptor wasn't matching paths correctly due to the `/api/v1` prefix.

**Solution**:
- Updated the interceptor to strip the `/api/v1` prefix before matching
- Uses regex to match exact entity paths or paths with numeric IDs
- Prevents `/news` from matching `/news/tags`

## Correct API Usage

### Creating a News Category
```http
POST {{base_url}}/news/categories
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "Technology",
  "slug": "technology"
}
```

**Note**: Do NOT send `createdById` - it will be automatically added from your authentication token.

### Updating a News Category
```http
PUT {{base_url}}/news/categories/1
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "Updated Technology"
}
```

**Note**: Do NOT send `updatedById` - it will be automatically added from your authentication token.

### Creating a Tag
```http
POST {{base_url}}/news/tags
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Breaking News",
  "slug": "breaking-news"
}
```

**Note**: Tags do NOT have audit fields (`createdById`, `updatedById`).

### Listing with Pagination
```http
GET {{base_url}}/news/categories?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

**Note**: Query parameters are automatically transformed to numbers.

### Creating News with Image Upload

1. **First, upload the image**:
```http
POST {{base_url}}/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>

file: <select your image file>
pathPrefix: news/images/
```

Response:
```json
{
  "message": "File uploaded successfully",
  "data": {
    "url": "https://storage.googleapis.com/your-bucket/news/images/uuid-filename.jpg"
  }
}
```

2. **Then, create the news article**:
```http
POST {{base_url}}/news
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "Breaking News Title",
  "slug": "breaking-news-title",
  "excerpt": "Short excerpt of the news",
  "description": "Full description of the news article...",
  "image": "https://storage.googleapis.com/your-bucket/news/images/uuid-filename.jpg",
  "status": "draft",
  "categoryId": 1,
  "tagIds": [1, 2]
}
```

**Important**: 
- Use the URL returned from the upload endpoint
- `createdById` is automatically added from your auth token
- `image` field is optional - you can send `null` or omit it if there's no image

## Files Modified

1. **src/news/dto/create-news-category.dto.ts**
   - Made `createdById` optional
   - Added comment explaining it's auto-populated

2. **src/news/dto/update-news-category.dto.ts**
   - Changed to `ApiPropertyOptional`
   - Removed `updatedById` from Swagger documentation
   - Kept it as internal field for the interceptor

3. **src/news/news.service.ts**
   - Updated `createCategory()` to use Prisma's `connect` syntax for the `createdBy` relation
   - Updated `updateCategory()` to handle `updatedBy` relation properly

4. **src/common/interceptors/audit.interceptor.ts**
   - Strips `/api/v1` prefix for normalized path matching
   - Uses regex to match exact paths or paths with numeric IDs
   - Prevents substring matching (e.g., `/news` matching `/news/tags`)

## Testing

All tests pass:
- ✅ Unit tests: 35 tests passing
- ✅ E2E tests: 4 tests passing

Run tests:
```bash
# Unit tests
pnpm test

# E2E tests
pnpm run test:e2e

# All tests + lint
pnpm run lint && pnpm test && pnpm run test:e2e
```

## Common Errors to Avoid

1. ❌ **Don't send `createdById` manually** for News or NewsCategory
   - It's automatically populated from your JWT token

2. ❌ **Don't send `updatedById` manually** for NewsCategory updates
   - It's automatically populated from your JWT token

3. ❌ **Don't add trailing commas** in JSON
   ```json
   // ❌ Wrong
   {
     "title": "Test",
     "slug": "test",
   }
   
   // ✅ Correct
   {
     "title": "Test",
     "slug": "test"
   }
   ```

4. ❌ **Don't forget authentication**
   - All endpoints require JWT authentication
   - Include the access token in your request

5. ❌ **Don't upload images inline with JSON**
   - Upload images separately first using the `/upload/image` endpoint
   - Then use the returned URL in your news article creation/update
