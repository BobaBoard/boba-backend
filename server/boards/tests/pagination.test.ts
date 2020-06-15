import "mocha";
import { expect } from "chai";

import { getBoardActivityBySlug } from "../queries";

describe("Tests boards queries", () => {
  it("fetches first page, gets cursor back", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    expect(boardActivity.cursor).to.equal(
      "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMTVUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ=="
    );
    expect(boardActivity.activity.length).to.eql(10);
    expect(boardActivity.activity[0].content).to.eql('[{"insert":"Post 26!"}]');
    expect(
      boardActivity.activity[boardActivity.activity.length - 1].content
    ).to.eql('[{"insert":"Post 17!"}]');
  });

  it("fetches second page, gets cursor back", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor:
        "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMTVUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ==",
    });

    expect(boardActivity.cursor).to.equal(
      "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMDVUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ=="
    );
    expect(boardActivity.activity.length).to.eql(10);
    expect(boardActivity.activity[0].content).to.eql('[{"insert":"Post 16!"}]');
    expect(
      boardActivity.activity[boardActivity.activity.length - 1].content
    ).to.eql('[{"insert":"Post 7!"}]');
  });

  it("fetches last page, gets no cursor back", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor:
        "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMDVUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ==",
    });

    expect(boardActivity.cursor).to.be.null;
    expect(boardActivity.activity.length).to.eql(6);
    expect(boardActivity.activity[0].content).to.eql('[{"insert":"Post 6!"}]');
    expect(
      boardActivity.activity[boardActivity.activity.length - 1].content
    ).to.eql('[{"insert":"Post 1!"}]');
  });

  it("fetches correctly when only one result after current page", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor:
        "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDQtMTBUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ==",
    });

    expect(boardActivity.activity.length).to.eql(10);
    expect(boardActivity.activity[0].content).to.eql('[{"insert":"Post 11!"}]');
    expect(
      boardActivity.activity[boardActivity.activity.length - 1].content
    ).to.eql('[{"insert":"Post 2!"}]');

    const boardActivity2 = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: boardActivity.cursor,
    });

    expect(boardActivity2.activity.length).to.eql(1);
    expect(boardActivity2.activity[0].content).to.eql('[{"insert":"Post 1!"}]');
  });

  it("fetches correctly when no result after current page (outdated cursor)", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "long",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor:
        "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMTktMDQtMTBUMDU6NDI6MDAiLCJwYWdlX3NpemUiOjEwfQ==",
    });

    expect(boardActivity.cursor).to.be.null;
    expect(boardActivity.activity.length).to.eql(0);
  });
});
