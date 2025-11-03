# News Image Upload Feature

## Overview

The News Image Upload feature allows authenticated users to upload images specifically for news articles to Google Cloud Storage.

## Endpoint

### Upload News Image

**POST** `/news/upload-image`

Upload an image file to be used in news articles. The image will be stored in Google Cloud Storage under the `news/` folder.

#### Authentication

Required: Yes (JWT Bearer Token via Cookie)

#### Request

- **Content-Type**: `multipart/form-data`
- **Body Parameter**:
  - `file` (required): Image file to upload

#### Validations

- **File Size**: Maximum 5MB
- **File Types**: png, jpeg, jpg, gif, webp

#### Response

**Success (201 Created)**:

```json
{
  "message": "Gambar berita berhasil diunggah.",
  "url": "https://storage.googleapis.com/your-bucket/news/uuid-filename.jpg"
}
```

**Error (400 Bad Request)**:

```json
{
  "statusCode": 400,
  "message": "Gagal mengunggah gambar berita.",
  "error": "Bad Request"
}
```

#### Example Usage

**Using cURL**:

```bash
curl -X POST http://localhost:3000/news/upload-image \
  -H "Cookie: access_token=your-jwt-token" \
  -F "file=@/path/to/image.jpg"
```

**Using Postman**:

1. Set method to `POST`
2. URL: `http://localhost:3000/news/upload-image`
3. Headers: Make sure you have the authentication cookie
4. Body:
   - Select `form-data`
   - Key: `file` (change type to File)
   - Value: Select your image file

**Using JavaScript (fetch)**:

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:3000/news/upload-image', {
  method: 'POST',
  headers: {
    // Cookie will be sent automatically if using credentials: 'include'
  },
  credentials: 'include',
  body: formData,
});

const result = await response.json();
console.log(result.url); // Use this URL in your news article
```

## Implementation Details

### File Storage

- Images are uploaded to Google Cloud Storage
- Files are stored with a unique UUID prefix: `uuid-original-filename.jpg`
- Storage path: `news/` folder in the GCS bucket
- Files are publicly accessible via the returned URL

### Security

- Protected by `JwtAuthGuard` - requires valid authentication
- Validated by `AuditInterceptor` - tracks who uploaded the file
- File type and size validation applied before upload
- Malicious file names are sanitized (spaces replaced with underscores)

### Integration with News Module

After uploading an image, use the returned URL in the `image` field when creating or updating a news article:

```json
{
  "title": "Breaking News Title",
  "excerpt": "Short summary",
  "description": "Full article content",
  "image": "https://storage.googleapis.com/your-bucket/news/uuid-filename.jpg",
  "status": "published",
  "categoryId": 1,
  "tagIds": [1, 2, 3]
}
```

## Differences from General Upload Endpoint

While there's a general upload endpoint at `POST /upload/image`, the news-specific endpoint offers:

1. **Better organization**: Images stored in `news/` folder instead of generic `images/`
2. **Resource-specific**: Part of the news resource (/news path)
3. **Consistent API design**: All news operations under one resource path
4. **Future extensibility**: Can add news-specific validation or processing

## Error Handling

The endpoint handles various error scenarios:

1. **Invalid file type**: Returns 400 with validation error
2. **File too large**: Returns 400 with size limit error
3. **Upload failure**: Returns 400 with descriptive error message
4. **Authentication failure**: Returns 401 Unauthorized

All errors are logged for debugging purposes.

## Related Files

- **Controller**: `src/news/news.controller.ts` - `uploadImage()` method
- **Service**: `src/storage/storage.service.ts` - `uploadFile()` method
- **Module**: `src/news/news.module.ts` - Imports StorageModule
- **Test**: `src/news/news.controller.spec.ts` - StorageService mock
