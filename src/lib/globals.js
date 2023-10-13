const CSS_PROPERTIES = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'box-shadow',
  'border',
  'border-left',
  'border-right',
  'border-top',
  'border-bottom',
  'background',
  'outline'
]

const THEME = 'material'
const SUFFIX = `sf-${THEME}`

module.exports = {
  THEME,
  SUFFIX,
  OUTPUT: 'build',
  FOLDER_TEMPLATE: 'styles',
  CSS_PROPERTIES
}
