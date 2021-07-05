const fs = require('fs')
const path = require('path')
// 分析ast
const babelParser = require('@babel/parser');
// 收集依赖
const traverse = require('@babel/traverse').default;
// 编译抽象语法树
const { transformFromAst } = require('@babel/core')

function myWebpack(config) {
    return new Compiler(config);
}

class Compiler {
    constructor(options = {}) {
        this.options = options;
    }

    // 启动webpack打包
    run() {
        // 1. 读取入口文件内容
        const filePath = this.options.entry;
        const file = fs.readFileSync(filePath, 'utf-8');
        // 2. 解析成ast抽象语法树
        const ast = babelParser.parse(file, {
            sourceType: 'module' // 解析文件的模块化方案是ES Module
        })
        //  debugger;
        //  console.log(ast)

        // 获取到文件夹路径
        const dirname = path.dirname(filePath);

        // 定义存储依赖的容器
        const deps = {};

        // 收集依赖
        traverse(ast, {
            // 内部会遍历ast中program.body,并判断里面语句类型
            // 如果 type: ImportDeclaration则触发当前函数
            ImportDeclaration({node}) {
                // 文件相对路径
                const relativePath = node.source.value;
                const absolutePath = path.resolve(dirname, relativePath);
                deps[relativePath] = absolutePath;
            }
        })
        // console.log(deps);
        
        // 编译代码：将代码中浏览器不能识别的语法进行编译
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })
        console.log(code)
    }
}

module.exports = myWebpack;