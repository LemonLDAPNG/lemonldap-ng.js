import fs from "node:fs";
import path from "node:path";

function listDts(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) res.push(...listDts(p));
    else if (e.name.endsWith(".d.ts")) res.push(p);
  }
  return res;
}

// Emit a `.d.mts` twin of every `.d.ts` with relative specifiers rewritten to
// `.mjs`, so that TypeScript (node16/nodenext/bundler) resolves types for ESM
// consumers.
export default function dmts({ dir = "lib" } = {}) {
  return {
    name: "dmts",
    writeBundle() {
      const root = path.resolve(dir);
      for (const file of listDts(root)) {
        const base = path.dirname(file);
        const rewrite = (spec) => {
          if (!/^\.{1,2}(\/|$)/.test(spec)) return spec;
          if (spec.endsWith(".mjs")) return spec;
          if (spec.endsWith(".js")) return spec.slice(0, -3) + ".mjs";
          const target = path.resolve(base, spec);
          if (
            !fs.existsSync(target + ".d.ts") &&
            fs.existsSync(path.join(target, "index.d.ts"))
          ) {
            return spec.replace(/\/$/, "") + "/index.mjs";
          }
          return spec + ".mjs";
        };
        const src = fs.readFileSync(file, "utf8");
        const out = src
          .replace(
            /(\bfrom\s*)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g,
            (_, a, q, s) => `${a}${q}${rewrite(s)}${q}`,
          )
          .replace(
            /(\bimport\s*\(\s*)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g,
            (_, a, q, s) => `${a}${q}${rewrite(s)}${q}`,
          );
        fs.writeFileSync(file.replace(/\.d\.ts$/, ".d.mts"), out);
      }
    },
  };
}
