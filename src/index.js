const fs = require('node:fs')
const path = require('node:path')
const { FOLDER_TEMPLATE, OUTPUT } = require('./util/globals')
const createTemplate = require('./util/template')
const build = require('./util/build')

const main = () => {
  const template = path.resolve(FOLDER_TEMPLATE)
  if (!fs.existsSync(template)) {
    createTemplate()
  }
  const output = path.resolve(OUTPUT)
  build()
  if (!fs.existsSync(output)) {
  }
}

main()
