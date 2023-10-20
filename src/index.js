const fs = require('node:fs')
const path = require('node:path')
const { FOLDER_TEMPLATE, OUTPUT } = require('./lib/globals')
const createTemplate = require('./lib/template')
const build = require('./lib/build')

const main = () => {
  const template = path.resolve(FOLDER_TEMPLATE)
  const output = path.resolve(OUTPUT)

  if (!fs.existsSync(template)) {
    createTemplate()
  }

  if (!fs.existsSync(output)) {
    build({ onlyGlobalFolder: true, includeGlobalVariables: true })
  }
}

main()
