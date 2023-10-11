const fs = require('node:fs')

const path = require('node:path')

const { FOLDER_TEMPLATE, THEME } = require('./globals')

const syncfusionPath = path.resolve('node_modules/@syncfusion')

const exclude = ['animation', 'common', 'definition', 'offline-theme']

const ROOT = path.resolve(FOLDER_TEMPLATE)

const createTemplate = () => {
  console.log('Generating template...')

  if (fs.existsSync(ROOT)) {
    fs.rmSync(ROOT, { recursive: true })
  }
  fs.mkdirSync(ROOT, { recursive: true })

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

        const componentFolder = path.resolve(ROOT, COMPONENT_NAME)

        fs.mkdirSync(componentFolder, { recursive: true })

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
            // const css = `/* <== ${COMPONENT_NAME}/${COMPONENT_NAME}.css ==> */\n@import "${relativePath}";\n`

            const importCss = `@import "./${COMPONENT_NAME}/${COMPONENT_NAME}.css";\n`
            mainImports += importCss

            fs.appendFileSync(file, css)
          }
        } else {
          const allCss = path.resolve(styleFolderPath, `${THEME}.css`)
          if (fs.existsSync(allCss)) {
            const relativeImport = path
              .relative(componentFolder, allCss)
              .replace(/\\/g, '/')
            const css = `@import "${relativeImport}";\n`
            const all = path.resolve(componentFolder, 'all.css')

            fs.appendFileSync(all, css)
          }

          fs.readdirSync(styleFolderPath).forEach((styleFile) => {
            // node_modules/@syncfusion/ej2-[component]/styles/[styleFile | styleFolder]
            const isFolder = !styleFile.match(/\.[a-z]+$/i)
            if (isFolder && !exclude.includes(styleFile)) {
              const folderStyle = path.resolve(componentFolder, styleFile)
              fs.mkdirSync(folderStyle, { recursive: true })
              const packageStyle = path.resolve(
                styleFolderPath,
                styleFile,
                `${THEME}.css`
              )
              const relativePath = path
                .relative(folderStyle, packageStyle)
                .replace(/\\/g, '/')
              const cssFileName = path.resolve(
                ROOT,
                COMPONENT_NAME,
                styleFile,
                `${styleFile}.css`
              )
              const css = `@import "${relativePath}";\n`
              // const css = `/* <== ${COMPONENT_NAME}/${styleFile}/${styleFile}.css ==> */\n@import "${relativePath}";\n`
              const importCss = `@import "./${COMPONENT_NAME}/${styleFile}/${styleFile}.css";\n`
              mainImports += importCss
              fs.appendFileSync(cssFileName, css)
            }
          })
        }
      }
    })
  })

  const mainFile = path.resolve(ROOT, 'main.css')
  fs.writeFileSync(mainFile, mainImports)

  console.log('Template generated!')
}

module.exports = createTemplate
