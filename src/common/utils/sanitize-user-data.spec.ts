import { sanitizeUserData } from './sanitize-user-data';

describe('sanitizeUserData', () => {
  it('should remove password from user object', () => {
    const input = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.dev',
      password: '$2b$10$LJVTEtFjsSPTn0NHfpHEQ.gwdm4JO3981k.B0Qdi3zqnyXVlXqJ2a',
    };

    const result = sanitizeUserData(input);

    expect(result).toEqual({
      id: 1,
      name: 'Admin',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('email');
  });

  it('should handle nested user objects', () => {
    const input = {
      id: 1,
      title: 'Service Title',
      createdBy: {
        id: 1,
        name: 'Admin',
        email: 'admin@test.dev',
        password: '$2b$10$hash',
      },
      updatedBy: {
        id: 2,
        name: 'Editor',
        email: 'editor@test.dev',
        password: '$2b$10$hash2',
      },
    };

    const result = sanitizeUserData(input);

    expect(result.createdBy).toEqual({ id: 1, name: 'Admin' });
    expect(result.updatedBy).toEqual({ id: 2, name: 'Editor' });
    expect(result.createdBy).not.toHaveProperty('password');
    expect(result.createdBy).not.toHaveProperty('email');
  });

  it('should handle arrays of objects with user data', () => {
    const input = {
      data: [
        {
          id: 1,
          title: 'Item 1',
          createdBy: {
            id: 1,
            name: 'Admin',
            email: 'admin@test.dev',
            password: '$2b$10$hash',
          },
        },
        {
          id: 2,
          title: 'Item 2',
          createdBy: {
            id: 2,
            name: 'User',
            email: 'user@test.dev',
            password: '$2b$10$hash2',
          },
        },
      ],
    };

    const result = sanitizeUserData(input);

    expect(result.data[0].createdBy).toEqual({ id: 1, name: 'Admin' });
    expect(result.data[1].createdBy).toEqual({ id: 2, name: 'User' });
    expect(result.data[0].createdBy).not.toHaveProperty('password');
    expect(result.data[0].createdBy).not.toHaveProperty('email');
  });

  it('should handle null and undefined values', () => {
    expect(sanitizeUserData(null)).toBeNull();
    expect(sanitizeUserData(undefined)).toBeUndefined();
  });

  it('should not modify objects without user data', () => {
    const input = {
      id: 1,
      title: 'News Title',
      content: 'News content',
    };

    const result = sanitizeUserData(input);

    expect(result).toEqual(input);
  });

  it('should preserve non-sensitive user fields', () => {
    const input = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.dev',
      password: '$2b$10$hash',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    };

    const result = sanitizeUserData(input);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Admin');
    expect(result.createdAt).toBe('2024-01-01');
    expect(result.updatedAt).toBe('2024-01-02');
  });
});
