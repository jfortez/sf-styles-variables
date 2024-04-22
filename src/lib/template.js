const fs = require('node:fs')

const path = require('node:path')

const { FOLDER_TEMPLATE, THEME } = require('./globals')

const syncfusionPath = path.resolve('node_modules/@syncfusion')

const exclude = ['animation', 'common', 'definition', 'offline-theme']

const ROOT = path.resolve(FOLDER_TEMPLATE)

const getPaths = () => {
  const styles = {}

  // main should be all the css folders import in order
  let mainImports = ''

  // node_modules/@syncfusion
  fs.readdirSync(syncfusionPath).forEach((component) => {
    const folderPath = path.resolve(syncfusionPath, component)
    // node_modules/@syncfusion/ej2-[component]
    fs.readdirSync(folderPath).forEach((file) => {
      if (file === 'styles' || file === 'style') {
        // node_modules/@syncfusion/ej2-[component]/styles
        const styleFolderPath = path.resolve(folderPath, file)
        const [, COMPONENT_NAME] = folderPath.split('ej2-') || []
        styles[COMPONENT_NAME] = {}

        const componentFolder = path.resolve(ROOT, COMPONENT_NAME)

        if (COMPONENT_NAME === 'base' || COMPONENT_NAME === 'icons') {
          const file = path.resolve(
            ROOT,
            COMPONENT_NAME,
            `${COMPONENT_NAME}.css`
          )

          const shouldAppend = !fs.existsSync(file)

          if (shouldAppend) {
            const packageStyle = path.resolve(styleFolderPath, `${THEME}.css`)
            const folderStyle = path.resolve(ROOT, COMPONENT_NAME)

            const relativePath = path
              .relative(folderStyle, packageStyle)
              .replace(/\\/g, '/')

            const css = `@import "${relativePath}";\n`
            styles[COMPONENT_NAME][`${COMPONENT_NAME}.css`] = css

            // const css = `/* <== ${COMPONENT_NAME}/${COMPONENT_NAME}.css ==> */\n@import "${relativePath}";\n`

            const importCss = `@import "./${COMPONENT_NAME}/${COMPONENT_NAME}.css";\n`
            mainImports += importCss
          }
        } else {
          const allCss = path.resolve(styleFolderPath, `${THEME}.css`)
          if (fs.existsSync(allCss)) {
            const relativeImport = path
              .relative(componentFolder, allCss)
              .replace(/\\/g, '/')
            const css = `@import "${relativeImport}";\n`
            // const all = path.resolve(componentFolder, 'all.css')

            styles[COMPONENT_NAME]['all.css'] = css
          }

          fs.readdirSync(styleFolderPath).forEach((styleFile) => {
            // node_modules/@syncfusion/ej2-[component]/styles/[styleFile | styleFolder]
            const isFolder = !styleFile.match(/\.[a-z]+$/i)
            if (isFolder && !exclude.includes(styleFile)) {
              const folderStyle = path.resolve(componentFolder, styleFile)

              const packageStyle = path.resolve(
                styleFolderPath,
                styleFile,
                `${THEME}.css`
              )
              const relativePath = path
                .relative(folderStyle, packageStyle)
                .replace(/\\/g, '/')

              const css = `@import "${relativePath}";\n`
              styles[COMPONENT_NAME][styleFile] = css

              // const css = `/* <== ${COMPONENT_NAME}/${styleFile}/${styleFile}.css ==> */\n@import "${relativePath}";\n`
              const importCss = `@import "./${COMPONENT_NAME}/${styleFile}/${styleFile}.css";\n`
              mainImports += importCss
            }
          })
        }
      }
    })
  })

  styles['main.css'] = mainImports

  return styles
}

module.exports = getPaths
