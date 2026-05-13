import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

const locks = new Map();

async function withLock(file, fn) {
  const prev = locks.get(file) || Promise.resolve();
  let release;
  const next = new Promise((r) => { release = r; });
  locks.set(file, prev.then(() => next));
  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (locks.get(file) === next) locks.delete(file);
  }
}

export async function readJSON(file) {
  const filePath = path.join(DATA_DIR, file);
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

export async function writeJSON(file, data) {
  const filePath = path.join(DATA_DIR, file);
  await withLock(file, async () => {
    const tmp = filePath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, filePath);
  });
}

export async function nextId(items) {
  return items.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1;
}
