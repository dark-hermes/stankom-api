import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Exception filter to catch Multer file limit errors and provide clearer messages.
 * Catches "Unexpected field" errors from FilesInterceptor maxCount limit.
 */
@Catch(BadRequestException)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if this is a Multer "Unexpected field" error
    let message: string | string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message = (exceptionResponse as Record<string, any>).message;
    }

    // Handle array of messages from class-validator
    if (Array.isArray(message)) {
      message = message[0];
    }

    // If it's an "Unexpected field" error, provide a better message
    if (typeof message === 'string' && message.includes('Unexpected field')) {
      const fieldMatch = message.match(/Unexpected field - (\w+)/);
      if (fieldMatch && fieldMatch[1] === 'files') {
        return response.status(status).json({
          statusCode: status,
          message: 'Maksimal 4 gambar dapat diunggah sekaligus.',
          error: 'Bad Request',
        });
      }
    }

    // For other BadRequestExceptions, return the original response
    response.status(status).json(exceptionResponse);
  }
}
