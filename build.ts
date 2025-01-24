import esbuild from "esbuild";
import CleanCSS from "clean-css";
import {
  copyFileSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  accessSync,
  mkdirSync,
} from "node:fs";
import path from "node:path";
import { CHARS_LOWAL, generateRandomString } from "./src/util";

const APP_NAME = "Funny game";

const build = generateRandomString(10, CHARS_LOWAL);
const outDir = "dist";
const scriptFile = `bundle.${build}.js`;
const cssFile = `style.${build}.css`;
// const outfile = path.join(outDir, scriptFile);

const buildFile = `./BUILD`;
const oldBuild = readFileSync(buildFile, "utf-8");
const newBuild = String(Number(oldBuild) + 1);

const fileExists = (file: string) => {
  try {
    accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
};

const clean = async () => {
  console.log(`Cleaning ${outDir}`);

  const files = readdirSync(outDir);

  for (const file of files) {
    console.log(`Removing ${file}`);
    unlinkSync(path.join(outDir, file));
  }
};

const transformAndCopyHtml = (js: string, css: string) => {
  let html = readFileSync("src/index.html", "utf-8");

  // console.log(`Copying ${cssFile} to ${outDir}`);
  // copyFileSync("src/style.css", path.join(outDir, cssFile));

  const replacements = {
    $SCRIPT_FILE: scriptFile,
    $STYLE_FILE: cssFile,
    $SCRIPT: `<script>${js}</script>`,
    $STYLE: `<style>${css}</style>`,
    $TITLE: APP_NAME,
    $NOTE: `${APP_NAME} - Build ${newBuild} ${build} - ${new Date().toISOString()}`,
  };

  console.log("Transforming index.html");

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(key, value);
  }

  console.log(`Writing index.html to ${outDir}`);
  writeFileSync(path.join(outDir, "index.html"), html, {
    encoding: "utf-8",
  });
};

const buildCode = async () => {
  const buildResult = await esbuild.build({
    entryPoints: ["src/index.ts"],
    // outfile,
    write: false,
    bundle: true,
    minify: true,
    platform: "browser",
    target: "esnext",
    format: "cjs",
    // sourcemap: true,
    sourcemap: false,
    tsconfig: "./tsconfig.json",
    define: {
      "process.env.ENV": '"development"',
    },
  });

  return buildResult.outputFiles[0].text;
};

const minifyCss = () => {
  const css = readFileSync("src/style.css", "utf-8");
  const minified = new CleanCSS().minify(css).styles;
  return minified;
};

const writeBuild = () => {
  writeFileSync(buildFile, newBuild, {
    encoding: "utf-8",
    flag: "w",
  });
};

const run = async () => {
  if (!fileExists(outDir)) {
    console.log("Creating output directory");
    mkdirSync(outDir);
  }

  console.log("Cleaning...");
  clean();

  console.log("Building bundle...");

  const js = await buildCode();
  const css = minifyCss();

  transformAndCopyHtml(js, css);

  writeBuild();
};

run()
  .then(() => {
    console.log("Build successful");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
