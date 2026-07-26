import fs from "node:fs";
import path from "node:path";

// Drop-in replacement for the unmaintained `rollup-plugin-cleaner`, which
// pulled in rimraf@2 (and its vulnerable glob/minimatch chain).
export default function cleaner({ targets = [], silent = true } = {}) {
  return {
    name: "cleaner",
    buildStart() {
      for (const targetPath of targets) {
        const normalisedPath = path.normalize(targetPath);
        if (fs.existsSync(normalisedPath)) {
          if (!silent) {
            console.log(`cleaning path: ${normalisedPath}`);
          }
          fs.rmSync(normalisedPath, { recursive: true, force: true });
        }
      }
    },
  };
}
