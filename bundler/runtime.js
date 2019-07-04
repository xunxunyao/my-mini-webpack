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

  __require__.loadChunk = function(chunkId) {
    return new Promise(resolve => {
      chunkResolves[chunkId] = resolve
      let script = document.createElement('script')
      script.src = 'src/' + {0: 'async'}[chunkId]+ '.js'
      document.head.appendChild(script)
    })
  }
  __require__(0)
})(
  // {
  //   [mododuleId]: codeFunction
  // }
  // TODO insert module here
  {
    0: (function(__require__, exports) {
      let X = __require__(1)
      const helloWorld = X.default('hello world!')
      const node = document.createElement("div")
      node.innerHTML = helloWorld + 'loading...'
      // import(/* webpackChunkName: "async" */ './lazy').then(({ default: lazy }) => {
      //   node.innerHTML = helloWorld + lazy
      // })
      __require__.loadChunk(0)
        .then(__require__.bind(null, 3))
          .then(function(Y){
        node.innerHTML = helloWorld + Y.default
      })
      document.body.appendChild(node)
    }),
    1: (function(__require__, exports) {
      exports.default = (val) => {
        return val && val.toUpperCase()
      }
    })
  }
)