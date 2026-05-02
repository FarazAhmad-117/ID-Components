import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, '.source', 'index.ts');

if (!fs.existsSync(indexPath)) {
  process.exit(0);
}

let source = fs.readFileSync(indexPath, 'utf8');
source = source.replace(/^\/\/ @ts-nocheck[^\n]*\n/gm, '');
source = `// @ts-nocheck\n${source}`;
fs.writeFileSync(indexPath, source);
