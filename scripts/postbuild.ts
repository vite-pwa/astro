import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// fix cjs export default
const cjsModule = resolve('dist/index.cjs')
const cjsModuleContent = readFileSync(cjsModule, 'utf-8')
writeFileSync(
  cjsModule,
  cjsModuleContent
    .replace('\'use strict\';', '\'use strict\';Object.defineProperty(exports, \'__esModule\', {value: true});')
    .replace('module.exports = index;', 'exports.default = index;'),
  'utf-8',
)

/*
// fix d.cts export default
const ctsModule = resolve('dist/index.d.cts')
const ctsModuleContent = readFileSync(ctsModule, 'utf-8')
writeFileSync(
  ctsModule,
  ctsModuleContent.replace(
    'export { type PwaOptions, export_default as default };',
    'export { type PwaOptions };\n\nexport = export_default;',
  ),
  'utf-8',
)
*/
