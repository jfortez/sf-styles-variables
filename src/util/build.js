const postcss = require('postcss')
const fs = require('node:fs')
const path = require('node:path')
const { OUTPUT, THEME } = require('./globals')
const parseVariables = require('./parseVariables')

// PostCSS plugins
const valueExtractor = require('postcss-extract-value')
const postcssImport = require('postcss-import')

const folderTemplate = path.resolve('styles')

const filterByProps = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  // 'box-shadow',
  // 'border',
  'border-left',
  'border-right',
  'border-top',
  'border-bottom'
  // 'background'
]
const templateVariableName = `sf-${THEME}-[propertyName]`

const folderExceptions = ['icons']

const pluginConfig = {
  templateVariableName,
  filterByProps
}

const parseCss = (cssPath, file, cssFile, fileGroup) => {
  const css = fs.readFileSync(cssPath, 'utf8')
  // process the file
  postcss()
    .use(postcssImport())
    .process(css, { from: cssPath })
    .then((importResult) => {
      if (importResult.css) {
        if (!folderExceptions.includes(file)) {
          postcss()
            .use(valueExtractor(pluginConfig))
            .process(importResult.css, { from: cssPath })
            .then((variablesResult) => {
              if (variablesResult.css) {
                if (fileGroup) {
                  // create the folder
                  fs.mkdirSync(path.resolve(OUTPUT, fileGroup), {
                    recursive: true
                  })
                  fs.mkdirSync(path.resolve(OUTPUT, fileGroup, file), {
                    recursive: true
                  })
                  // create the file
                  const css = `/* <== ${fileGroup}/${file}/${cssFile} ==> */\n${variablesResult.css}`

                  fs.writeFileSync(
                    path.resolve(OUTPUT, fileGroup, file, cssFile),
                    css
                  )
                } else {
                  // create the folder
                  fs.mkdirSync(path.resolve(OUTPUT, file), {
                    recursive: true
                  })
                  const css = `/* <== ${file}/${cssFile} ==> */\n${variablesResult.css}`
                  // create the file
                  fs.writeFileSync(path.resolve(OUTPUT, file, cssFile), css)
                }
              }
            })
        } else {
          fs.mkdirSync(path.resolve(OUTPUT, file), {
            recursive: true
          })
          // create the file
          const css = `/* <== ${file}/${cssFile} ==> */\n${importResult.css}`
          fs.writeFileSync(path.resolve(OUTPUT, file, cssFile), css)
        }
      }
    })
}

const output = path.resolve(OUTPUT)

fs.mkdirSync(output, { recursive: true })

// iterate over all files in the material folder
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

const mainFile = path.resolve(OUTPUT, 'main.css')
const mainCss = fs.readFileSync(mainFile, 'utf8')

parseVariables(mainCss, { from: mainFile }).then((result) => {
  const { globalCss, resultCss } = result
  const output = path.resolve(OUTPUT, 'variables.css')
  let imports = ''

  fs.writeFileSync(output, globalCss)

  imports += '@import "./variables.css";\n\n'

  Object.keys(resultCss).forEach((key) => {
    const file = path.resolve(OUTPUT, `${key}`)

    imports += `@import "./${key}";\n`

    fs.writeFileSync(file, resultCss[key])
  })
  // // create main file
  fs.writeFileSync(mainFile, imports)
})
