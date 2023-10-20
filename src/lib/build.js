const postcss = require('postcss')
const fs = require('node:fs/promises')
const path = require('node:path')
const { OUTPUT, CSS_PROPERTIES, SUFFIX } = require('./globals')
const parseVariables = require('./parseVariables')

// PostCSS plugins
const valueExtractor = require('postcss-extract-value')
const postcssImport = require('postcss-import')

const folderTemplate = path.resolve('styles')

const output = path.resolve(OUTPUT)

const pluginConfig = {
  templateVariableName: `${SUFFIX}[number]`,
  filterByProps: CSS_PROPERTIES,
  onlyColor: true
}

const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase()
  })
}

const exist = async (path) => {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    return false
  }
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
  } else {
    const [, rootVariables] = css?.match(/:root\s*{([\s\S]*?)}/s) || []
    if (!rootVariables) return css
    const tail = path.at(-1).replace('.css', '')
    const keyWord = tail === 'all' ? path.join('-').replace('.css', '') : tail
    const fileName = kebabToCamel(keyWord)
    const newSuffix = `--${SUFFIX}-${fileName}`
    const regex = new RegExp(`--${SUFFIX}`, 'g')
    css = css.replace(regex, newSuffix)
  }

  return css
}

const parseCss = (cssPath) => {
  return new Promise((resolve) => {
    fs.readFile(cssPath, 'utf8').then((css) => {
      // process the file
      postcss()
        .use(postcssImport())
        .process(css, { from: cssPath })
        .then((importResult) => {
          postcss()
            .use(valueExtractor(pluginConfig))
            .process(importResult.css, { from: cssPath })
            .then((variablesResult) => {
              resolve(variablesResult)
            })
        })
    })
  })
}

const buildFiles = async ({ onlyGlobalFolder }) => {
  console.log('Building CSS files...')

  let mainImports = ''

  await fs.mkdir(output, { recursive: true })

  const folders = await fs.readdir(folderTemplate)

  await Promise.all(
    folders.map(async (file) => {
      const filePath = path.resolve(folderTemplate, file)

      if (!filePath.includes('.css')) {
        const componentFolders = await fs.readdir(filePath)

        await Promise.all(
          componentFolders.map(async (component) => {
            const componentPath = path.resolve(filePath, component)
            await fs.mkdir(path.resolve(OUTPUT, file), {
              recursive: true
            })

            if (!componentPath.includes('.css')) {
              if (!onlyGlobalFolder) {
                const styles = await fs.readdir(componentPath)
                await Promise.all(
                  styles.map(async (cssFile) => {
                    const cssPath = path.resolve(componentPath, cssFile)
                    if (cssPath.includes('.css')) {
                      const result = await parseCss(cssPath)
                      await fs.mkdir(path.resolve(OUTPUT, file, component), {
                        recursive: true
                      })
                      const route = [file, component, cssFile]
                      const css = getCss(result, route)
                      await fs.writeFile(
                        path.resolve(OUTPUT, file, component, cssFile),
                        css
                      )
                    }
                  })
                )
              }
            } else {
              const result = await parseCss(componentPath)
              const route = [file, component]
              const css = getCss(result, route)
              if (onlyGlobalFolder) {
                mainImports += `@import "./${file}/${component}";\n`
              }
              await fs.writeFile(path.resolve(OUTPUT, file, component), css)
            }
          })
        )
      } else {
        if (
          (filePath.includes('index.css') || filePath.includes('main.css')) &&
          !onlyGlobalFolder
        ) {
          await fs.copyFile(filePath, path.resolve(OUTPUT, file))
        }
      }
    })
  )

  if (onlyGlobalFolder) {
    await fs.writeFile(path.resolve(output, 'main.css'), mainImports)
  }
}

const buildVariables = async () => {
  const mainFile = path.resolve(OUTPUT, 'main.css')
  const mainCss = await fs.readFile(mainFile, 'utf8')
  console.log('Parsing CSS variables...')
  const { globalCss, resultCss } = await parseVariables(mainCss, {
    from: mainFile
  })

  const output = path.resolve(OUTPUT, 'variables.css')

  await fs.writeFile(output, globalCss)

  Object.keys(resultCss).forEach(async (key) => {
    const file = path.resolve(OUTPUT, `${key}`)
    await fs.writeFile(file, resultCss[key])
  })
  // rewrite main file
  const imports = `@import "./variables.css";\n\n${mainCss}`
  await fs.writeFile(mainFile, imports)
  console.log('Building CSS files... Done!')
}

const build = async ({
  onlyGlobalFolder,
  includeGlobalVariables = true
} = {}) => {
  if (await exist(output)) {
    await fs.rmdir(output, { recursive: true })
  }

  await buildFiles({ onlyGlobalFolder })

  if (includeGlobalVariables) {
    await buildVariables()
  }
}

module.exports = build
