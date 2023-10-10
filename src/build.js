const postcss = require("postcss");
const fs = require("node:fs");
const path = require("node:path");

// PostCSS plugins
const valueExtractor = require("postcss-extract-value");
const postcssImport = require("postcss-import");

const THEME_NAME = "material";
const OUTPUT_FOLDER = "build";

const folderTemplate = path.resolve("styles");

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
const templateVariableName = `sf-${THEME_NAME}-[propertyName]`;

const pluginConfig = {
  templateVariableName,
  filterByProps,
};

const parseCss = (cssPath, file, cssFile, fileGroup) => {
  const css = fs.readFileSync(cssPath, "utf8");
  // process the file
  postcss()
    .use(postcssImport())
    .process(css, { from: cssPath })
    .then((result) => {
      if (result.css) {
        postcss()
          .use(valueExtractor(pluginConfig))
          .process(result.css, { from: cssPath })
          .then((resultCss) => {
            if (resultCss.css) {
              if (fileGroup) {
                // create the folder
                fs.mkdirSync(path.resolve(OUTPUT_FOLDER, fileGroup), { recursive: true });
                fs.mkdirSync(path.resolve(OUTPUT_FOLDER, fileGroup, file), {
                  recursive: true,
                });
                // create the file
                fs.writeFileSync(
                  path.resolve(OUTPUT_FOLDER, fileGroup, file, cssFile),
                  resultCss.css
                );
              } else {
                // create the folder
                fs.mkdirSync(path.resolve(OUTPUT_FOLDER, file), { recursive: true });
                // create the file
                fs.writeFileSync(path.resolve(OUTPUT_FOLDER, file, cssFile), resultCss.css);
              }
            }
          });
      }
    });
};

const output = path.resolve(OUTPUT_FOLDER);
fs.mkdirSync(output, { recursive: true });
// iterate over all files in the material folder
fs.readdirSync(folderTemplate).forEach((file) => {
  // get the file path
  const filePath = path.resolve(folderTemplate, file);

  if (!filePath.includes(".css")) {
    // read all files in the folder
    fs.readdirSync(filePath).forEach((component) => {
      const componentPath = path.resolve(filePath, component);
      if (!componentPath.includes(".css")) {
        // read all files in the folder
        fs.readdirSync(componentPath).forEach((cssFile) => {
          const cssPath = path.resolve(componentPath, cssFile);
          if (cssPath.includes(".css")) {
            parseCss(cssPath, component, cssFile, file);
          }
        });
      } else {
        parseCss(componentPath, file, component);
      }
    });
  } else {
    if (filePath.includes("index.css") || filePath.includes("main.css")) {
      fs.copyFileSync(filePath, path.resolve(OUTPUT_FOLDER, file));
    }
  }
});
