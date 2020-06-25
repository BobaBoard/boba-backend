import debug from "debug";
import express from "express";
import axios from "axios";
import { createBoardsIfNotExist, createIdentitiesIfNotExist } from "./queries";
import { isLoggedIn } from "../auth-handler";
// import { transformImageUrls, mergeActivityIdentities } from "../response-utils";

const log = debug("bobaserver:admin:routes");

const router = express.Router();

const ADMIN_ID = "c6HimTlg2RhVH3fC1psXZORdLcx2";
const BOARDS_SHEET_ID = "1ikA8dgtKAHuf-3FVrCfwWZ-0hL-1fMd7u1mGvLz4_no";
const IDENTITIES_SHEET_ID = "1I3xXEQTDrp_XVpYWCTtTj106F2ad-PW__474NeqAHvs";
const API_KEY = "AIzaSyA2KQh1wqrLwsrWvKQvFWeWoWMR8KOyTD4";
const getSheetUrl = (url: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${url}/?key=${API_KEY}&includeGridData=true`;

router.post("/generate/boards", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (req.currentUser?.uid !== ADMIN_ID) {
    // TODO: fix wrong status
    return res.sendStatus(401);
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
});

router.post("/generate/identities", isLoggedIn, async (req, res) => {
  // @ts-ignore
  if (req.currentUser?.uid !== ADMIN_ID) {
    // TODO: fix wrong status
    return res.sendStatus(401);
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

export default router;
