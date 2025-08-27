import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import {
  CROWN_ACCESSORY_EXTERNAL_ID,
  GOREMASTER_ROLE_EXTERNAL_ID,
  OWNER_ROLE_EXTERNAL_ID,
} from "test/data/user";
import {
  TWISTED_MINDS_REALM_EXTERNAL_ID,
  UWU_REALM_EXTERNAL_ID,
} from "test/data/realms";
import { getUserFromFirebaseId, getUserRolesByRealm } from "../queries";

import { GORE_BOARD_ID } from "test/data/boards";

describe("Tests user queries", () => {
  test("gets user from id", async () => {
    const user = await getUserFromFirebaseId({
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    expect(user).toEqual({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: JERSEY_DEVIL_USER_ID,
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });

  test("returns all the roles a user has in a given realm - user with realm role but no board roles", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: ZODIAC_KILLER_USER_ID,
      realmId: UWU_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
        color: "pink",
        description: "A role for the owner.",
        name: "The Owner",
        permissions:
          "{edit_board_details,post_as_role,move_thread,create_realm_invite,view_roles_on_realm,view_roles_on_board,create_board_on_realm}",
        id: OWNER_ROLE_EXTERNAL_ID,
        board_ids: [],
        accessory_external_id: "9e593709-419f-4b2c-b7ee-88ed47884c3c",
      },
    ]);
  });

  test("returns all the roles a user has in a given realm - user with board role", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: ONCEST_USER_ID,
      realmId: TWISTED_MINDS_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([
      {
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        color: "red",
        description: "A role for people who can edit the gore board.",
        name: "GoreMaster5000",
        permissions:
          "{edit_board_details,delete_board,post_as_role,edit_category_tags,edit_content_notices}",
        id: GOREMASTER_ROLE_EXTERNAL_ID,
        board_ids: [GORE_BOARD_ID],
        accessory_external_id: null,
      },
    ]);
  });

  test("returns all the roles a user has in a given realm - user with realm role and board role", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: BOBATAN_USER_ID,
      realmId: TWISTED_MINDS_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([
      {
        id: GOREMASTER_ROLE_EXTERNAL_ID,
        name: "GoreMaster5000",
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
        color: "red",
        description: "A role for people who can edit the gore board.",
        permissions:
          "{edit_board_details,delete_board,post_as_role,edit_category_tags,edit_content_notices}",
        board_ids: [GORE_BOARD_ID],
        accessory_external_id: null,
      },
      {
        id: OWNER_ROLE_EXTERNAL_ID,
        name: "The Owner",
        avatar_reference_id:
          "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
        color: "pink",
        description: "A role for the owner.",
        permissions:
          "{edit_board_details,post_as_role,move_thread,create_realm_invite,view_roles_on_realm,view_roles_on_board,create_board_on_realm}",
        board_ids: [],
        accessory_external_id: CROWN_ACCESSORY_EXTERNAL_ID,
      },
    ]);
  });

  test("returns an empty array if user has no roles in a given realm", async () => {
    const roles = await getUserRolesByRealm({
      firebaseId: JERSEY_DEVIL_USER_ID,
      realmId: UWU_REALM_EXTERNAL_ID,
    });
    expect(roles).toEqual([]);
  });

  test.todo(
    "lists multiple boards where a user has the same role, if applicable (no examples in test data yet)"
  );
});
