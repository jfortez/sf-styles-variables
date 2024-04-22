const getPaths = require('./lib/template')
const build = require('./lib/build')

const main = () => {
  const paths = getPaths()

  build({ onlyGlobalFolder: true, includeGlobalVariables: true, paths })
}

main()
