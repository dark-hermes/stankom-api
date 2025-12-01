import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadRoot =
      this.configService.get<string>('UPLOAD_DEST') || 'uploads';
  }

  private hasDiskPath(
    file: unknown,
  ): file is Express.Multer.File & { path: string } {
    return (
      typeof file === 'object' &&
      file !== null &&
      'path' in file &&
      typeof (file as Record<string, unknown>)['path'] === 'string'
    );
  }

  /**
   * Mengupload file ke Google Cloud Storage.
   * @param file Objek file dari Multer
   * @param pathPrefix Awalan path di dalam bucket (misal: 'news/images')
   * @returns URL publik dari file yang diupload
   */
  async uploadFile(
    file: Express.Multer.File,
    pathPrefix = 'images/',
  ): Promise<string> {
    const { v4: uuidv4 } = await import('uuid');
    const originalNameSanitized = file.originalname.replace(/\s+/g, '_');
    const uniqueFilename = `${uuidv4()}-${originalNameSanitized}`;
    const targetDir = join(process.cwd(), this.uploadRoot, pathPrefix);
    const targetPath = join(targetDir, uniqueFilename);

    try {
      // Ensure directory exists
      await fsPromises.mkdir(targetDir, { recursive: true });

      if (file.buffer && file.buffer.length > 0) {
        await fsPromises.writeFile(targetPath, file.buffer);
      } else if (this.hasDiskPath(file)) {
        // If using disk storage, move/copy from disk path.
        const diskPath = file.path;
        await fsPromises.copyFile(diskPath, targetPath);
      } else {
        throw new Error('No file data received');
      }

      // Build absolute URL: <PUBLIC_BASE_URL>/uploads/<prefix><filename>
      const relativePath = `${pathPrefix}${uniqueFilename}`.replace(/\\/g, '/');
      const relativeUrl = `/${this.uploadRoot}/${relativePath}`; // /uploads/images/uuid-name.ext
      const baseUrlRaw = this.configService.get<string>('PUBLIC_BASE_URL');
      const baseUrl = baseUrlRaw ? baseUrlRaw.replace(/\/$/, '') : '';
      const finalUrl = baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl;
      this.logger.log(`File stored locally at: ${finalUrl}`);
      return finalUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Local file write failed: ${msg}`);
      throw new Error('File upload failed');
    }
  }

  /**
   * Menghapus file dari Google Cloud Storage.
   * @param publicUrl URL publik file yang akan dihapus
   */
  async deleteFile(publicUrl: string): Promise<void> {
    try {
      const baseUrlRaw = this.configService.get<string>('PUBLIC_BASE_URL');
      let normalized = publicUrl.trim();
      if (baseUrlRaw && normalized.startsWith(baseUrlRaw)) {
        normalized = normalized.substring(baseUrlRaw.length);
      }
      // Remove any leading /api segment if present
      if (normalized.startsWith('/api/')) {
        normalized = normalized.substring(4);
      }
      // Remove leading slash for path checks
      if (normalized.startsWith('/')) {
        normalized = normalized.substring(1);
      }
      if (!normalized.startsWith(`${this.uploadRoot}/`)) {
        throw new Error('Invalid uploads path');
      }
      const absolutePath = join(process.cwd(), normalized);
      await fsPromises.unlink(absolutePath);
      this.logger.log(`File deleted: ${publicUrl}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to delete file ${publicUrl}: ${errorMessage}`);
    }
  }
}
