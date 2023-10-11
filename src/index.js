const fs = require('node:fs')
const path = require('node:path')
const { FOLDER_TEMPLATE, OUTPUT } = require('./util/globals')
const build = require('./util/build')

const main = () => {
  const template = path.resolve(FOLDER_TEMPLATE)
  if (!fs.existsSync(template)) {
    require('./util/template')
  }
  const output = path.resolve(OUTPUT)
  // if (!fs.existsSync(output)) {
  build()
  // }
}

main()
