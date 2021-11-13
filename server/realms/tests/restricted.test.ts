import express, { Express } from "express";

import { Server } from "http";
import request from "supertest";
import router from "../routes";
import { startTestServer } from "utils/test-utils";

const extractRestrictions = (board: any) => {
  return {
    logged_in_base_restrictions: board.logged_in_base_restrictions,
    logged_out_restrictions: board.logged_out_restrictions,
  };
};

describe("Tests restricted board realm queries", () => {
  const server = startTestServer(router);
  describe("tests logged-in-only board fetch", () => {
    describe("REST API", () => {
      // TODO: figure out mocking of firebase AUTH
      //   test("fetches board details when logged in (REST)", async () => {
      //   });

      test("doesn't fetch restricted board details in realm query when logged out", async () => {
        const res = await request(server.app).get("/slug/v0");

        expect(res.status).toBe(200);
        expect(
          res.body.boards.find((board: any) => board.slug == "restricted")
        ).toEqual({
          // TODO: fix to include "id" field
          //id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_id: "v0-fake-id",
          avatar_url:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          logged_in_only: true,
          delisted: false,
          accent_color: "#234a69",
          slug: "restricted",
          tagline: "A board to test for logged-in only view",
        });
      });
    });
  });
});
