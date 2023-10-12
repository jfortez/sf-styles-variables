const postcss = require('postcss')
const fs = require('node:fs')
const path = require('node:path')
const { OUTPUT, CSS_PROPERTIES, SUFFIX } = require('./globals')
const parseVariables = require('./parseVariables')

// PostCSS plugins
const valueExtractor = require('postcss-extract-value')
const postcssImport = require('postcss-import')

const folderTemplate = path.resolve('styles')

const output = path.resolve(OUTPUT)

const folderExceptions = ['icons']

const pluginConfig = {
  templateVariableName: `${SUFFIX}[number]`,
  filterByProps: CSS_PROPERTIES,
  onlyColor: true
}

/**
 *
 * @param {string} cssContent
 * @param {string[]} path
 */
const getCss = (cssContent, path) => {
  // create the file
  let css = `/* <== ${path.join('/')} ==> */\n${cssContent}`

  // detect if root is undefined or :root{}
  const regex = /:root\s*{\s*}\s*/
  const undefinedRoot = regex.test(css)

  if (undefinedRoot) {
    css = css.replace(regex, '')
  }
  return css
}

const parseCss = (cssPath, file, cssFile, fileGroup) => {
  const css = fs.readFileSync(cssPath, 'utf8')
  // process the file
  postcss()
    .use(postcssImport())
    .process(css, { from: cssPath })
    .then((importResult) => {
      if (!folderExceptions.includes(file)) {
        postcss()
          .use(valueExtractor(pluginConfig))
          .process(importResult.css, { from: cssPath })
          .then((variablesResult) => {
            if (fileGroup) {
              // create the folder
              fs.mkdirSync(path.resolve(OUTPUT, fileGroup), {
                recursive: true
              })
              fs.mkdirSync(path.resolve(OUTPUT, fileGroup, file), {
                recursive: true
              })
              // create the file
              const route = [fileGroup, file, cssFile]
              const css = getCss(variablesResult.css, route)

              fs.writeFileSync(
                path.resolve(OUTPUT, fileGroup, file, cssFile),
                css
              )
            } else {
              // create the folder
              fs.mkdirSync(path.resolve(OUTPUT, file), {
                recursive: true
              })
              const route = [file, cssFile]
              // const css = `/* <== ${file}/${cssFile} ==> */\n${variablesResult.css}`
              const css = getCss(variablesResult.css, route)
              // create the file
              fs.writeFileSync(path.resolve(OUTPUT, file, cssFile), css)
            }
          })
      } else {
        fs.mkdirSync(path.resolve(OUTPUT, file), {
          recursive: true
        })
        // create the file
        const route = [file, cssFile]
        const css = getCss(importResult.css, route)

        fs.writeFileSync(path.resolve(OUTPUT, file, cssFile), css)
      }
    })
}

const buildFiles = async () => {
  console.log('Building CSS files...')

  fs.mkdirSync(output, { recursive: true })

  fs.readdirSync(folderTemplate).forEach((file) => {
    // get the file path
    const filePath = path.resolve(folderTemplate, file)

    if (!filePath.includes('.css')) {
      // read all files in the folder
      fs.readdirSync(filePath).forEach((component) => {
        const componentPath = path.resolve(filePath, component)
        if (!componentPath.includes('.css')) {
          // read all files in the folder
          fs.readdirSync(componentPath).forEach((cssFile) => {
            const cssPath = path.resolve(componentPath, cssFile)
            if (cssPath.includes('.css')) {
              parseCss(cssPath, component, cssFile, file)
            }
          })
        } else {
          parseCss(componentPath, file, component)
        }
      })
    } else {
      if (filePath.includes('index.css') || filePath.includes('main.css')) {
        fs.copyFileSync(filePath, path.resolve(OUTPUT, file))
      }
    }
  })
}

const buildVariables = async () => {
  const mainFile = path.resolve(OUTPUT, 'main.css')
  const mainCss = fs.readFileSync(mainFile, 'utf8')

  console.log('Parsing CSS variables...')
  parseVariables(mainCss, { from: mainFile }).then((result) => {
    const { globalCss, resultCss } = result
    const output = path.resolve(OUTPUT, 'variables.css')

    fs.writeFileSync(output, globalCss)

    Object.keys(resultCss).forEach((key) => {
      const file = path.resolve(OUTPUT, `${key}`)
      fs.writeFileSync(file, resultCss[key])
    })
    // rewrite main file
    const imports = `@import "./variables.css";\n\n${mainCss}`
    fs.writeFileSync(mainFile, imports)
    console.log('Building CSS files... Done!')
  })
}

const build = async () => {
  // this for reset the output folder
  if (fs.existsSync(output)) {
    fs.rmSync(output, { recursive: true })
  }

  await buildFiles()
  await buildVariables()
}

module.exports = build
