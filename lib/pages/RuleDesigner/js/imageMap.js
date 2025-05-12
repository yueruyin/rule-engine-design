const modulesFiles = require.context('../img/', true, /\.png$/)
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = require('../img/' + moduleName + '.png')
  modules[moduleName] = value

  return modules
}, {})
export default modules