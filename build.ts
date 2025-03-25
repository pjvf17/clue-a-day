// Import esbuild from its Deno port. 
// (Make sure to check for the latest version on https://deno.land/x/esbuild)
import * as esbuild from "https://deno.land/x/esbuild@v0.17.19/mod.js";

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: false,
};

const watchMode = Deno.args.includes("--watch");

async function buildAll() {
  // Optionally, you could build a CommonJS version as well:
  // const cjsContext = await esbuild.context({
  //   ...sharedConfig,
  //   platform: 'node', // for CJS
  //   outfile: "dist/index.cjs.js",
  // });

  const esmContext = await esbuild.context({
    ...sharedConfig,
    platform: "neutral", // for ESM
    format: "esm",
    outfile: "dist/clue.js",
  });

  if (watchMode) {
    // await cjsContext.watch();
    await esmContext.watch();
    console.log("👀 Watching for changes...");
  } else {
    // await cjsContext.rebuild();
    await esmContext.rebuild();
    // await cjsContext.dispose();
    await esmContext.dispose();
    console.log("✅ Build complete");
  }
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  Deno.exit(1);
});
