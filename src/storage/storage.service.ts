import { Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { format } from 'util';

@Injectable()
export class StorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME') || '';

    this.storage = new Storage({
      projectId: this.configService.get<string>('GCS_PROJECT_ID'),
      keyFilename: this.configService.get<string>('GCS_KEYFILE_PATH'),
    });
  }

  /**
   * Mengupload file ke Google Cloud Storage.
   * @param file Objek file dari Multer
   * @param pathPrefix Awalan path di dalam bucket (misal: 'news/images')
   * @returns URL publik dari file yang diupload
   */
  async uploadFile(
    file: Express.Multer.File,
    pathPrefix = 'general/',
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);

    // Buat nama file unik
    // dynamically import uuid to avoid ESM static import issues in tests

    const { v4: uuidv4 } = await import('uuid');

    const uniqueFilename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;
    const destination = `${pathPrefix}${uniqueFilename}`;

    const blob = bucket.file(destination);

    return new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on('error', (err) => {
        this.logger.error(`Error uploading to GCS: ${err.message}`);
        reject(new Error('File upload failed.'));
      });

      blobStream.on('finish', () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
        );
        this.logger.log(`File uploaded to: ${publicUrl}`);
        resolve(publicUrl);
      });

      // Multer memory storage provides buffer, disk storage provides path.
      if (file.buffer && file.buffer.length > 0) {
        blobStream.end(file.buffer);
      } else if (file.path) {
        // Pipe stream from disk file
        try {
          const rs = createReadStream(file.path);
          rs.on('error', (err) => {
            this.logger.error(
              `Read stream error for file upload: ${err.message}`,
            );
            blobStream.destroy(err);
          });
          rs.pipe(blobStream);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown';
          this.logger.error(`Failed to create read stream: ${errorMessage}`);
          blobStream.destroy(err as Error);
        }
      } else {
        this.logger.error('File upload failed: no buffer or path');
        blobStream.destroy(new Error('No file data'));
      }
    });
  }

  /**
   * Menghapus file dari Google Cloud Storage.
   * @param publicUrl URL publik file yang akan dihapus
   */
  async deleteFile(publicUrl: string): Promise<void> {
    try {
      // Ekstrak nama file dari URL
      const urlParts = publicUrl.split('/');
      const bucketName = urlParts[3]; // Asumsi format URL GCS
      const filename = urlParts.slice(4).join('/');

      if (bucketName !== this.bucketName) {
        throw new Error('Invalid bucket name in URL.');
      }

      await this.storage.bucket(this.bucketName).file(filename).delete();
      this.logger.log(`File deleted: ${filename}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to delete file ${publicUrl}: ${errorMessage}`);
      // Gagal menghapus tidak harus melempar error,
      // mungkin file sudah tidak ada.
    }
  }
}
