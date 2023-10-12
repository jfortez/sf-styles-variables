const fs = require('fs')
const path = require('path')

const postcss = require('postcss')
const postcssImport = require('postcss-import')
const { SUFFIX } = require('./globals')

const getNumeration = (obj, value) => {
  let num = 1

  // get last number by unique keyword
  const store = Object.keys(obj)
  if (store.length > 0) {
    const current = store
      .map((key) => key.split('--')[1])
      .filter((i) => i.split(/-[0-9]+$/)[0] === value)
    if (current.length > 0) {
      const lastKey = current.at(-1).split('-').at(-1)
      if (lastKey) {
        num = parseInt(lastKey) + 1
      }
    }
  }

  return num
}

function transformVariables(variables) {
  const newVariables = {}
  const variableMap = new Map()

  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]

    for (const variable in sourceVariables) {
      const value = sourceVariables[variable]
      const variableName = variable
        .replace(`--${SUFFIX}-`, '')
        .replace(/-[0-9]+$/, '')

      const num = getNumeration(newVariables, variableName)

      const newVariable = `--${variableName}-${num}`
      variableMap.set(value, newVariable)
      newVariables[newVariable] = value
    }
  }

  const replacedVariables = {}
  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]
    replacedVariables[sourceFile] = {}

    for (const variable in sourceVariables) {
      const value = sourceVariables[variable]
      const newVariable = variableMap.get(value)
      replacedVariables[sourceFile][variable] = `var(${newVariable})`
    }
  }

  Object.keys(newVariables)
    .sort((a, b) => {
      const propertyRegex = /--(.*?)(?=-\d+)/g
      const propertyA = a.match(propertyRegex)[0].replace(/--/g, '')
      const propertyB = b.match(propertyRegex)[0].replace(/--/g, '')

      const numberRegex = a.match(/-\d+$/g)[0]
      const numberA = parseInt(numberRegex.replace(/-/g, ''))
      const numberB = parseInt(numberRegex.replace(/-/g, ''))

      // order alphabetically by CSSProperty and sort ascending by number
      if (propertyA < propertyB) return -1
      if (propertyA > propertyB) return 1
      if (numberA < numberB) return -1
      if (numberA > numberB) return 1
      return 0
    })
    .forEach((key) => {
      const value = newVariables[key]
      delete newVariables[key]
      newVariables[key] = value
    })

  return {
    newVariables,
    replacedVariables
  }
}
function toRootVariables(obj) {
  return Object.entries(obj)
    .map(([variable, value]) => `  ${variable}: ${value};`)
    .join('\n')
}

/**
 *
 * @param {string} cssContent
 * @param {postcss.ProcessOptions} processOptions
 * @returns {Promise<{globalCss:string,resultCss:Record<string,string>}>}
 */
const parseVariables = (cssContent, processOptions) => {
  return new Promise((resolve) => {
    postcss()
      .use(postcssImport())
      .process(cssContent, processOptions)
      .then((result) => {
        const { css, messages } = result
        const files = messages
          .filter((i) => i.type === 'dependency')
          .map((i) => i.file)

        const regex = /\/\*\s<==\s(.+?)\s==>\s\s*\*\/\s:root\s*\{([\s\S]*?)\}/g
        const input = css.match(regex)

        const variables = {}

        for (let i = 0; i < input.length; i++) {
          const [, variableName] = input[i].match(
            /\/\*\s<==\s(.*?)\s==>\s\*\//s
          )

          const [, rootVariables] = input[i].match(/:root\s*{([\s\S]*?)}/s)
          // eliminar comentarios
          const values = rootVariables.replace(/\/\*[\s\S]*?\*\//g, '')

          const regex = /--[^:\s]+:/g

          const inputVariables = {}
          values
            .trim()
            .split('\n')
            .forEach((line) => {
              const [key] = line.match(regex)
              const value = String(line)
                .replace(regex, '')
                .trim()
                .replace(/;$/, '')

              inputVariables[`${key.replace(/:$/, '')}`] = value
            })
          variables[variableName] = inputVariables
        }

        const { newVariables, replacedVariables } =
          transformVariables(variables)
        const keys = Object.keys(replacedVariables)

        const resultCss = {}

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const file = files.find((i) => i.includes(key.split('/').at(-1)))
          const variablesToReplace = replacedVariables[key]
          if (file) {
            const filePath = path.resolve(file)
            const css = fs.readFileSync(filePath, 'utf8')

            const rootVariableContent = toRootVariables(variablesToReplace)

            const regex = /:root\s*{([\s\S]*?)}/g
            let newCss = css

            if (Object.keys(variablesToReplace).length > 0) {
              newCss = css.replace(regex, `:root {\n${rootVariableContent}\n}`)
            }

            resultCss[key] = newCss
          }
        }

        const globalToRootVariables = toRootVariables(newVariables)

        const globalCss = `:root {\n${globalToRootVariables}\n}`

        resolve({
          globalCss,
          resultCss
        })
      })
  })
}

module.exports = parseVariables
