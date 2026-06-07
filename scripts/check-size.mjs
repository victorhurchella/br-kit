// Bundle-size gate: the full TS bundle must stay under 8 kB min+gzip
// (design principle: someone importing only CPF should never pay for Pix).
//
//   npm run size
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const BUDGET = 8 * 1024;
const entry = fileURLToPath(new URL("../packages/ts/src/index.ts", import.meta.url));

const result = await build({
  entryPoints: [entry],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  write: false,
  legalComments: "none",
});

const code = result.outputFiles[0].contents;
const min = code.length;
const gz = gzipSync(code).length;

console.log(`full bundle, minified:       ${min} B`);
console.log(`full bundle, min+gzip:       ${gz} B   (budget ${BUDGET} B)`);

if (gz > BUDGET) {
  console.error(`✗ over budget by ${gz - BUDGET} B`);
  process.exit(1);
}
console.log(`✓ within budget — ${Math.round((gz / BUDGET) * 100)}% of 8 kB`);
