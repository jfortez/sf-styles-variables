const fs = require('node:fs')
const path = require('node:path')
const { OUTPUT } = require('./globals')
const color = require('color')

const file = path.resolve(OUTPUT, 'variables.css')
const output = path.resolve(OUTPUT, 'output.css')

const colors = {
  red: [
    'rgb(255, 0, 4)',
    'rgb(209, 52, 56)',
    'rgb(255, 0, 0)',
    'rgb(198, 40, 40)',
    'rgb(221, 44, 44)',
    'rgba(255, 85, 85, 0.2)'
  ],
  primary: [
    'rgb(252, 231, 233)',
    'rgb(252, 219, 228)',
    'rgb(243, 216, 218)',
    'rgb(255, 205, 210)',
    'rgb(241, 126, 184)',
    'rgb(236, 97, 143)',
    'rgb(239, 87, 138)',
    'rgb(239, 91, 141)',
    'rgb(234, 78, 130)',
    'rgb(237, 73, 128)',
    'rgb(234, 36, 102)',
    'rgb(236, 54, 115)',
    'rgb(230, 50, 111)',
    'rgb(255, 64, 129)',
    'rgb(227, 22, 91)',
    'rgb(181, 17, 72)',
    'rgb(157, 15, 63)',
    'rgb(208, 20, 84)',
    'rgb(171, 17, 69)',
    'rgba(227, 22, 91, 0.8)',
    'rgba(227, 22, 91, 0.7)',
    'rgba(227, 22, 91, 0.6)',
    'rgba(227, 22, 91, 0.5)',
    'rgba(227, 22, 91, 0.54)',
    'rgba(227, 22, 91, 0.4)',
    'rgba(227, 22, 91, 0.38)',
    'rgba(227, 22, 91, 0.24)',
    'rgba(227, 22, 91, 0.26)',
    'rgba(227, 22, 91, 0.2)',
    'rgba(227, 22, 91, 0.16)',
    'rgba(227, 22, 91, 0.12)',
    'rgba(227, 22, 91, 0.04)',
    'rgba(171, 17, 69, 0.16)'
  ],
  others: [
    'rgb(255, 0, 255)',
    'rgb(156, 39, 176)',
    'rgb(103, 58, 184)',
    'rgb(0, 255, 255)',
    'rgba(0, 135, 134, 0.85)',
    'rgb(0, 135, 134)',
    'rgb(2, 150, 136)'
  ],
  blue: [
    'rgb(220, 239, 254)',
    'rgb(202, 232, 255)',
    'rgb(50, 37, 201)',
    'rgb(0, 0, 255)',
    'rgb(46, 46, 241)',
    'rgb(50, 64, 143)',
    'rgb(63, 81, 181)',
    'rgb(159, 168, 218)',
    'rgb(88, 105, 197)',
    'rgb(121, 134, 203)',
    'rgb(43, 56, 124)',
    'rgb(63, 82, 181)',
    'rgb(13, 71, 161)',
    'rgb(10, 53, 118)',
    'rgb(74, 144, 226)',
    'rgb(48, 136, 237)',
    'rgb(4, 77, 139)',
    'rgb(6, 119, 213)',
    'rgb(4, 120, 215)',
    'rgb(63, 152, 223)',
    'rgb(2, 86, 153)',
    'rgb(84, 163, 226)',
    'rgb(3, 131, 233)',
    'rgb(33, 136, 218)',
    'rgb(5, 142, 251)',
    'rgb(3, 120, 213)',
    'rgb(3, 109, 193)',
    'rgb(46, 161, 252)',
    'rgb(2, 78, 138)',
    'rgb(2, 92, 163)',
    'rgb(25, 152, 252)',
    'rgb(0, 90, 158)',
    'rgb(72, 155, 213)',
    'rgb(36, 119, 150)',
    'rgba(63, 81, 181, 0.15)',
    'rgba(63, 81, 181, 0.2)',
    'rgba(63, 81, 181, 0.1)',
    'rgba(63, 81, 181, 0)',
    'rgb(1, 22, 119)',
    'rgba(107, 114, 128, 0.5)',
    'rgba(0, 120, 222, 0.15)',
    'rgba(0, 120, 222, 0.65)',
    'rgba(3, 120, 213, 0.04)',
    'rgba(3, 120, 213, 0.12)',
    'rgba(3, 120, 213, 0.24)',
    'rgba(3, 120, 213, 0.8)',
    'rgba(3, 120, 213, 0.2)'
  ],
  green: [
    'rgb(34, 178, 75)',
    'rgb(76, 175, 81)',
    'rgb(0, 255, 0)',
    'rgb(215, 249, 199)',
    'rgb(77, 132, 30)',
    'rgb(98, 147, 56)',
    'rgb(40, 69, 15)',
    'rgb(116, 199, 44)',
    'rgb(106, 182, 40)',
    'rgb(77, 131, 30)',
    'rgb(87, 149, 33)',
    'rgb(206, 237, 179)',
    'rgb(77, 132, 29)',
    'rgba(77, 132, 29, 0.04)',
    'rgba(77, 132, 29, 0.12)',
    'rgba(77, 132, 29, 0.24)',
    'rgba(77, 132, 29, 0.8)',
    'rgba(77, 132, 29, 0.2)',
    'rgb(67, 115, 25)',
    'rgb(120, 162, 83)',
    'rgb(48, 82, 18)',
    'rgb(134, 171, 101)',
    'rgb(53, 90, 20)',
    'rgb(97, 165, 36)'
  ],
  yellow: ['rgb(255, 255, 0)', 'rgb(255, 255, 0)'],
  orange: [
    'rgb(255, 202, 28)',
    'rgb(255, 224, 130)',
    'rgb(254, 152, 0)',
    'rgb(255, 183, 77)',
    'rgb(253, 191, 100)',
    'rgb(252, 122, 5)',
    'rgb(117, 53, 0)',
    'rgb(254, 115, 0)',
    'rgb(255, 126, 20)',
    'rgb(173, 78, 0)',
    'rgb(193, 87, 0)',
    'rgba(193, 87, 0, 0.04)',
    'rgba(193, 87, 0, 0.12)',
    'rgba(193, 87, 0, 0.24)',
    'rgba(193, 87, 0, 0.8)',
    'rgba(193, 87, 0, 0.2)',
    'rgb(213, 96, 0)',
    'rgb(142, 64, 0)',
    'rgb(213, 141, 82)',
    'rgb(200, 107, 31)',
    'rgb(208, 127, 61)',
    'rgb(234, 105, 0)',
    'rgb(132, 59, 0)',
    'rgb(193, 86, 1)',
    'rgb(255, 221, 194)',
    'rgb(142, 63, 1)',
    'rgb(219, 88, 47)',
    'rgb(236, 85, 38)',
    'rgb(167, 51, 15)',
    'rgb(144, 44, 13)',
    'rgb(224, 111, 76)',
    'rgb(121, 37, 11)',
    'rgb(158, 48, 14)',
    'rgb(195, 59, 17)',
    'rgb(214, 65, 19)',
    'rgba(214, 65, 19, 0.04)',
    'rgba(214, 65, 19, 0.12)',
    'rgba(214, 65, 19, 0.24)',
    'rgba(214, 65, 19, 0.8)',
    'rgba(214, 65, 19, 0.2)',
    'rgb(233, 71, 21)',
    'rgb(253, 240, 236)',
    'rgb(227, 126, 95)',
    'rgb(215, 65, 19)',
    'rgb(237, 99, 57)',
    'rgb(239, 114, 76)',
    'rgb(244, 67, 54)'
  ],
  gray: [
    'rgb(236, 234, 255)',
    'rgb(197, 202, 233)',
    'rgb(232, 234, 246)',
    'rgb(187, 189, 192)',
    'rgb(95, 99, 104)',
    'rgb(152, 154, 156)',
    'rgb(225, 223, 221)',
    'rgb(56, 56, 56)',
    'rgba(0, 0, 0, 0.1)',
    'rgba(0, 0, 0, 0.3)',
    'rgb(250, 250, 250)',
    'rgba(0, 0, 0, 0.2)',
    'rgba(0, 0, 0, 0.14)',
    'rgba(0, 0, 0, 0.12)',
    'rgba(0, 0, 0, 0.87)',
    'rgba(226, 226, 226, 0.9844)',
    'rgba(0, 0, 0, 0.18)',
    'rgba(184, 184, 184, 0.9584)',
    'rgba(0, 0, 0, 0.26)',
    'rgba(0, 0, 0, 0.24)',
    'rgb(255, 255, 255)',
    'rgba(255, 255, 255, 0.24)',
    'rgba(0, 0, 0, 0.0348)',
    'rgba(0, 0, 0, 0.1044)',
    'rgba(0, 0, 0, 0.2088)',
    'rgb(173, 173, 173)',
    'rgba(0, 0, 0, 0.32)',
    'rgba(0, 0, 0, 0.056)',
    'rgb(117, 117, 117)',
    'rgb(189, 189, 189)',
    'rgb(224, 224, 224)',
    'rgba(0, 0, 0, 0.54)',
    'rgb(193, 193, 193)',
    'rgba(0, 0, 0, 0.7)',
    'rgb(0, 0, 0)',
    'rgb(214, 214, 214)',
    'rgb(183, 183, 183)',
    'rgb(188, 188, 188)',
    'rgb(158, 158, 158)',
    'rgb(163, 163, 163)',
    'rgb(153, 153, 153)',
    'rgba(0, 0, 0, 0.04)',
    'rgba(0, 0, 0, 0.16)',
    'rgba(0, 0, 0, 0)',
    'rgba(255, 255, 255, 0.8)',
    'rgb(245, 245, 245)',
    'rgb(204, 204, 204)',
    'rgba(0, 0, 0, 0.75)',
    'rgba(0, 0, 0, 0.38)',
    'rgb(238, 238, 238)',
    'rgba(0, 0, 0, 0.6)',
    'rgb(200, 200, 200)',
    'rgba(0, 0, 0, 0.74)',
    'rgb(0, 0, 0)',
    'rgb(221, 221, 221)',
    'rgb(128, 128, 128)',
    'rgb(228, 228, 228)',
    'rgb(170, 170, 170)',
    'rgb(235, 235, 235)',
    'rgba(0, 0, 0, 0.5)',
    'rgb(216, 216, 216)',
    'rgb(206, 205, 205)',
    'rgb(211, 211, 211)',
    'rgba(0, 0, 0, 0.21)',
    'rgb(206, 206, 206)',
    'rgba(0, 0, 0, 0.42)',
    'rgb(199, 199, 199)',
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 255, 255, 0.12)',
    'rgba(0, 0, 0, 0.05)',
    'rgba(250, 250, 250, 0.5)',
    'rgb(211, 211, 211)',
    'rgb(243, 243, 243)',
    'rgba(97, 97, 97, 0.87)',
    'rgb(97, 97, 97)',
    'rgb(33, 33, 33)',
    'rgba(51, 51, 51, 0.6)',
    'rgb(34, 34, 34)',
    'rgba(255, 255, 255, 0.15)',
    'rgba(255, 255, 255, 0.64)',
    'rgb(246, 246, 246)',
    'rgba(255, 255, 255, 0)',
    'rgba(0, 0, 0, 0.06)',
    'rgb(236, 236, 236)',
    'rgb(220, 220, 220)',
    'rgb(66, 66, 66)',
    'rgba(0, 0, 0, 0.22)',
    'rgba(0, 0, 0, 0.35)',
    'rgba(0, 0, 0, 0.15)',
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.65)',
    'rgba(255, 255, 255, 0.4)',
    'rgb(255, 255, 255)',
    'rgba(255, 255, 255, 0.7)',
    'rgba(255, 255, 255, 0.38)',
    'rgba(255, 255, 255, 0.54)',
    'rgba(255, 255, 255, 0.87)',
    'rgb(48, 48, 48)',
    'rgb(230, 230, 230)',
    'rgb(23, 23, 23)',
    'rgb(217, 217, 217)',
    'rgb(10, 10, 10)',
    'rgba(38, 38, 38, 0.87)',
    'rgb(231, 231, 231)',
    'rgba(0, 0, 0, 0.25)',
    'rgba(0, 0, 0, 0.9)',
    'rgb(224, 224, 224)',
    'rgb(166, 166, 166)',
    'rgb(208, 208, 208)',
    'rgba(0, 0, 0, 0.4)',
    'rgb(51, 51, 51)',
    'rgba(0, 0, 0, 0.36)',
    'rgb(250, 250, 250)',
    'rgba(0, 0, 0, 0.13)',
    'rgba(0, 0, 0, 0.08)',
    'rgb(81, 81, 81)',
    'rgb(204, 204, 204)'
  ]
}

const T = Object.keys(colors).map((key) => {
  const palette = colors[key]
  const col = palette.sort((a, b) => {
    const c1 = color(a)
    const c2 = color(b)

    return c2.luminosity() - c1.luminosity()
  })
  return { [key]: col }
})

fs.writeFileSync('colors.json', JSON.stringify(T, null, 2))

const CssVars2JSON = (css) => {
  const regex = /--(.*?):(.*?);/g
  const root = []
  let match
  while ((match = regex.exec(css))) {
    const [, key, v] = match
    const value = v.trim()
    const obj = {
      name: key,
      value,
      color: color(value)
    }
    root.push(obj)
  }

  return root
}
/**
 *
 * @param {any[], Record<string,any>} obj
 */
const JSON2CssVars = (obj) => {
  let css = ''

  const isArray = Array.isArray(obj)

  const array = Object.keys(obj)

  for (let i = 0; i < array.length; i++) {
    if (isArray) {
      const { name, color: value } = obj[i]
      css += `--${name}: ${value};\n`
    } else {
      const key = array[i]
      const value = obj[key]
      css += `--${key}: ${value};\n`
    }
  }

  return css
}

const orderVariables = () => {
  const css = fs.readFileSync(file, 'utf8')
  const variables = CssVars2JSON(css)

  const colors = variables.map((v) => v.color.hex())

  // const res = Object.keys(results).reduce((acc, key) => {
  //   const colors = results[key].colors.map((c, index) => {
  //     const value = color(c).rgb().string()
  //     const name = `color-${key}-${index}`
  //     return { name, value, color: value }
  //   })
  //   acc.push(...colors)
  //   return acc
  // }, [])

  const cssVars = JSON2CssVars(variables)

  const newCss = `:root {\n${cssVars}\n}`

  fs.writeFileSync(output, newCss)
}

module.exports = orderVariables
