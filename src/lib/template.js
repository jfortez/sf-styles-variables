const fs = require('node:fs')

const path = require('node:path')
const ora = require('ora')

const { FOLDER_TEMPLATE, THEME } = require('./globals')

const syncfusionPath = path.resolve('node_modules/@syncfusion')

const exclude = ['animation', 'common', 'definition', 'offline-theme']

const ROOT = path.resolve(FOLDER_TEMPLATE)

const getStylePkg = (path) =>
  path.split('node_modules\\').at(-1).replace(/\\/g, '/')

const getPaths = () => {
  const spinner = ora('Generating Files from @syncfusion MATERIAL').start()
  const styles = {}

  // main should be all the css folders import in order

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

        if (COMPONENT_NAME === 'base' || COMPONENT_NAME === 'icons') {
          const file = path.resolve(
            ROOT,
            COMPONENT_NAME,
            `${COMPONENT_NAME}.css`
          )

          const shouldAppend = !fs.existsSync(file)

          if (shouldAppend) {
            const packageStyle = path.resolve(styleFolderPath, `${THEME}.css`)

            const css = `@import "${getStylePkg(packageStyle)}";\n`

            styles[COMPONENT_NAME][COMPONENT_NAME] = css
          }
        } else {
          const allCss = path.resolve(styleFolderPath, `${THEME}.css`)

          if (fs.existsSync(allCss)) {
            const css = `@import "${getStylePkg(allCss)}";\n`

            styles[COMPONENT_NAME].all = css
          }

          fs.readdirSync(styleFolderPath).forEach((styleFile) => {
            // node_modules/@syncfusion/ej2-[component]/styles/[styleFile | styleFolder]
            const isFolder = !styleFile.match(/\.[a-z]+$/i)
            if (isFolder && !exclude.includes(styleFile)) {
              const packageStyle = path.resolve(
                styleFolderPath,
                styleFile,
                `${THEME}.css`
              )

              const css = `@import "${getStylePkg(packageStyle)}";\n`
              styles[COMPONENT_NAME][styleFile] = css
            }
          })
        }
      }
    })
  })

  spinner.stop()
  return styles
}

module.exports = getPaths
