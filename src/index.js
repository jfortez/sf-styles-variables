const fs = require('node:fs')
const path = require('node:path')

if (!fs.existsSync(path.resolve('styles'))) {
  require('./template')
}

require('./build')
