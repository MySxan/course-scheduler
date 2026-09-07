import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";

// esbuild is supplied by the existing Vite toolchain; no browser or test framework required.
const output = new URL(
  "../node_modules/.cache/style-tests.cjs",
  import.meta.url,
);
await mkdir(new URL("../node_modules/.cache/", import.meta.url), {
  recursive: true,
});
try {
  await build({
    entryPoints: ["tests/style.test.tsx"],
    outfile: output.pathname,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
  });
  const result = spawnSync(process.execPath, ["--test", output.pathname], {
    stdio: "inherit",
  });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(output, { force: true });
}
