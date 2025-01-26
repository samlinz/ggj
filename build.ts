import esbuild from "esbuild";
import CleanCSS from "clean-css";
import {
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  accessSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import path from "node:path";
import { CHARS_LOWAL, generateRandomString } from "./src/util";

const APP_NAME = "Funny game";

const build = generateRandomString(10, CHARS_LOWAL);
const imgDir = "imgs";
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

const transformAndCopyHtml = (js: string, css: string, images: string) => {
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
    $IMAGES: images,
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

const buildImage = (path: string) => {
  const imageName = path.split("/").pop()!.split(".")[0];
  const imageId = `IMG_${imageName.toUpperCase()}`;
  //.replace(/[^A-Z]/g, "_")}`;
  const imageBuffer = readFileSync(path);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = "image/png"; // Adjust if necessary
  return `<img id="${imageId}" src="data:${mimeType};base64,${base64Image}" alt="Image">`;
};

const buildInlineImages = () => {
  const imagePaths = readdirSync(imgDir);
  console.log("Building inline images", imagePaths);
  const images = imagePaths.map((path) => buildImage(`${imgDir}/${path}`));
  return images.join("\n");
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
  const images = buildInlineImages();

  transformAndCopyHtml(js, css, images);

  writeBuild();

  // copy to root
  copyFileSync(path.join(outDir, "index.html"), "index.html");
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
