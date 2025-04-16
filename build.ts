import * as esbuild from "https://deno.land/x/esbuild@v0.17.19/mod.js";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { sassPlugin } from "npm:esbuild-sass-plugin";


// Load environment variables
const env = config();
const answer = env.ANSWER || "HELLO";

const sharedConfig = {
  entryPoints: ["src/clue.ts"],
};

// const watchMode = Deno.args.includes("--watch");
const watchMode = true;

async function buildAll() {
  const esmContext = await esbuild.context({
    entryPoints: ["src/clue.ts", "src/devHelper.ts"],
    plugins: [sassPlugin()],
    bundle: true,
    platform: "neutral",
    format: "esm",
    outdir: "demo",
    define: {
      "process.env.answer": JSON.stringify(answer),
      "__DEV__": JSON.stringify(true),
    },
  });

  // Production build context
  const esmContextMin = await esbuild.context({
    ...sharedConfig,
    platform: "neutral",
    format: "esm",
    outfile: "dist/clue.min.js",
    minify: true,
    define: {
      "__DEV__": JSON.stringify(false),
    },
  });

  if (watchMode) {
    await esmContext.watch();
    await esmContextMin.watch();
    console.log("👀 Watching for changes...");
  } else {
    await esmContext.rebuild();
    await esmContextMin.rebuild();
    await esmContext.dispose();
    await esmContextMin.dispose();
    console.log("✅ Build complete");
  }
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  Deno.exit(1);
});