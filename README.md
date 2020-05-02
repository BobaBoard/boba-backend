# BobaServer

Welcome to BobaBoard's server project. This

## Development Setup

Bobaserver is a TypeScript project using npm as package manager.

- #### Download dependencies
  ```
  npm install
  ```
- #### Set up environment variables

  1. Create file named `.env` in top level directory
  2. Add the following variables within the file (sample values):
     ```
     POSTGRES_USER=the_amazing_bobaboard
     POSTGRES_PASSWORD=how_secure_can_this_db_be
     POSTGRES_DB=bobaboard_test
     POSTGRES_PORT=35432
     ```

- #### Run DB

  ```
  npm run start-db
  ```

- #### Run server

  ```
  npm run start

  ```

- #### Connect to Postgres (for testing queries)

  ```
  psql postgres://the_amazing_bobaboard:how_secure_can_this_db_be@127.0.0.1:35432/bobaboard_test
  ```

  (Might have to install some util, google the error messages in case.)

## Testing

- #### Regular one-shot testing
  ```
  npm run test
  ```
- #### Test + Watch
  ```
  npm run test:watch
  ```
- #### Use Docker for Tests (useful for CircleCI errors)
  ```
  npm run test:docker
  ```

## How to Add a New Set of API Routes

- Create a folder named like the prefix of the API route in /server/
- Add a queries.ts file for the queries, a routes.ts for the routes and tests
  - For reference see e.g. /server/boards/
- Add the new route to /server/all-routest.ts
