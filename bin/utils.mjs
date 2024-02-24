import path from "path";
import fs from "fs";

export const copyFile = (source, target) => {
    return new Promise((resolve, reject) => {
        const rd = fs.createReadStream(source);
        rd.on('error', reject);
        const wr = fs.createWriteStream(target);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
  };
  
export const createFolder = (folderPath) => {
    return new Promise((resolve, reject) => {
      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  };
  
export const copyFolder = (source, target) => {
    return new Promise((resolve, reject) => {
      fs.mkdirSync(target, { recursive: true }); 
  
      fs.readdir(source, { withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
  
        const copyPromises = files.map((file) => {
          const sourcePath = path.join(source, file.name);
          const targetPath = path.join(target, file.name);
  
          if (file.isDirectory()) {
            return copyFolder(sourcePath, targetPath); 
          } else {
            return copyFile(sourcePath, targetPath);
          }
        });
  
        Promise.all(copyPromises)
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    });
  };
  