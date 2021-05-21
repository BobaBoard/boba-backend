import firebaseAuth, { storage } from "firebase-admin";
import { File } from "@google-cloud/storage";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import ExifImage from "exif";
const { writeFile } = require("fs");
const { promisify } = require("util");
const writeFilePromise = promisify(writeFile);

dotenvExpand(dotenv.config());

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH);

if (!firebaseAuth.apps.length) {
  firebaseAuth.initializeApp({
    credential: firebaseAuth.credential.cert(serviceAccount),
  });
}

const bucket = storage().bucket("bobaboard-fb.appspot.com");
const WITH_EXIF = [];
const analyzeFile = async (file: File) => {
  const fileBuffer = await file.download();
  const promise = new Promise<void>((resolve, reject) => {
    new ExifImage({ image: fileBuffer[0] }, async (err, data) => {
      if (err?.code == "NOT_A_JPEG") {
      } else if (err) {
        console.log(file.name);
        console.log(err);
      } else {
        const name = file.name.split("/").join("$");
        WITH_EXIF.push(name);
        console.log(file.name);
        console.log(data);
        await writeFilePromise("./scripts/images/" + name, fileBuffer[0], {
          flag: "w",
        });
      }
      resolve();
    });
  });
  return promise;
};

bucket.getFiles().then(async (files) => {
  const toAnalyze = files[0];
  let index = 0;
  for (let file of toAnalyze) {
    if (index < 5200) {
      index++;
      continue;
    }
    console.log(`Analyzing file ${index} of ${toAnalyze.length}`);
    await analyzeFile(file);
    index++;
  }
  console.log(WITH_EXIF);
  console.log(WITH_EXIF.length);

  return await writeFilePromise(
    "./scripts/images_with_exif.csv",
    WITH_EXIF.join("\n"),
    { flag: "w" }
  );
});
