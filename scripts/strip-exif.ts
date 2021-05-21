import firebaseAuth, { storage } from "firebase-admin";
import { File } from "@google-cloud/storage";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import ExifImage from "exif";
const { writeFile, readFile } = require("fs");
const { promisify } = require("util");
import reader from "line-reader";
const writeFilePromise = promisify(writeFile);
const readLinePromise = promisify(reader.eachLine);
const readFilePromise = promisify(readFile);
import { rotate } from "jpeg-autorotate";
import { remove } from "exifremove";

const FILENAMES = [];

dotenvExpand(dotenv.config());

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH);

if (!firebaseAuth.apps.length) {
  firebaseAuth.initializeApp({
    credential: firebaseAuth.credential.cert(serviceAccount),
  });
}

const stripImage = async (name) => {
  const fileBuffer = await readFilePromise(`./scripts/images/${name}`);
  let image = fileBuffer;
  try {
    image = (await rotate(fileBuffer, {})).buffer;
  } catch (e) {
    console.log(e.code);
    if (e.code == "read_exif") {
    } else if (!e.code) {
      console.log(e);
    } else if (
      e.code !== "correct_orientation" &&
      e.code !== "no_orientation"
    ) {
      console.log(Object.entries(e));
      throw e;
    }
  }
  const final = remove(image);

  const promise = new Promise<Buffer>((resolve, reject) => {
    new ExifImage({ image: final }, (err, data) => {
      if (err) {
      } else {
        console.log(data);
      }
      resolve(final);
    });
  });
  return promise;
};

const bucket = storage().bucket("bobaboard-fb.appspot.com");
const updateImage = async (name: string, data: Buffer) => {
  const ref = bucket.file(name);
  const metadata = await ref.getMetadata();
  const token = metadata[0].metadata.firebaseStorageDownloadTokens;
  const type = metadata[0].metadata.contentType;
  console.log(type);
  await ref.save(data);
  await ref.setMetadata({
    metadata: {
      firebaseStorageDownloadTokens: token,
      contentType: type || "image/jpeg",
    },
  });
  console.log(
    "https://firebasestorage.googleapis.com/v0/b/" +
      bucket.name +
      "/o/" +
      encodeURIComponent(name) +
      `?alt=media&token=${token}`
  );
};

const readImages = async () => {
  await readLinePromise(`./scripts/images_with_exif.csv`, async (line) => {
    FILENAMES.push(line);
  });
  const toDownload = FILENAMES;
  let index = 0;
  for (let file of toDownload) {
    console.log(index, file);
    const data = await stripImage(file);
    const remoteName = file.split("$").join("/");
    await updateImage(remoteName, data);
    index++;
  }
};
readImages();
