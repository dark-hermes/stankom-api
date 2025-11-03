# Route Order Fix - NestJS Controller

## Problem

When calling `GET /api/v1/news/categories`, the API returned:

```
Validation failed (numeric string is expected)
```

## Root Cause

**NestJS route matching is order-dependent.** When routes are defined in this order:

```typescript
@Get(':id')         // Defined FIRST
async findOne() {}

@Get('categories')  // Defined SECOND
async getCategories() {}
```

NestJS registers the `:id` route first, causing it to match `/news/categories` before the specific `categories` route. The string "categories" was being passed to `ParseIntPipe`, which expected a numeric ID.

### Route Registration (Before Fix)

```
Mapped {/api/v1/news/:id, GET} route          ← Registered first
Mapped {/api/v1/news/categories, GET} route   ← Registered second (never matched!)
```

## Solution

**Always define specific static routes BEFORE parameterized routes** in NestJS controllers.

### Controller Reorganization

Reorganized `src/news/news.controller.ts` with this route order:

1. **Categories CRUD** (specific routes first)
   - `POST /categories`
   - `GET /categories`
   - `PUT /categories/:id`
   - `DELETE /categories/:id`

2. **Tags CRUD** (specific routes first)
   - `POST /tags`
   - `GET /tags`
   - `PUT /tags/:id`
   - `DELETE /tags/:id`

3. **News CRUD** (parameterized routes last)
   - `POST /`
   - `GET /`
   - `GET /:id` ← Now defined AFTER specific routes
   - `PUT /:id`
   - `DELETE /:id`

### Route Registration (After Fix)

```
Mapped {/api/v1/news/categories, POST} route
Mapped {/api/v1/news/categories, GET} route      ← Now BEFORE :id routes!
Mapped {/api/v1/news/categories/:id, PUT} route
Mapped {/api/v1/news/categories/:id, DELETE} route
Mapped {/api/v1/news/tags, POST} route
Mapped {/api/v1/news/tags, GET} route
Mapped {/api/v1/news/tags/:id, PUT} route
Mapped {/api/v1/news/tags/:id, DELETE} route
Mapped {/api/v1/news, POST} route
Mapped {/api/v1/news, GET} route
Mapped {/api/v1/news/:id, GET} route             ← Now AFTER specific routes
Mapped {/api/v1/news/:id, PUT} route
Mapped {/api/v1/news/:id, DELETE} route
```

## Verification

✅ All unit tests pass (35 tests)
✅ All e2e tests pass (4 tests)
✅ Routes are now registered in correct order
✅ `GET /news/categories` now matches the correct route

## Key Takeaway

In NestJS, **route definition order matters**. When you have both specific routes (like `/categories`) and parameterized routes (like `/:id`) under the same path prefix, always define the specific routes first in your controller.

This is a critical pattern for any NestJS controller with mixed route types.
