import debug from "debug";
import express from "express";
import redoc from "redoc-express";
import swaggerJsdoc from "swagger-jsdoc";

const info = debug("bobaserver:handlers:open-api-log");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "BobaBoard's API documentation.",
      version: "0.0.1",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      // Note: indenting the description will cause the markdown not to format correctly.
      description: `
# Intro
Welcome to the BobaBoard's backend API. This is still a WIP.

# Example Section
This is just to test that sections work. It will be written better later.
        `,
      contact: {
        name: "Ms. Boba",
        url: "https://www.bobaboard.com",
        email: "ms.boba@bobaboard.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4200",
        description: "Development server",
      },
    ],
    // These are used to group endpoints in the sidebar
    tags: [
      {
        name: "/posts/",
        description: "APIs related to the /posts/ endpoints.",
      },
      {
        name: "/threads/",
        description: "APIs related to the /threads/ endpoints.",
      },
      {
        name: "/boards/",
        description: "APIs related to the /boards/ endpoints.",
      },
      {
        name: "/realms/",
        description: "APIs related to the /realms/ endpoints.",
      },
      {
        name: "/users/",
        description: "APIs related to the /users/ endpoints.",
      },
      {
        name: "todo",
        description: "APIs whose documentation still needs work.",
      },
      {
        name: "models",
        "x-displayName": "Models",
        description: `
## Contribution
<SchemaDefinition schemaRef="#/components/schemas/Contribution" />

## Tags
<SchemaDefinition schemaRef="#/components/schemas/Tags" />

## Comment
<SchemaDefinition schemaRef="#/components/schemas/Comment" />

## Board Summary (logged in)
<SchemaDefinition schemaRef="#/components/schemas/LoggedInBoardSummary" />

## Descriptions
<SchemaDefinition schemaRef="#/components/schemas/Description" />
`,
      },
    ],
    // Special Redoc section to control how tags display in the sidebar.
    "x-tagGroups": [
      {
        name: "general",
        tags: [
          "/realms/",
          "/feeds/",
          "/boards/",
          "/threads/",
          "/posts/",
          "/users/",
          "/subscriptions/",
        ],
      },
      {
        name: "models",
        tags: ["models"],
      },
    ],
  },
  // Which paths to parse the API specs from.
  apis: [
    "./types/open-api/*.yaml",
    "./types/open-api/examples/*.yaml",
    "./server/*/routes.ts",
    "./server/*/examples/*.yaml",
  ],
};

export const specs = swaggerJsdoc(options);
// This is to fix https://github.com/Surnet/swagger-jsdoc/issues/314
// TODO: remove it when the issue is closed.
// @ts-ignore
delete specs["channels"];

export default (app: express.Express) => {
  app.get("/open-api.json", (req, res) => {
    info("Fetching open api specification");
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
  app.get(
    "/api-docs",
    redoc({
      title: "API Docs",
      specUrl: "/open-api.json",
    })
  );
};
