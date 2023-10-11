const fs = require('node:fs')
const path = require('node:path')
const parseVariables = require('./util/parseVariables')

const mainFile = path.resolve(__dirname, 'sample', 'main.css')
const css = fs.readFileSync(mainFile, 'utf-8')
// if (!fs.existsSync(path.resolve('styles'))) {
//   require('./template')
// }

// require('./build')

const main = () => {
  parseVariables(css, { from: mainFile }).then((result) => {
    const { globalCss, resultCss } = result

    const output = path.resolve(__dirname, 'sample', 'output')

    let imports = ''

    if (fs.existsSync(output)) {
      fs.rmSync(output, { recursive: true })
    }
    fs.mkdirSync(output)

    fs.writeFileSync(path.resolve(output, 'variables.css'), globalCss)

    imports += '@import "./variables.css";\n'

    Object.keys(resultCss).forEach((key) => {
      const file = path.resolve(output, `${key}.css`)
      imports += `@import "./${key}.css";\n`
      fs.appendFileSync(file, resultCss[key])
    })

    // create main file

    const mainFile = path.resolve(output, 'main.css')

    fs.appendFileSync(mainFile, imports)
  })
}

main()
