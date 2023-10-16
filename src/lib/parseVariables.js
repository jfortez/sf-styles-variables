const fs = require('fs')
const path = require('path')
const Color = require('color')

const postcss = require('postcss')
const postcssImport = require('postcss-import')
const { THEME } = require('./globals')
const { isColor, order, lookUp } = require('./colorUtil')

const sortStrategy = (a, b) => {
  if (THEME === 'material') {
    const { index: indexA, scheme: schemeA } = a
    const { index: indexB, scheme: schemeB } = b

    if (schemeA < schemeB) return -1
    if (schemeA > schemeB) return 1

    if (indexA < indexB) return -1
    if (indexA > indexB) return 1
  } else {
    return b.color.hue() - a.color.hue()
  }
}

const getValue = (str) => {
  const value = isColor(str) ? Color(str).rgb().string() : str
  return value
}

function transformVariables(variables) {
  const uniqueVariables = {}
  const variableMap = new Map()
  const defaultSuffix = `global-${THEME}`

  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]

    for (const variable in sourceVariables) {
      const value = getValue(sourceVariables[variable])

      if (!variableMap.get(value)) {
        const number = variableMap.size + 1

        const newVariable = `var-${number}`
        variableMap.set(value, newVariable)
        uniqueVariables[newVariable] = value
      }
    }
  }

  const colors = []

  Object.keys(uniqueVariables).forEach((key) => {
    const value = uniqueVariables[key].trim()
    const color = Color(value)
    let scheme
    let index
    if (THEME === 'material') {
      const v = color.rgb().string()
      const schemes = Object.keys(order)
      for (let i = 0; i < schemes.length; i++) {
        const key = schemes[i]
        const c = order[key]

        if (c.includes(v)) {
          scheme = key
          index = c.indexOf(v)
          break
        }
      }
    }

    colors.push({
      key,
      value,
      scheme,
      index,
      color
    })
  })

  variableMap.clear()

  const newVariables = colors
    .sort(sortStrategy)
    .reduce((acc, current, index) => {
      // to object
      const newKey = `--${defaultSuffix}-${index + 1}`
      const scheme = lookUp[current.scheme]

      if (THEME === 'material') {
        if (!acc[scheme]) {
          acc[scheme] = {}
        }
        acc[scheme][newKey] = current.value
      } else {
        acc[newKey] = current.value
      }
      // acc[newKey] = current.value
      variableMap.set(current.value, newKey)

      return acc
    }, {})

  const replacedVariables = {}

  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]
    replacedVariables[sourceFile] = {}

    for (const variable in sourceVariables) {
      const value = getValue(sourceVariables[variable])
      const newVariable = variableMap.get(value)
      replacedVariables[sourceFile][variable] = `var(${newVariable})`
    }
  }

  return {
    newVariables,
    replacedVariables
  }
}

const getLine = (key, value) => `  ${key}: ${value};`

function toRootVariables(obj, setComments) {
  const fn = ([variable, value]) => {
    if (setComments) {
      const v = `  /* ${variable} */\n${toRootVariables(value)}`
      return v
    }
    return getLine(variable, value)
  }

  return Object.entries(obj).map(fn).join('\n')
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

        const globalToRootVariables = toRootVariables(
          newVariables,
          THEME === 'material'
        )

        const globalCss = `:root {\n${globalToRootVariables}\n}`

        resolve({
          globalCss,
          resultCss
        })
      })
  })
}

module.exports = parseVariables
