// Parity gate: every function in spec/manifest.json MUST exist in BOTH the
// TypeScript package (built dist) and the Python package (imported from source).
// A function present in one language and absent in the other fails CI.
//
//   npm run parity   (root script builds the TS package first)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const manifestPath = fileURLToPath(new URL("spec/manifest.json", root));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const failures = [];

// --- TypeScript: dynamically import the built dist modules ------------------
for (const [mod, fns] of Object.entries(manifest.modules)) {
  const distUrl = new URL(`packages/ts/dist/${mod}.js`, root);
  let ns;
  try {
    ns = await import(distUrl.href);
  } catch (error) {
    failures.push(`TS module "${mod}" failed to import — run "npm run build": ${error.message}`);
    continue;
  }
  for (const fn of fns) {
    if (typeof ns[fn.ts] !== "function") failures.push(`TS ${mod}.${fn.ts} missing`);
  }
}

// --- Python: import from source (PYTHONPATH), no install required -----------
const pySrc = fileURLToPath(new URL("packages/py/src", root));
const pyCode = `
import importlib, json, sys
manifest = json.load(open(sys.argv[1]))
missing = []
for mod, fns in manifest["modules"].items():
    try:
        m = importlib.import_module("br_kit." + mod)
    except Exception as exc:  # noqa: BLE001
        missing.append(f"PY module {mod} failed to import: {exc}")
        continue
    for fn in fns:
        if not callable(getattr(m, fn["py"], None)):
            missing.append(f"PY {mod}.{fn['py']} missing")
print(json.dumps(missing))
`;
const python = process.env.PYTHON ?? "python3";
try {
  const out = execFileSync(python, ["-c", pyCode, manifestPath], {
    env: { ...process.env, PYTHONPATH: pySrc },
    encoding: "utf8",
  });
  for (const f of JSON.parse(out || "[]")) failures.push(f);
} catch (error) {
  failures.push(`Python parity check failed to run (${python}): ${error.message}`);
}

const modules = Object.keys(manifest.modules).length;
const total = Object.values(manifest.modules).reduce((sum, fns) => sum + fns.length, 0);

if (failures.length) {
  console.error(`✗ parity FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ parity OK — ${total} functions present in both TS and Python across ${modules} modules`);
