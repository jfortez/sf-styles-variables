const postcss = require('postcss')
const fs = require('node:fs/promises')
const ora = require('ora')
const path = require('node:path')
const { OUTPUT, CSS_PROPERTIES, SUFFIX } = require('./globals')
const parseVariables = require('./parseVariables')

// PostCSS plugins
const valueExtractor = require('postcss-extract-value')
const postcssImport = require('postcss-import')

// const folderTemplate = path.resolve('styles')

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

const buildFiles = async ({ onlyGlobalFolder, paths }) => {
  const spinner = ora('Building CSS Files').start()

  let mainImports = ''

  const folders = Object.keys(paths).filter((path) => !path.includes('react'))

  await fs.mkdir(output, { recursive: true })

  await Promise.all(
    folders.map(async (folder) => {
      const folderContent = paths[folder]
      if (typeof folderContent !== 'string') {
        await fs.mkdir(path.resolve(OUTPUT, folder), {
          recursive: true
        })
        const allFiles = ['all', 'icons', 'base']
        const subFolders = Object.keys(folderContent).filter((subFolder) => {
          return onlyGlobalFolder
            ? allFiles.includes(subFolder)
            : subFolder !== 'all'
        })

        await Promise.all(
          subFolders.map(async (subFolder) => {
            const subFolderContent = folderContent[subFolder]

            const from = `${folder}/${subFolder}`
            const { css: importCss } = await postcss()
              .use(postcssImport())
              .process(subFolderContent, { from })
            const { css: result } = await postcss()
              .use(valueExtractor(pluginConfig))
              .process(importCss, { from })
            const cssFile = `${subFolder}.css`
            const route = [folder, cssFile]
            const css = getCss(result, route)
            await fs.writeFile(path.resolve(OUTPUT, folder, cssFile), css)
            mainImports += `@import './${from}.css';\n`
          })
        )
      }
    })
  )
  await fs.writeFile(path.resolve(output, 'main.css'), mainImports)

  spinner.stop()
}

const buildVariables = async () => {
  const mainFile = path.resolve(OUTPUT, 'main.css')
  const mainCss = await fs.readFile(mainFile, 'utf8')
  const spinner = ora('Parsing CSS Variables').start()

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
  spinner.stop()
}

const build = async ({
  onlyGlobalFolder,
  includeGlobalVariables = true,
  paths
} = {}) => {
  if (await exist(output)) {
    await fs.rmdir(output, { recursive: true })
  }

  await buildFiles({ onlyGlobalFolder, paths })

  if (includeGlobalVariables) {
    await buildVariables()
  }
}

module.exports = build
