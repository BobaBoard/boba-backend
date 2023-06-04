const fs = require("fs");

function copySetupFile(srcName, destName) {
  console.log(`Copying ${srcName} to the project root...`);
  fs.copyFile(
    `${__dirname}/${srcName}`,
    `${__dirname}/../${destName}`,
    fs.constants.COPYFILE_EXCL,
    (err) => {
      if (err && err.code === "EEXIST") {
        console.warn(
          `File ${destName} already exists in the project root. If you want to replace it, you can delete the existing file and run this command again.`
        );
      } else if (err) {
        console.error("Error copying file: ", err);
      } else {
        console.log(
          `Successfully copied .env-setup/${srcName} to /${destName}!`
        );
      }
    }
  );
}

copySetupFile(".env-example", ".env");
copySetupFile("firebase-sdk-example.json", "firebase-sdk.json");
