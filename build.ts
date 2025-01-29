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
  statSync,
} from "node:fs";
import path from "node:path";
import { generateRandomString, CHARS_LOWAL } from "./src/util/util";

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

// Build cache files
const buildMetadataDir = ".build_metadata";
const imagesBuildMetadataFile = path.join(buildMetadataDir, "images.json");
const imagesBuildDataFile = path.join(buildMetadataDir, "images.txt");

if (!fileExists(buildMetadataDir)) {
  mkdirSync(buildMetadataDir);
}

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
  const imageBuffer = readFileSync(path);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = "image/png"; // Adjust if necessary
  return `<img id="${imageId}" src="data:${mimeType};base64,${base64Image}" alt="Image">`;
};

const buildInlineImages = (): string => {
  const imagePaths = readdirSync(imgDir);

  const oldMetadata: Record<string, ImageMetadata> = fileExists(
    imagesBuildMetadataFile
  )
    ? JSON.parse(readFileSync(imagesBuildMetadataFile, "utf-8"))
    : {};

  type ImageMetadata = {
    name: string;
    mtimeMs: number;
  };

  const canUseCache = !imagePaths.some((image) => {
    const fullPath = `${imgDir}/${image}`;
    const { mtimeMs } = statSync(fullPath);
    return oldMetadata[image] ? oldMetadata[image].mtimeMs !== mtimeMs : true;
  });

  if (canUseCache && fileExists(imagesBuildDataFile)) {
    console.log("Using cached images");
    return readFileSync(imagesBuildDataFile, "utf-8");
  }

  const newMetadata: Record<string, ImageMetadata> = {};
  const images: string[] = [];
  for (const image of imagePaths) {
    const fullPath = `${imgDir}/${image}`;
    console.log("Building inline image", fullPath);

    const { mtimeMs } = statSync(fullPath);

    const inlineImage = buildImage(fullPath);

    if (!inlineImage)
      throw new Error(`Failed to build or load cached image ${image}`);

    newMetadata[image] = {
      name: image,
      mtimeMs,
    };

    images.push(inlineImage);
  }

  const imageString = images.join("\n");

  // Write cache

  writeFileSync(imagesBuildMetadataFile, JSON.stringify(newMetadata), {
    encoding: "utf-8",
  });

  writeFileSync(imagesBuildDataFile, imageString, {
    encoding: "utf-8",
  });

  return imageString;
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
