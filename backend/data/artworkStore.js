const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const fileLocks = new Map();

function withFileLock(filePath, operation) {
  const key = path.resolve(filePath);
  const previous = fileLocks.get(key) || Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const tail = previous.then(() => gate);
  fileLocks.set(key, tail);

  return previous.then(operation).finally(() => {
    release();
    if (fileLocks.get(key) === tail) {
      fileLocks.delete(key);
    }
  });
}

async function atomicWriteFile(filePath, contents) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });

  let mode = 0o600;
  try {
    mode = (await fs.stat(filePath)).mode & 0o777;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`
  );
  let fileHandle;

  try {
    fileHandle = await fs.open(temporaryPath, "wx", mode);
    await fileHandle.writeFile(contents, "utf8");
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = null;
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    if (fileHandle) {
      await fileHandle.close().catch((closeError) => {
        error.closeError = closeError;
      });
    }
    try {
      await fs.rm(temporaryPath, { force: true });
    } catch (cleanupError) {
      error.cleanupError = cleanupError;
    }
    throw error;
  }
}

async function atomicWriteJson(filePath, value) {
  await atomicWriteFile(filePath, JSON.stringify(value, null, 2));
}

function crudMarkerPath(filePath) {
  return `${filePath}.crud-modified`;
}

async function hasCrudChanges(filePath) {
  try {
    await fs.access(crudMarkerPath(filePath));
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function markCrudChanged(filePath) {
  const marker = crudMarkerPath(filePath);
  if (!(await hasCrudChanges(filePath))) {
    await atomicWriteFile(marker, `${new Date().toISOString()}\n`);
  }
}

function writeSyncedArtworks(filePath, artworks) {
  return withFileLock(filePath, async () => {
    if (await hasCrudChanges(filePath)) {
      return false;
    }
    await atomicWriteJson(filePath, artworks);
    return true;
  });
}

module.exports = {
  atomicWriteJson,
  hasCrudChanges,
  markCrudChanged,
  withFileLock,
  writeSyncedArtworks,
};
