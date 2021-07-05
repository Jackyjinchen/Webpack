const path = require('path')
const fs = require('fs');
const { getAst, getDeps, getCode } = require("./parser");

class Compiler {
    constructor(options = {}) {
        // webpack配置
        this.options = options;
        // 所有依赖的容器
        this.modules = [];
    }

    // 启动webpack打包
    run() {
        // 入口文件路径
        const filePath = this.options.entry;
        // 第一次构建，得到入口文件的信息
        const fileInfo = this.build(filePath);

        this.modules.push(fileInfo);

        // 遍历所有依赖
        this.modules.forEach((fileInfo) => {
            // 取出当前文件的所有依赖
            const deps = fileInfo.deps;
            // 遍历
            for (const relativePath in deps) {
                // 依赖文件的绝对路径
                const absolutePath = deps[relativePath];
                const fileInfo = this.build(absolutePath);
                //将处理后的结果添加modules中
                this.modules.push(fileInfo);
            }
        });
        // console.log(this.modules)

        // 将依赖整理为更好的依赖关系图
        const depsGraph = this.modules.reduce((graph, module) => {
            return {
                ...graph,
                [module.filePath]: {
                    code: module.code,
                    deps: module.deps
                }
            }
        }, {});
        // console.log(depsGraph)
        this.generate(depsGraph)
    }

    // 开始构建
    build(filePath) {
        // 1. 解析成ast
        const ast = getAst(filePath);
        // 2. 获取ast中所有的依赖
        const deps = getDeps(ast, filePath);
        // 3. 将ast解析成code
        const code = getCode(ast);

        return {
            filePath,
            deps,
            code
        }
    }

    // 构建输出资源
    generate(depsGraph) {
        /*
        '"use strict";\n' +
        '\n' +
        'var _add = _interopRequireDefault(require("./add.js"));\n' +
        '\n' +
        'var _count = _interopRequireDefault(require("./count.js"));\n' +
        '\n' +
        'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
        '\n' +
        'console.log((0, _add["default"])(1, 2));\n' +
        'console.log((0, _count["default"])(3, 2));'
        */

        const bundle = `
            (function (depsGraph) {
                // require目的：加载入口文件
                function require(module) {
                    // 定义模块内部的require函数
                    function localRequire(relativePath) {
                        // 为了找到要引入模块的绝对路径，通过require函数加载进来
                        return require(depsGraph[module].deps[relativePath])
                    }
                    // 定义暴露对象（模块要暴露的内容）
                    var exports = {};

                    (function(require, exports, code) {
                        eval(code)
                    })(localRequire, exports, depsGraph[module].code)
                    // 作为require函数的返回值返回出去
                    // 后面的require函数能得到暴露的内容
                    return exports;
                }
                // 加载入口文件
                require('${this.options.entry}')

            })(${JSON.stringify(depsGraph)})
        `

        // 生成输出文件的绝对路径
        const filePath = path.resolve(this.options.output.path, this.options.output.filename)
        // 写入文件
        fs.writeFileSync(filePath, bundle, 'utf-8');
    }
}

module.exports = Compiler;