import type { Response } from 'supertest';

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Narrow supertest Response.body to a typed ApiResponse<T>
export function asApiResponse<T>(res: Response): ApiResponse<T> {
  // supertest Response.body is any; cast in one place to keep tests typed elsewhere
  return res.body as ApiResponse<T>;
}
