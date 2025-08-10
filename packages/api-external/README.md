# BobaBoard's External API Packages

This directory contains code to generate packages for types, schemas, and
clients that make it possible to interact with BobaBackend in a type-safe way.
These are based on our OpenAPI specification.

**How to use:**

From the `packages/api-external` directory run:

- `yarn generate` - Generate API types and client from OpenAPI spec
- `yarn build` - Build the packages

## Structure

The most important files are:

- `kubb.config.ts` - Configuration for [Kubb](https://kubb.dev/), which handles
  generating the various types of exports.
- `tsdown.config.ts` - Our build configuration, which uses
  [tsdown](https://tsdown.dev/) to package everything in the appropriate formats
- The `boba-client/` and `boba-api/` directories contain each library's
  `package.json` (for NPM configuration, and any file exclusive to each).

Generated files are inside the `generated/` directory.

### Packages

#### `@bobaboard/boba-api`

This library exports:

- Type definitions for all API endpoints and request/response types
  (`@bobaboard/boba-api/types`)
- Zod schemas for runtime validation (`@bobaboard/boba-api/zod`)

#### `@bobaboard/boba-client`

This library exports a fully typed fetch-based client for all BobaBoard API
endpoints, with built-in Zod schema validation. Depends on `@bobaboard/boba-api`.
