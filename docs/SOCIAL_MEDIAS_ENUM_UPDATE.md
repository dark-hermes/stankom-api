# Social Medias Module - Enum Update Summary

## Changes Made

### 1. **Database Schema Change**
The `name` field in `SocialMedia` model was changed from `String` to an enum `SocialMediaType` with a unique constraint:

```prisma
enum SocialMediaType {
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  TIKTOK
  YOUTUBE
}

model SocialMedia {
  id   Int             @id @default(autoincrement())
  name SocialMediaType @unique
  link String          @db.Text
}
```

### 2. **DTO Updates**

**CreateSocialMediaDto:**
- Changed `name` from `string` to `SocialMediaType` enum
- Updated validation from `@IsString()` to `@IsEnum(SocialMediaType)`
- Updated example from `"Instagram STANKOM"` to `"INSTAGRAM"`
- Added enum documentation in Swagger with `enum` and `enumName` properties

```typescript
@ApiProperty({
  example: 'INSTAGRAM',
  description: 'Social media type',
  enum: SocialMediaType,
  enumName: 'SocialMediaType',
})
@IsEnum(SocialMediaType)
@IsNotEmpty()
name: SocialMediaType;
```

**UpdateSocialMediaDto:**
- Automatically inherits the enum type via `PartialType`

### 3. **Service Updates**

**Create Method:**
- Added duplicate check before creating
- Throws `ConflictException` if social media type already exists
- Error message: `"Media sosial {name} sudah terdaftar. Gunakan update untuk mengubah link."`

**Update Method:**
- Added duplicate check when changing the name
- Throws `ConflictException` if trying to change to an existing type
- Error message: `"Media sosial {name} sudah terdaftar. Pilih tipe yang berbeda."`

**FindAll Method:**
- Updated searchable fields to only include `link` (removed `name` since it's now an enum)
- Search now only works on the link field

### 4. **Controller Updates**

- Added `@ApiResponse` for HTTP 409 Conflict status in both create and update endpoints
- Documentation now reflects that duplicate social media types are not allowed

```typescript
@ApiResponse({
  status: HttpStatus.CONFLICT,
  description: 'Social media type already exists',
})
```

### 5. **Error Handling**

New error responses:

**409 Conflict (Create):**
```json
{
  "statusCode": 409,
  "message": "Media sosial INSTAGRAM sudah terdaftar. Gunakan update untuk mengubah link."
}
```

**409 Conflict (Update):**
```json
{
  "statusCode": 409,
  "message": "Media sosial FACEBOOK sudah terdaftar. Pilih tipe yang berbeda."
}
```

## API Usage Changes

### Before (String):
```json
{
  "name": "Instagram STANKOM",
  "link": "https://instagram.com/stankom"
}
```

### After (Enum):
```json
{
  "name": "INSTAGRAM",
  "link": "https://instagram.com/stankom"
}
```

## Valid Enum Values

Only the following values are accepted for the `name` field:
- `FACEBOOK`
- `INSTAGRAM`
- `LINKEDIN`
- `TIKTOK`
- `YOUTUBE`

## Benefits of This Change

1. **Data Consistency**: Only predefined social media types can be stored
2. **Uniqueness**: Each social media type can only exist once in the database
3. **Validation**: TypeScript and class-validator ensure type safety at compile and runtime
4. **Better UX**: Clear error messages when attempting to create duplicates
5. **Searchability**: Enum values are predictable and standardized

## Testing

### Valid Create Request:
```bash
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "INSTAGRAM",
    "link": "https://instagram.com/stankom"
  }'
```

### Invalid Create Request (Duplicate):
```bash
# First create INSTAGRAM
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "INSTAGRAM",
    "link": "https://instagram.com/stankom"
  }'

# Try to create INSTAGRAM again - will fail with 409
curl -X POST http://localhost:3000/api/v1/social-medias \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "INSTAGRAM",
    "link": "https://instagram.com/stankom_official"
  }'
```

### Update Link for Existing Type:
```bash
curl -X PUT http://localhost:3000/api/v1/social-medias/1 \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://instagram.com/stankom_updated"
  }'
```

## Migration Notes

If you have existing data:
1. Run `prisma migrate dev` to apply the schema changes
2. Existing `name` values that don't match the enum will cause migration errors
3. You may need to clean up or map existing data to the enum values before migration
4. Consider creating a data migration script if needed

## Build Status

✅ Lint: Passed  
✅ Build: Passed  
✅ TypeScript Compilation: Success
