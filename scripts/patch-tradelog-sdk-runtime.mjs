import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const runtimeIndexPath = join(
  process.cwd(),
  'node_modules',
  '@tradelog',
  'support-sdk-web',
  'runtime',
  'index.html',
);

try {
  const source = readFileSync(runtimeIndexPath, 'utf8');
  const next = source.replace(/<base href="[^"]*">/, '<base href="./">');

  if (next !== source) {
    writeFileSync(runtimeIndexPath, next);
    console.log('Patched TradeLog SDK runtime base href to ./');
  }
} catch (error) {
  console.warn(`Skipping TradeLog SDK runtime patch: ${error.message}`);
}
