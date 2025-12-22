/**
 * Removes sensitive user fields (password, email) from user objects in responses.
 * Used to prevent credential leakage in public endpoints.
 */
export function sanitizeUserData<T>(data: T): T {
  if (data == null) return data;

  // Preserve Date objects as-is to avoid turning them into empty objects
  if (data instanceof Date) return data as unknown as T;

  if (Array.isArray(data)) {
    const mapped = (data as unknown[]).map((item) => sanitizeUserData(item));
    return mapped as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitized = { ...(data as Record<string, unknown>) } as Record<
      string,
      unknown
    >;

    // Remove sensitive fields from user objects
    if ('password' in sanitized) {
      delete sanitized.password;
    }
    if ('email' in sanitized && 'name' in sanitized && 'id' in sanitized) {
      // This looks like a User object - remove email too
      delete sanitized.email;
    }

    // Recursively sanitize nested objects
    for (const key of Object.keys(sanitized)) {
      const value = sanitized[key];
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeUserData(
          value as unknown as Record<string, unknown>,
        );
      }
    }

    return sanitized as T;
  }

  return data;
}
