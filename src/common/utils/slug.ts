import slugify from 'slugify';

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A slugified string
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}
