/**
 * 从入口文件开始去理解所有文件的依赖关系。主要是创建一个依赖图去把所有的模块打包成一个模块
 */

const fs = require('fs');
const path = require('path');
const babylon = require('babylon'); // 将文件转化成AST
const traverse = require('babel-traverse').default; // 寻找依赖关系
const {transformFromAst} = require('babel-core'); // 将 AST 转化成 ES5

let ID = 0; // 设置模块ID

// 对单个文件的解析
function createAsset(filename) {
  // 读一个文件，得到一个文件内容的字符串
  const content = fs.readFileSync(filename, 'utf-8');

  // 我们通过 babylon 这个 javascript 解析器来理解 import 进来的字符串
  const ast = babylon.parse(content, {
    sourceType: 'module',
  });

  // 该模块所依赖的模块的相对路径放在这个 dependencies 数组
  const dependencies = [];

  // import声明
  traverse(ast, {
    // es6 的模块是静态的，不能导入一个变量或者有条件的导入另一个模块
    ImportDeclaration: ({node}) => {
      // 所依赖的模块的路径
      dependencies.push(node.source.value);
    },
  });

  // 递增设置模块ID
  const id = ID++;

// AST -> ES5
  const {code} = transformFromAst(ast, null, {
    presets: ['env'],
  });
  // Return all information about this module.
  return {
    id,
    filename,
    dependencies,
    code,
  };
}

// 我们需要知道单个模块的依赖，然后从入口文件开始，提取依赖图
function createGraph(entry) {
  // 从第一个文件开始,首先解析index文件
  const mainAsset = createAsset(entry);

  // 定义一个依赖队列，一开始的时候只有入口文件
  const queue = [mainAsset];

  // 遍历 queue，广度优先
  for (const asset of queue) {
    asset.mapping = {};

    const dirname = path.dirname(asset.filename);

    // 遍历依赖数组，解析每一个依赖模块
    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);

      // 解析
      const child = createAsset(absolutePath);

      // 子模块`路径-id`map
      asset.mapping[relativePath] = child.id;

      // 每一个子模块加入依赖图队列，进行遍历
      queue.push(child);
    });
  }

  // 依赖图
  return queue;
}


// 最终我们要生成一个自执行函数，参数是模块依赖图
// (function() {})()

function bundle(graph) {
  let modules = '';
  graph.forEach(mod => {
    // 利用 createAsset 解析的时候，我们是把 import 转化成 commonJs 的 require

    // 模块`id-路径`的map，因为我们转化之后的代码的require是使用相对路径.写一个map，拿到模块id的时候可以知道该模块对应的路径
    // { './relative/path': 1 }.

    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`;
  });
  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];
        function localRequire(name) {
          return require(mapping[name]);
        }
        const module = { exports : {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require(0);
    })({${modules}})
  `;

  return result;
}

const graph = createGraph('./src/index.js');
const result = bundle(graph);

console.log(result);
