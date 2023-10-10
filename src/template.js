const fs = require("node:fs");

const path = require("node:path");

const syncfusionPath = path.resolve("node_modules/@syncfusion");

const exclude = ["animation", "common", "definition", "offline-theme"];

const FOLDER_NAME = "styles";

const ROOT = FOLDER_NAME;

const THEME = "material";

fs.mkdirSync(ROOT, { recursive: true });

// node_modules/@syncfusion
fs.readdirSync(syncfusionPath).forEach((component) => {
  const folderPath = path.resolve(syncfusionPath, component);
  // node_modules/@syncfusion/ej2-[component]

  fs.readdirSync(folderPath).forEach((file) => {
    if (file === "styles" || file === "style") {
      // node_modules/@syncfusion/ej2-[component]/styles
      const styleFolderPath = path.resolve(folderPath, file);
      const [, COMPONENT_NAME] = folderPath.split("ej2-") || [];

      const componentFolder = path.resolve(ROOT, COMPONENT_NAME);

      fs.mkdirSync(componentFolder, { recursive: true });

      fs.readdirSync(styleFolderPath).forEach(async (styleFile) => {
        // node_modules/@syncfusion/ej2-[component]/styles/[styleFile | styleFolder]
        const isFolder = !styleFile.match(/\.[a-z]+$/i);
        if (isFolder) {
          if (!exclude.includes(styleFile)) {
            const folderStyle = path.resolve(ROOT, COMPONENT_NAME, styleFile);

            fs.mkdirSync(folderStyle, { recursive: true });

            const packageStyle = path.resolve(styleFolderPath, styleFile, `${THEME}.css`);
            const relativePath = path.relative(folderStyle, packageStyle).replace(/\\/g, "/");
            const cssFileName = path.resolve(ROOT, COMPONENT_NAME, styleFile, `${styleFile}.css`);
            const css = `@import "${relativePath}";\n`;

            if (cssFileName && css) {
              fs.appendFileSync(cssFileName, css);
            }
          }
        } else {
          const file = path.resolve(ROOT, COMPONENT_NAME, `${COMPONENT_NAME}.css`);

          const shouldAppend =
            !fs.existsSync(file) && (COMPONENT_NAME === "base" || COMPONENT_NAME === "icons");

          if (shouldAppend) {
            const packageStyle = path.resolve(styleFolderPath, `${THEME}.css`);
            const folderStyle = path.resolve(ROOT, COMPONENT_NAME);

            const relativePath = path.relative(folderStyle, packageStyle).replace(/\\/g, "/");
            const css = `@import "${relativePath}";\n`;

            fs.appendFileSync(file, css);
          }
        }
      });
    }
  });
});
