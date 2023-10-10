let postcss = require("postcss");
const fs = require("node:fs");
const path = require("node:path");
const valueExtractor = require("postcss-extract-value");

const THEME_NAME = "material";
const OUTPUT_FOLDER = "build";

const materialFolder = path.resolve(__dirname, `./css/${THEME_NAME}`);

const filterByProps = [
  "color",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "background",
];
const templateVariableName = "sf-material-[propertyName]";

const pluginConfig = {
  templateVariableName,
  filterByProps,
};

// iterate over all files in the material folder
fs.readdirSync(materialFolder).forEach((file) => {
  // get the file path
  const filePath = path.resolve(materialFolder, file);

  if (!filePath.includes("main.css")) {
    // read all files in the folder
    fs.readdirSync(filePath).forEach((cssFile) => {
      const cssPath = path.resolve(filePath, cssFile);
      const css = fs.readFileSync(cssPath, "utf8");
      // process the file
      postcss()
        .use(valueExtractor(pluginConfig))
        .process(css, { from: cssPath })
        .then((result) => {
          if (result.css) {
            // create the folder
            fs.mkdirSync(path.resolve(OUTPUT_FOLDER, file), { recursive: true });
            // create the file
            fs.writeFileSync(path.resolve(OUTPUT_FOLDER, file, cssFile), result.css);
          }
        });
    });
  } else {
    fs.copyFileSync(filePath, path.resolve(OUTPUT_FOLDER, file));
  }
});

// how to use the plugin
// postcss()
//   .use(valueExtractor(pluginConfig))
//   .process(materialCss, { from: cssFilePath, to: outputFilePath })
//   .then((result) => console.log(result));
