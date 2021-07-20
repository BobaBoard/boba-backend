import debug from "debug";
import express from "express";
import axios from "axios";
import {
  createBoardsIfNotExist,
  createIdentitiesIfNotExist,
  createInvite,
  updateIdentities,
} from "./queries";
import { isLoggedIn } from "../../handlers/auth";
import firebaseAuth from "firebase-admin";
import { randomBytes } from "crypto";
import { getUserFromFirebaseId } from "../users/queries";
import { cache, CacheKeys } from "../cache";

// import { transformImageUrls, mergeActivityIdentities } from "../response-utils";

const log = debug("bobaserver:admin:routes");

const router = express.Router();

const ADMIN_ID = "c6HimTlg2RhVH3fC1psXZORdLcx2";
const BOARDS_SHEET_ID = "1ikA8dgtKAHuf-3FVrCfwWZ-0hL-1fMd7u1mGvLz4_no";
const IDENTITIES_SHEET_ID = "1I3xXEQTDrp_XVpYWCTtTj106F2ad-PW__474NeqAHvs";
const EVENT_SHEET_ID = "175LkjNRPFfNkPQqLZwma_EIJedBdB12exl8qcoVns8Q";
const API_KEY = "AIzaSyA2KQh1wqrLwsrWvKQvFWeWoWMR8KOyTD4";
const getSheetUrl = (url: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${url}/?key=${API_KEY}&includeGridData=true`;

router.post("/generate/boards", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (req.currentUser?.uid !== ADMIN_ID) {
    return res.sendStatus(403);
  }

  const data = await getSpreadsheetData(
    getSheetUrl(BOARDS_SHEET_ID),
    (rowData, i) => ({
      slug: rowData[i].values?.[0]?.formattedValue,
      tagline: rowData[i].values?.[1]?.formattedValue,
      avatar: rowData[i]?.values?.[2]?.formattedValue,
      accent: rowData[i]?.values?.[3]?.formattedValue,
    })
  );
  const recordsAdded = await createBoardsIfNotExist(data);

  res.status(200).json({ added: recordsAdded });

  cache().del(CacheKeys.BOARDS);
});

router.post("/generate/identities", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (req.currentUser?.uid !== ADMIN_ID) {
    return res.sendStatus(403);
  }

  const data = await getSpreadsheetData(
    getSheetUrl(IDENTITIES_SHEET_ID),
    (rowData, i) => ({
      name: rowData[i].values?.[0]?.formattedValue,
      avatar: rowData[i].values?.[1]?.formattedValue,
    })
  );
  const recordsAdded = await createIdentitiesIfNotExist(data);

  res.status(200).json({ added: recordsAdded });
});

router.post("/generate/identities/event", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (req.currentUser?.uid !== ADMIN_ID) {
    return res.sendStatus(403);
  }

  const data = await getSpreadsheetData(
    getSheetUrl(EVENT_SHEET_ID),
    (rowData, i) => ({
      oldName: rowData[i].values?.[0]?.formattedValue,
      oldAvatar: rowData[i].values?.[1]?.formattedValue,
      eventName: rowData[i].values?.[2]?.formattedValue,
      eventAvatar: rowData[i].values?.[3]?.formattedValue,
    })
  );
  const recordsChanged = updateIdentities(
    data.map((data) => ({
      oldName: data.oldName,
      oldAvatar: data.oldAvatar,
      newName: data.eventName,
      newAvatar: data.eventAvatar,
    }))
  );

  res.status(200).json({ added: recordsChanged });
});

router.post(
  "/generate/identities/event/revert",
  isLoggedIn,
  async (req, res) => {
    // @ts-ignore
    if (req.currentUser?.uid !== ADMIN_ID) {
      return res.sendStatus(403);
    }

    const data = await getSpreadsheetData(
      getSheetUrl(EVENT_SHEET_ID),
      (rowData, i) => ({
        oldName: rowData[i].values?.[0]?.formattedValue,
        oldAvatar: rowData[i].values?.[1]?.formattedValue,
        eventName: rowData[i].values?.[2]?.formattedValue,
        eventAvatar: rowData[i].values?.[3]?.formattedValue,
      })
    );
    const recordsChanged = updateIdentities(
      data.map((data) => ({
        oldName: data.eventName,
        oldAvatar: data.eventAvatar,
        newName: data.oldName,
        newAvatar: data.oldAvatar,
      }))
    );

    res.status(200).json({ added: recordsChanged });
  }
);

router.post("/invite/generate", isLoggedIn, async (req, res) => {
  // @ts-ignore
  const user = req.currentUser?.uid;
  if (user !== ADMIN_ID) {
    return res.sendStatus(403);
  }
  const { email } = req.body;
  // Generate 64 characters random id string
  const inviteCode = randomBytes(32).toString("hex");
  const adminId = await getUserFromFirebaseId({ firebaseId: user });

  log(adminId);
  const inviteAdded = await createInvite({
    email,
    inviteCode,
    inviterId: adminId.id,
  });

  if (!inviteAdded) {
    res.status(500).send(`Couldn't generate invite for email ${email}`);
  }
  res
    .status(200)
    .json({ inviteUrl: `https://v0.boba.social/invite/${inviteCode}` });
});

router.post("/migrate_fb_data", isLoggedIn, async (req, res) => {
  // @ts-ignore
  const user = req.currentUser?.uid;
  if (user !== ADMIN_ID) {
    return res.sendStatus(403);
  }
  // Get all users query
  firebaseAuth
    .auth()
    .listUsers(1000)
    .then((listUsersResult) => {
      listUsersResult.users.forEach((userRecord) => {
        userRecord.metadata.creationTime;
        const hasSignedIn = !!userRecord.metadata.lastSignInTime;
        // Add creation time
        //
        console.log("user", userRecord.toJSON());
      });
    })
    .catch(function (error) {
      console.log("Error listing users:", error);
    });

  log(await firebaseAuth.auth().getUser(user));

  res.status(200).json({ added: true });
});

const getSpreadsheetData = (
  url: string,
  transform: (rowData: any, index: number) => any
) => {
  return axios.get(url).then((response) => {
    const rowData = response.data.sheets[0].data[0].rowData;
    let hasData = true;
    let i = 1;
    const rows = [];
    while (hasData && i < rowData.length) {
      const currentRow = transform(rowData, i);
      log(`Got data for row ${i}:`);
      log(currentRow);
      rows.push(currentRow);
      i++;
      hasData = !!rowData[i]?.values[1]?.formattedValue;
    }
    return rows;
  });
};

// router.get("/latest_release", async (req, res) => {
//   if (!process.env.LATEST_RELEASE_THREAD_STRING_ID) {
//     res.sendStatus(404);
//   }
//   if ()
// });
export default router;
