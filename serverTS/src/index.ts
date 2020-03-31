import express from "express"
import cors from 'cors'
import fs from 'fs'
import path from 'path'


const PORT: number = 3000;

const app = express();

app.use(cors());

app.get(/^\/api\/((?:.{0,}))(?:\/(?=$))?$/i, async (req, res) => {
  const location = path.resolve('/', req.params[0] || '');
  const files = getFileList(location);
  res.status(200).send(files);
});


app.listen(PORT, (): void => {
  // tslint:disable-next-line:no-console
  console.log('App listening on port ', PORT);
});


enum FileItemType {
  file = 'file',
  directory = 'directory',
}

interface FileData {
  fileName: string
  path: string
  modifiedDate: Date
  size: number
  itemsCount: number
  type: FileItemType
}

function getFileList(p: string): FileData[] {
  const folder = fs.readdirSync(p);
  return folder.map(file => {
    const location = path.resolve(p, file);
    const stat = fs.statSync(location);
    return {
      fileName: file,
      path: location,
      modifiedDate: new Date(stat.mtimeMs),
      size: stat.size,
      itemsCount: getItemsCount(location, stat),
      type: getItemType(stat),
    } as FileData;
  });
}

function getItemsCount(location: string, stat: fs.Stats): number {
  if (stat.isDirectory()) {
    const [err, files] = handleFsSync(fs.readdirSync, location);
    if (err) return -1;
    return files.length;
  }
  return 0;
}


function getItemType(stat: fs.Stats): FileItemType | null {
  if (stat.isFile()) return FileItemType.file;
  if (stat.isDirectory()) return FileItemType.directory;
  return null;
}

function handleFsSync(method: (...args: any[]) => void, ...args: any[]) {
  try {
    const res = method(...args);
    return [null, res];
  } catch (e) {
    return [e, null];
  }
}