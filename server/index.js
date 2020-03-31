const express = require('express');
const cors = require('cors');

const fs = require('fs');
const path = require('path');


const PORT = 3000;

const app = express();

app.use(cors());

app.get(/^\/api\/((?:.{0,}))(?:\/(?=$))?$/i, async (req, res) => {
  const location = path.resolve('/', req.params[0] || '');
  const files = getFileList(location);
  res.status(200).send(files);
});


app.listen(PORT, () => {
  console.log('App listening on port ', PORT);
});


function getFileList(p) {
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
    };
  });
}

function getItemsCount(location, stat) {
  if (stat.isDirectory()) {
    const [err, files] = handleFsSync(fs.readdirSync, location);
    if (err) return -1;
    return files.length;
  }
  return 0;
}

function getItemType(stat) {
  if (stat.isFile()) return 'file';
  if (stat.isDirectory()) return 'directory';
  return null;
}

function handleFsSync(method, ...args) {
  try {
    const res = method(...args);
    return [null, res];
  } catch (e) {
    return [e, null];
  }
}