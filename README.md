# Webpack

![image-20210630162757119](README.assets/image-20210630162757119.png)

## webpack设置

```shell
yarn add webpack webpack-cli -D
yarn init
# 运行指令

#开发环境
webpack ./src/index.js -o ./build/built.js --mode=development
#生产环境 生成的文件会压缩代码
webpack ./src/index.js -o ./build/built.js --mode=production
```

1. webpack仅能处理js/json资源，不能处理css/img等其他资源
2. 生产环境比开发环境多一个压缩js代码
3. 将ES6模块化编译成浏览器能识别的模块化

### webpack.config.js

基于NodeJS平台运行，模块化采用CommonJS

```shell
yarn add webpack webpack-cli -D #webpack环境
yarn add style-loader css-loader less less-loader -D #样式loader
```



```js
const { resolve } = require('path')
module.exports = {
  //webpack配置
  //入口起点
  entry:'./src/index/js',
  //输出
  output: {
    //输出文件名
    filename:'built.js',
    //输出路径
    path:resolve(__dirname,'build')
  },
  //loader的配置
  module:{
    rules:[
      //详细loader配置
      //不同文件必须配置不同loader处理
      {
        //匹配哪些文件
        test:/\.css$/,
        //使用哪些loader进行处理
        use:[
          //use数组从右到左执行
          //创建style标签，将js中的样式资源插入进行，添加到head中生效
          'style-loader',
          //将css文件编程CommonJS模块加载js中，里面内容是样式字符串
          'css-loader'
        ]
      },
      {
        test:/\.less$/,
        use:[
          'style-loader',
          'css-loader',
          //将less文件编译成css文件
          'less-loader'
        ]
      }
    ]
  },
  //plugins的配置
  plugins:[
    //详细plugins的配置
  ],
  //模式
  mode:'development',
  //mode:'production'
}
```

