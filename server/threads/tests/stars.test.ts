import { getThreadByStringId , starThread , unstarThread} from "../queries";

const extractStarredFromThread = (thread: any) => {
  return {
//    thread_id: thread.thread_id,
    muted: thread.muted,
    starred: thread.starred,
  };
};

describe("starring functionality", () => {
  test("adding thread to star feed", async () => {
    // Run the code and save the result.
    // use expect() to check that the result is what's expected.
    const starring = await starThread({
      // Favorite Character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    const unstarring = await unstarThread({
      // Favorite Character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // jersey devil
      firebaseId: "fb2",
    });

    const jerseythread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // jersey devil
      firebaseId: "fb2",
    });
    expect(extractStarredFromThread(thread)).toEqual({
      starred: true,
      muted: false,
    });

    expect(extractStarredFromThread(jerseythread)).toEqual({
      starred: false,
      muted: false,
    });
  });
});
