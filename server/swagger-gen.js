import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { swaggerSpec } from './swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, 'swagger.json');

await fs.writeFile(out, JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log(`wrote ${out}`);
