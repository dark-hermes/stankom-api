# Quick Start Guide - News & Media Upload

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add GCS credentials to .env
   GCS_PROJECT_ID=your-project-id
   GCS_BUCKET_NAME=your-bucket-name
   GCS_KEYFILE_PATH=./gcs-key.json
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Database**
   ```bash
   # Run migrations
   pnpm prisma migrate dev
   
   # Seed database (optional)
   pnpm prisma db seed
   ```

4. **Start Development Server**
   ```bash
   pnpm run start:dev
   ```

## API Usage Examples

### 1. Upload Image

```bash
# Upload image to GCS
curl -X POST http://localhost:3000/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Response
{
  "message": "File berhasil diupload",
  "url": "https://storage.googleapis.com/your-bucket/images/abc-123.jpg"
}
```

**Constraints:**
- Max size: 5MB
- Allowed types: png, jpeg, jpg, webp, gif

### 2. Create News Category

```bash
curl -X POST http://localhost:3000/news/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Technology",
    "slug": "technology"
  }'

# Response
{
  "message": "Kategori berita berhasil dibuat",
  "data": {
    "id": 1,
    "title": "Technology",
    "slug": "technology",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Tags

```bash
curl -X POST http://localhost:3000/news/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "AI",
    "slug": "ai"
  }'

# Create multiple tags as needed
# Response includes tag id which you'll use when creating news
```

### 4. Create News Article

```bash
curl -X POST http://localhost:3000/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "The Future of Artificial Intelligence",
    "slug": "future-of-ai",
    "excerpt": "Exploring the latest trends in AI technology",
    "description": "Full article content here...",
    "image": "https://storage.googleapis.com/your-bucket/images/abc-123.jpg",
    "status": "published",
    "categoryId": 1,
    "tagIds": [1, 2, 3],
    "createdById": 1
  }'

# Response
{
  "message": "Berita berhasil dibuat",
  "data": {
    "id": 1,
    "title": "The Future of Artificial Intelligence",
    "slug": "future-of-ai",
    ...
  }
}
```

**News Status Values:**
- `draft` - Not published yet
- `published` - Visible to public
- `archived` - Archived/hidden

### 5. Get All News (Paginated)

```bash
# Basic pagination
curl "http://localhost:3000/news?page=1&limit=10"

# With search
curl "http://localhost:3000/news?page=1&limit=10&search=artificial"

# With filter (by status)
curl "http://localhost:3000/news?page=1&limit=10&filter=published"

# With sorting
curl "http://localhost:3000/news?page=1&limit=10&sortBy=createdAt:desc"

# Combined
curl "http://localhost:3000/news?page=1&limit=10&search=AI&filter=published&sortBy=createdAt:desc"

# Response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 6. Get Single News

```bash
curl http://localhost:3000/news/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response includes full news details with relations
{
  "id": 1,
  "title": "...",
  "category": { ... },
  "tags": [...],
  "createdBy": { ... }
}
```

### 7. Update News

```bash
curl -X PUT http://localhost:3000/news/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "status": "archived",
    "tagIds": [1, 2]
  }'

# Response
{
  "message": "Berita berhasil diperbarui",
  "data": { ... }
}
```

### 8. Delete News

```bash
curl -X DELETE http://localhost:3000/news/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response
{
  "message": "Berita berhasil dihapus"
}
```

### 9. Manage Categories

```bash
# List all categories (paginated)
curl "http://localhost:3000/news/categories?page=1&limit=10"

# Update category
curl -X PUT http://localhost:3000/news/categories/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Category"}'

# Delete category
curl -X DELETE http://localhost:3000/news/categories/1
```

### 10. Manage Tags

```bash
# List all tags (paginated)
curl "http://localhost:3000/news/tags?page=1&limit=10&search=tech"

# Update tag
curl -X PUT http://localhost:3000/news/tags/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Tag"}'

# Delete tag
curl -X DELETE http://localhost:3000/news/tags/1
```

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api
```

Features:
- ✅ Try out endpoints directly
- ✅ View request/response schemas
- ✅ See validation rules
- ✅ Download OpenAPI spec

## Postman Collection

1. Import the Postman collection from project root
2. Set up environment variables:
   - `base_url`: http://localhost:3000
   - `jwt_token`: Your authentication token
3. Run the collection to test all endpoints
4. Pre-request scripts and tests are included

## Common Workflows

### Workflow 1: Publishing a News Article

1. Upload image → Get URL
2. Create category (if not exists)
3. Create tags (if not exists)
4. Create news with image URL, categoryId, and tagIds
5. Status: `published`

### Workflow 2: Draft Management

1. Create news with status: `draft`
2. Edit multiple times as needed
3. When ready: Update status to `published`
4. To hide: Update status to `archived`

### Workflow 3: Bulk Content Creation

1. Create multiple categories first
2. Create tag library
3. Batch create news articles referencing existing categories/tags

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e

# Lint check
pnpm run lint

# Format code
pnpm run format
```

## Troubleshooting

### Issue: GCS Upload Fails

**Solution:**
1. Verify `gcs-key.json` exists in project root
2. Check environment variables in `.env`
3. Verify service account has Storage Object Admin role
4. Check bucket exists and is accessible

### Issue: News Creation Fails

**Solution:**
1. Ensure categoryId exists in database
2. Verify all tagIds are valid
3. Check createdById references existing user
4. Validate image URL format

### Issue: Pagination Not Working

**Solution:**
1. Verify query parameters: `?page=1&limit=10`
2. Check FilterSearchQueryDto validation
3. Ensure numeric values are not strings

### Issue: Authentication Errors

**Solution:**
1. Include valid JWT token in Authorization header
2. Format: `Bearer YOUR_TOKEN`
3. Check token expiration
4. Verify user has required permissions

## Performance Tips

1. **Pagination:** Always use reasonable limit values (10-50)
2. **Search:** Be specific to reduce result set
3. **Images:** Compress before upload to stay under 5MB
4. **Caching:** Consider implementing Redis for frequently accessed data
5. **Database:** Add indexes on frequently queried fields (slug, status)

## Security Best Practices

1. **Never commit:**
   - `.env` file
   - `gcs-key.json`
   - JWT secrets

2. **Always validate:**
   - File uploads (size, type)
   - User input (DTOs handle this)
   - Authentication tokens

3. **Use HTTPS in production**

4. **Set CORS properly for frontend**

5. **Implement rate limiting**

## Next Steps

1. Set up GCS bucket (see `docs/GCS_SETUP.md`)
2. Configure environment variables
3. Run database migrations
4. Test API endpoints with Postman
5. Review Swagger documentation
6. Deploy to staging environment

## Support

- Swagger UI: http://localhost:3000/api
- Health Check: http://localhost:3000/health
- Documentation: See `docs/` folder
- Tests: Run `pnpm test` for examples

---

**Ready to start? Follow the Prerequisites section above!**
