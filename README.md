# bobaserver

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
     PORT=35432
     ```

* #### Run DB

  ```
  npm run start-db
  ```

* #### Run server

  ```

  npm run start

  ```
