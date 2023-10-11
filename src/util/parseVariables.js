const fs = require('fs')
const path = require('path')

const postcss = require('postcss')
const postcssImport = require('postcss-import')

function transformVariables(variables) {
  const newVariables = {}
  const variableMap = new Map()
  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]

    for (const variable in sourceVariables) {
      const value = sourceVariables[variable]

      if (!variableMap.has(value)) {
        const variableName = variable
          .replace('--sf-material--', '')
          .replace(/-[0-9]+$/, '')

        // get last size by variableName
        const newVariable = `--${variableName}-${variableMap.size + 1}`
        variableMap.set(value, newVariable)
        newVariables[newVariable] = value
      }
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

  // order variables by name

  Object.keys(newVariables)
    .sort()
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
        const regex = /\/\*\s<==\s(.*?)\s==>[\s\S]*?:root\s*{([\s\S]*?)}/g
        const input = css.match(regex)

        const variables = {}

        for (let i = 0; i < input.length; i++) {
          const [, variableName] = input[i].match(
            /\/\*\s<==\s(.*?)\s==>\s\*\//s
          )
          const [, rootVariables] = input[i].match(/:root\s*{([\s\S]*?)}/s)
          // eliminar comentarios
          const values = rootVariables.replace(/\/\*[\s\S]*?\*\//g, '')

          const inputVariables = {}
          values.split('\n').forEach((line) => {
            // TODO: fix bug when background property has a value with a url("..."), the result is incomplete.
            const match = line.match(/--([\w-]+):\s*([^;]+)/)
            console.log(line)
            if (match) {
              const [, name, value] = match
              inputVariables[`--${name}`] = value.trim()
            }
          })
          variables[variableName] = inputVariables
        }

        return
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
