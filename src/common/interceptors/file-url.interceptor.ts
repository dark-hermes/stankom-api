import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * FileUrlInterceptor traverses the response body and converts any relative
 * upload path (e.g. /uploads/gallery/UUID-filename.jpg) into an absolute URL
 * using PUBLIC_BASE_URL. It also normalizes folder segment to /uploads/images/
 * for consistency across all file/image fields.
 */
@Injectable()
export class FileUrlInterceptor implements NestInterceptor {
  private readonly baseUrl: string;
  private readonly uploadRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('PUBLIC_BASE_URL') || ''
    ).replace(/\/$/, '');
    this.uploadRoot =
      this.configService.get<string>('UPLOAD_DEST') || 'uploads';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.transformResponse(data)));
  }

  private transformResponse(data: unknown): unknown {
    if (data == null) return data;
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item));
    }
    if (typeof data === 'object') {
      const asRecord = data as Record<string, unknown>;
      for (const key of Object.keys(asRecord)) {
        const value = asRecord[key];
        if (typeof value === 'string') {
          asRecord[key] = this.normalizeFileUrl(value);
        } else if (
          Array.isArray(value) ||
          (typeof value === 'object' && value !== null)
        ) {
          asRecord[key] = this.transformResponse(value);
        }
      }
      return asRecord;
    }
    return data;
  }

  private normalizeFileUrl(value: string): string {
    // Already absolute & pointing to uploads
    if (/^https?:\/\//i.test(value) && value.includes('/uploads/')) {
      return value; // Assume already correct
    }
    if (!value.startsWith('/uploads/')) {
      return value; // Not an upload path
    }
    // value format: /uploads/<segment>/<filename>
    const parts = value.split('/').filter(Boolean); // [ 'uploads', '<segment>', 'filename...' ]
    if (parts.length < 3) return value; // unexpected shape

    const segment = parts[1];
    const filenameParts = parts.slice(2); // can contain nested pieces
    const normalizedPath = `/${this.uploadRoot}/images/${filenameParts.join('/')}`;

    // If original segment not 'images', attempt to duplicate the file to images folder (non-blocking)
    if (segment !== 'images') {
      this.ensureImageCopy(segment, filenameParts.join('/')).catch(
        () => undefined,
      );
    }

    return this.baseUrl ? `${this.baseUrl}${normalizedPath}` : normalizedPath;
  }

  private async ensureImageCopy(
    originalSegment: string,
    filename: string,
  ): Promise<void> {
    try {
      const uploadsDir = join(process.cwd(), this.uploadRoot);
      const originalPath = join(uploadsDir, originalSegment, filename);
      const imagesDir = join(uploadsDir, 'images');
      const targetPath = join(imagesDir, filename);

      await fsPromises.mkdir(imagesDir, { recursive: true });

      // If target exists, skip
      try {
        await fsPromises.access(targetPath);
        return;
      } catch {
        /* not exists */
      }

      // Copy if original exists
      try {
        await fsPromises.access(originalPath);
        await fsPromises.copyFile(originalPath, targetPath);
      } catch {
        // Ignore if original missing
      }
    } catch {
      // Silent failure; transformation should not break response
    }
  }
}
