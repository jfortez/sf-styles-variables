const exec = require('util').promisify(require('child_process').exec)

const dependencies = [
  '@syncfusion/ej2-grids',
  '@syncfusion/ej2-pivotview',
  '@syncfusion/ej2-treegrid',
  '@syncfusion/ej2-spreadsheet',
  '@syncfusion/ej2-inplace-editor',
  '@syncfusion/ej2-pdfviewer',
  '@syncfusion/ej2-richtexteditor',
  '@syncfusion/ej2-documenteditor',
  '@syncfusion/ej2-dropdowns',
  '@syncfusion/ej2-inputs',
  '@syncfusion/ej2-buttons',
  '@syncfusion/ej2-splitbuttons',
  '@syncfusion/ej2-charts',
  '@syncfusion/ej2-circulargauge',
  '@syncfusion/ej2-diagrams',
  '@syncfusion/ej2-heatmap',
  '@syncfusion/ej2-maps',
  '@syncfusion/ej2-barcode-generator',
  '@syncfusion/ej2-kanban',
  '@syncfusion/ej2-treemap',
  '@syncfusion/ej2-schedule',
  '@syncfusion/ej2-calendars',
  '@syncfusion/ej2-gantt',
  '@syncfusion/ej2-navigations',
  '@syncfusion/ej2-filemanager',
  '@syncfusion/ej2-layouts',
  '@syncfusion/ej2-popups',
  '@syncfusion/ej2-lists',
  '@syncfusion/ej2-notifications',
  '@syncfusion/ej2-progressbar',
  '@syncfusion/ej2-querybuilder'
]

export const installDeps = () => {
  let str = 'npm i'
  for (const dependency of dependencies) {
    str += ` ${dependency}`
  }
  console.log(str)
  exec(str).then((response) => {
    console.log(response)
  })
}

module.exports = dependencies
