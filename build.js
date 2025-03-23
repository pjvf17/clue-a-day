const esbuild = require("esbuild");
const { dependencies, peerDependencies } = require('./package.json');

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies || {}).concat(Object.keys(peerDependencies || {})),
};

const watchMode = process.argv.includes('--watch');

async function buildAll() {
  const cjsContext = await esbuild.context({
    ...sharedConfig,
    platform: 'node', // for CJS
    outfile: "dist/index.js",
  });

  const esmContext = await esbuild.context({
    ...sharedConfig,
    platform: 'neutral', // for ESM
    format: "esm",
    outfile: "dist/index.esm.js",
  });

  if (watchMode) {
    await cjsContext.watch();
    await esmContext.watch();
    console.log("👀 Watching for changes...");
  } else {
    await cjsContext.rebuild();
    await esmContext.rebuild();
    await cjsContext.dispose();
    await esmContext.dispose();
    console.log("✅ Build complete");
  }
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
