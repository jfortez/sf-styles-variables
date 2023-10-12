const fs = require('fs')
const path = require('path')

const postcss = require('postcss')
const postcssImport = require('postcss-import')
const { THEME } = require('./globals')
const Color = require('color')

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

// const regex = /--(.*?):(.*?);/g
// const root = []
// let match
// while ((match = regex.exec(cssVariables))) {
//   const [, key, v] = match
//   const value = v.trim()
//   const obj = {
//     name: key,
//     value
//   }
//   root.push(obj)
// }

// function step(c, repetitions = 1) {
//   const [r, g, b] = c.color
//   const lum = Math.sqrt(0.241 * r + 0.691 * g + 0.068 * b)
//   const [h, , v] = Color(c).hsv().color
//   const h2 = Math.floor(h * repetitions)
//   const lum2 = Math.floor(lum * repetitions)
//   const v2 = Math.floor(v * repetitions)
//   return [h2, lum2, v2]
// }

// root.sort((a, b) => {
//   // const [h1, lum1, v1] = step(a.value, 0.8)
//   // const [h2, lum2, v2] = step(b.value, 0.8)

//   // return h1 - h2 || lum1 - lum2 || v1 - v2
//   // ordenar por paleta de colores
//   return Color(b.value).hue() - Color(a.value).hue()
// })

const sortStrategy = (a, b) => {
  // sort strategy
  return b.color.hue() - a.color.hue()
}
function transformVariables(variables) {
  const uniqueVariables = {}
  const variableMap = new Map()
  const defaultSuffix = `global-${THEME}`

  for (const sourceFile in variables) {
    const sourceVariables = variables[sourceFile]

    for (const variable in sourceVariables) {
      const value = sourceVariables[variable]
      if (!variableMap.has(value)) {
        const variableName = defaultSuffix

        const num = getNumeration(uniqueVariables, variableName)

        const newVariable = `--${variableName}-${num}`
        variableMap.set(value, newVariable)
        uniqueVariables[newVariable] = value
      }
    }
  }

  const colors = []

  Object.keys(uniqueVariables).forEach((key) => {
    const value = uniqueVariables[key].trim()
    const color = Color(value)
    colors.push({
      key,
      value,
      color
    })
  })

  variableMap.clear()

  const newVariables = colors
    .sort(sortStrategy)
    .reduce((acc, current, index) => {
      // to object
      const newKey = `--${defaultSuffix}-${index + 1}`
      acc[newKey] = current.value
      variableMap.set(current.value, newKey)

      return acc
    }, {})

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
