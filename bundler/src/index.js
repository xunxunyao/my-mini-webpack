(function(__require__, exports) {
  let X = __require__(1)
  const helloWorld = X.default('hello world!')
  const node = document.createElement("div")
  node.innerHTML = helloWorld + 'loading...'
  // import(/* webpackChunkName: "async" */ './lazy').then(({ default: lazy }) => {
  //   node.innerHTML = helloWorld + lazy
  // })
  document.body.appendChild(node)
})