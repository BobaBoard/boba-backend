import debug from "debug";
import pool from "../pool";

const log = debug("bobaserver:admin:queries-log");
const error = debug("bobaserver:admin:queries-error");

export const updateIdentities = async (
  identities: {
    oldName: string;
    oldAvatar: string;
    newName: string;
    newAvatar: string;
  }[]
) => {
  const query = `
      UPDATE secret_identities
      SET 
        display_name = $/new_name/,
        avatar_reference_id = $/new_avatar/
      WHERE
        display_name = $/old_name/ AND
        avatar_reference_id = $/old_avatar/
      RETURNING *`;

  return pool
    .tx("update-identities", async (transaction) => {
      const results = await Promise.all(
        identities.map((id) => {
          return transaction.one(query, {
            old_name: id.oldName,
            old_avatar: id.oldAvatar,
            new_name: id.newName,
            new_avatar: id.newAvatar,
          });
        })
      );
      return results;
    })
    .catch((e) => {
      error("Could not update identities.");
      error(e);
      return false;
    });
};

export const createIdentitiesIfNotExist = async (
  identities: {
    avatar?: string;
    name?: string;
  }[]
) => {
  const query = `
    INSERT INTO secret_identities(display_name, avatar_reference_id) VALUES (
      $/display_name/,
      $/avatar_reference_id/)
    ON CONFLICT(display_name) DO UPDATE 
    SET avatar_reference_id = $/avatar_reference_id/
    WHERE secret_identities.display_name = $/display_name/`;
  try {
    const promises = identities.map(({ name, avatar }) => {
      log(`Attempting to insert identity: ${name}`);
      log(`data: `, {
        name,
        avatar,
      });
      if (!(name && avatar)) {
        log(`...data missing.`);
        return null;
      }
      return pool.none(query, {
        display_name: name,
        avatar_reference_id: avatar,
      });
    });
    const result = await Promise.all(promises);
    log(`Added identity records.`);
    return true;
  } catch (e) {
    error(`Error while adding new identities.`);
    error(e);
    return false;
  }
};

export const createBoardsIfNotExist = async (
  boards: {
    slug?: string;
    tagline?: string;
    avatar?: string;
    accent?: string;
  }[]
) => {
  // TODO: make this a transaction maybe?
  const query = `
      INSERT INTO boards(slug, tagline, avatar_reference_id, settings) VALUES (
        $/slug/,
        $/tagline/,
        $/avatar_reference_id/,
        $/settings/)
      ON CONFLICT(slug) DO UPDATE 
      SET tagline = $/tagline/,
          avatar_reference_id = $/avatar_reference_id/,
          settings = $/settings/
      WHERE boards.slug = $/slug/`;

  try {
    const promises = boards.map(({ slug, tagline, avatar, accent }) => {
      log(`Attempting to insert board: ${slug}`);
      log(`data: `, {
        slug,
        tagline,
        avatar,
        accent,
      });
      if (!(slug && tagline && avatar && accent)) {
        log(`...data missing.`);
        return null;
      }
      return pool.none(query, {
        slug,
        tagline,
        avatar_reference_id: avatar,
        settings: {
          accentColor: accent,
        },
      });
    });
    const result = await Promise.all(promises);
    log(`Added new board records.`);
    return true;
  } catch (e) {
    error(`Error while adding new board.`);
    error(e);
    return false;
  }
};

export const createInvite = async (inviteData: {
  email: string;
  inviteCode: string;
  inviterId: number;
}) => {
  const query = `
    INSERT INTO account_invites(nonce, inviter, invitee_email, duration)
    VALUES (
      $/invite_code/,
      $/inviter_id/,
      $/email/,
      INTERVAL '1 WEEK')`;
  try {
    await pool.none(query, {
      invite_code: inviteData.inviteCode,
      inviter_id: inviteData.inviterId,
      email: inviteData.email,
    });
    log(`Generated invite for email ${inviteData.email}.`);
    return true;
  } catch (e) {
    error(`Error while generating invite.`);
    error(e);
    return false;
  }
};
