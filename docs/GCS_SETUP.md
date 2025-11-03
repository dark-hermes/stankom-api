# Google Cloud Storage Integration

This project uses Google Cloud Storage (GCS) for storing uploaded media files (images).

## Setup Instructions

### 1. Create a GCS Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Cloud Storage > Buckets**
4. Click **Create Bucket**
5. Choose a globally unique bucket name
6. Select location and storage class
7. Set access control to **Fine-grained**
8. Make the bucket public (optional, for public image access):
   - Go to bucket **Permissions** tab
   - Add principal: `allUsers`
   - Role: **Storage Object Viewer**

### 2. Create a Service Account

1. Navigate to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Give it a name (e.g., "stankom-uploader")
4. Grant role: **Storage Object Admin**
5. Click **Done**
6. Click on the created service account
7. Go to **Keys** tab
8. Click **Add Key > Create New Key**
9. Choose **JSON** format
10. Save the downloaded JSON file as `gcs-key.json` in your project root

### 3. Configure Environment Variables

Update your `.env` file with:

```env
GCS_PROJECT_ID="your-gcp-project-id"
GCS_BUCKET_NAME="your-unique-bucket-name"
GCS_KEYFILE_PATH="./gcs-key.json"
```

### 4. Security Note

⚠️ **IMPORTANT**: The `gcs-key.json` file contains sensitive credentials. 
- It is already added to `.gitignore`
- Never commit this file to version control
- Keep it secure and do not share it

## API Usage

### Upload Image Endpoint

**POST** `/upload/image`

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- `file`: Image file (png, jpeg, jpg, webp, gif)
- Max size: 5MB

**Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "https://storage.googleapis.com/your-bucket/images/uuid-filename.jpg"
}
```

### Example with cURL

```bash
curl -X POST http://localhost:3000/upload/image \
  -F "file=@/path/to/your/image.jpg"
```

### Example with Postman

1. Set method to **POST**
2. URL: `http://localhost:3000/upload/image`
3. Go to **Body** tab
4. Select **form-data**
5. Add key `file` with type **File**
6. Choose your image file
7. Send request

## Integration with News Module

The uploaded image URL can be used in the News `image` field:

```json
{
  "title": "News Title",
  "slug": "news-slug",
  "excerpt": "Excerpt",
  "description": "Description",
  "image": "https://storage.googleapis.com/bucket/images/uuid-image.jpg",
  "categoryId": 1,
  "status": "draft"
}
```

## StorageService Methods

### `uploadFile(file, pathPrefix)`

Uploads a file to GCS.

**Parameters:**
- `file`: Express.Multer.File object
- `pathPrefix`: Path prefix in bucket (default: 'general/')

**Returns:** Public URL of uploaded file

### `deleteFile(publicUrl)`

Deletes a file from GCS using its public URL.

**Parameters:**
- `publicUrl`: The public URL of the file to delete

## Troubleshooting

### Permission Denied Error

Make sure your service account has the **Storage Object Admin** role.

### Bucket Not Found

Verify the bucket name in your `.env` matches exactly with your GCS bucket name.

### Invalid Credentials

Ensure the `gcs-key.json` file path is correct and the file is valid JSON.
