!(function(modules){
  function __require__ (id) {
    var module = {
      exports: []
    }
    modules[id](__require__, module.exports, module);
    return module.exports
  }

  let chunkResolves = {};

  window.requireJsonp = function(chunkId, newModules) {
    for (const id in newModules) {
      modules[id] = newModules[id]
      chunkResolves[chunkId]();
    }
  }
  __require__(0)
})([
  // {
  //   [mododuleId]: codeFunction
  // }
  // TODO insert module here
])