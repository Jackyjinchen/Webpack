# Webpack

![image-20210630162757119](README.assets/image-20210630162757119.png)

## webpack核心概念

1. **Entry**

   入口起点，分析构建内部依赖图

2. **Output**

   输出后的资源bundles到哪里，以及如何命名

3. **Loader**

   处理非JavaScript文件（webpack自身只理解JavaScript）

4. **Plugins**

   执行范围更广的任务，从打包优化和压缩，到重新定义环境中的变量等。

5. **Mode**

| 选项        | 描述                                                         | 特点                       |
| ----------- | ------------------------------------------------------------ | -------------------------- |
| development | 会将process.env.NODE_ENV的值设为development。<br />启用NamedChunksPlugin和NamedModulesPlugin。 | 能让代码本地调试运行的环境 |
| production  | 会将process.env.NODE_ENV的值设为production。<br />启用FlagDependencyUsagePlugin，FlagIncludedChunksPlugin，ModuleConcatenationPlugin，NoEmitOnErrorsPlugin，<br />OccurrenceOrderPlugin，SideEffectsFlagPlugin和UglifyJsPlugin | 能让代码优化上线运行的环境 |



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
yarn add file-loader url-loader html-loader -D #处理图片资源
yarn add webpack-dev-server -D #开发环境devServer
```



#### 开发环境配置

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  //webpack配置
  //入口起点
  entry:'./src/index.js',
  //输出
  output: {
    //输出文件名
    filename:'js/built.js',
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
      },
      {
        //问题：默认处理不了html中的img标签图片
        //处理图片资源
        test:/\.(jpg|png|gif)$/,
        //使用一个loader
        //下载url-loader file-loader
        loader: 'url-loader',
        options:{
          //图片大小小于8kb，就会被base64处理
          //能够减少请求数量（减轻服务器压力），但图片体积更大（请求速度慢）
          limit: 8 * 1024,
          //因为url-loader默认使用es6模块，而html-loader是CommonJS
         	//解析式会出现问题[object Module]
          //关闭url-loader的es6模块化，使用CommonJS解析
          esModule: false,
          name:'[hash:10].[ext]',
          //输出目录到imgs文件夹下
          outputPath:'imgs'
        }
      },
      {
        test:/\.html$/,
        //处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
        loader: 'html-loader',
        options: {
          esModule:false
        }
      },
      {
        //排除css、js、html等资源
        exclude: /\.(css|js|html|less|jpg|png|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath:'media'
        }
      }
    ]
  },
  //plugins的配置
  plugins:[
    //plugins的配置
    //默认创建一个空的HTML文件，引入打包输出的所有资源（JS/CSS)
    //需求：需要有结构的HTML文件
    new HtmlWebpackPlugin({
      //复制文件，并自动引入所有资源
      template:'./src/index.html'
    })
  ],
  //模式
  mode:'development',
  //mode:'production'
  
  //开发服务器devServer
  //只在内存中编译打包，不会有任何输出
  //启动指令 webpack-dev-server
  devServer: {
    contentBase: resolve(__dirname,'build'),
    //启动gzip压缩
    compress:true,
    //端口号
    port:3000,
    //自动打开浏览器
    open:true
  }
}
```

```shell
#打包
webpack
#devserver运行指令
npx webpack serve #webpack5
npx webpack-dev-server
```

#### 生产环境配置

##### CSS样式文件处理

1. CSS加入JS可能会导致过大，闪屏现象
2. 代码压缩
3. 兼容性
4. ......

```shell
yarn add mini-css-extract-plugin -D #CSS样式文件独立
yarn add postcss-loader postcss-preset-env -D #CSS兼容性处理
yarn add optimize-css-assets-webpack-plugin -D #CSS压缩
yarn add css-minimizer-webpack-plugin -D #CSS压缩webapack5版本使用
```

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname,'build')
  },
  module: {
    rules: [
      {
        test:/\.css$/,
        use: [
          //创建style标签，放入样式
          //'style-loader',
          //取代style-loader，提取css成单独文件
          MiniCssExtractPlugin.loader,
          //将css整合到js中
          'css-loader',
          //css兼容性处理
          //帮助postcss找到package.json中的browserslist里面的配置，通过配置加载指定的css兼容性样式
          //'postcss-loader'
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('postcss-preset-env')
              ]
            }
          }
        ]
      }
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      template:'./src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/built.css'
    }),
    //压缩css
    new OptimizeCssAssetsWebpackPlugin()
  ],
  mode:'development'
}
```

```js
//package.json

//设置nodejs环境变量
process.env.NODE_ENV = 'development';

module.exports= {
    "browserslist": {
    //开发环境，设置node环境变量
    "deveplopment":[
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ],
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ]
  }
}

```

##### JS逻辑文件处理

###### 语法检查Eslint

```shell
yarn add eslint-loader eslint -D #语法检查eslint
#eslint-config-airbnb-base插件符合airbnb的一些规则
yarn add eslint-loader eslint eslint-plugin-import eslint-config-airbnb-base -D
```

###### 兼容性问题Babel

1. 基本兼容性处理 @babel/preset-env
2. 全部js兼容性处理 @babel/preset-env 体积过大
3. 按需加载 corejs

```js
import '@babel/polyfill'

//es6语法 在ie浏览器会报错
const add = (x, y) => {
  return x + y;
};
console.log(add(2, 5));

//promise不能转换，使用全部兼容性处理
const promise = new Promise((resolve) => {
  setTimeout(() => {
    console.log("finish");
    resolve();
  }, 1000)
})
console.log(promise);
```

```shell
yarn add babel-loader @babel/preset-env @babel/core -D #babel兼容性
yarn add @babel/polyfill #全部的兼容性处理
yarn add core-js -D #按需加载兼容性
```

###### JS及HTML压缩

对于JavaScript，mode设置为production，UglifyJsPlugin自动压缩。

通过HtmlWebpackPlugin配置压缩html文件

配置文件：

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname,'build')
  },
  module: {
    rules: [
      //语法检查，设置检查规则需要在package.json的eslintConfig中设置
      {
        test:'/\.js$/',
        //排除第三方库中的代码
        exclude: /node_modules/,
        loader:'eslint-loader',
        options:{
          //自动修复eslint错误
          fix: true
        }
      },
      {
        test:/\.js$/,
        exclude:/node_modules/,
        loader:'babel-loader',
        options: {
          //预设：指示babel做什么兼容性处理
          //presets: ['@babel/preset-env']
          presets: [
            '@babel/preset-env',
            {
              //按需加载
              useBuiltIns:'usage',
              //注定core-js版本
              corejs: {
                version: 3
              },
              //指定兼容性做到哪个版本的浏览器
              targets: {
                chrome: '60',
                firefox: '60',
                ie: '9',
                safari: '10',
                edge: '17'
              }
            }
          ]
        }
      }
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      template:'./src/index.html',
      minify: {
        // 折叠空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    })
  ],
  mode:'development'
}
```

```js
//package.json
module.exports = {
  "eslintConfig":{
    "extends": "airbnb-base"
  }
}
```

针对特定行可以使eslint所有规则都失效（不进行检查）

```js
// eslint-disable-next-line
console.log("hello")
```

##### 生产环境配置文件

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('css-minimizer-webpack-plugin')

//复用loader
const commonCssLoader = [
  MiniCssExtractPlugin.loader,
  'css-loader',
  {
    //需要在package.json中定义browserslist并设置NODE_ENV
    loader: 'postcss-loader',
    options: {
      ident:'postcss',
      plugins: [
        require('postcss-preset-env')
      ]
    }
  }
]

//配置
module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname,'build'),
  },
  module: {
    rules: [
      {
        test:/\.css$/,
        use: [...commonCssLoader]
      },
      {
        test:/\.less$/,
        use: [...commonCssLoader,'less-loader']
      },
      //当一个文件要呗多个loader处理，一定要指定loader的执行先后顺序
      //先执行eslint，再执行babel
      {
        //在package.json中eslintConfig配置
        test:/\.js$/,
        exclude: /node_modules/,
        //优先执行此loader
        enforece: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        test:/\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            {
              userBuiltIns: 'usage',
              corejs: {version: 3},
              targets: {
                chrome: '60',
                firefox: '50'
              }
            }
          ]
        }
      },
      {
        test:/\.(jpg|png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash:10].[ext]',
          outputPath: 'imgs',
          esModule: false
        }
      },
      {
        test:/\.html$/,
        loader: 'html-loader',
        options: {
          esModule: false
        }
      },
      {
        exclude:/\.(js|css|less|html|jpg|png|gif)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'media'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:'css/built.css'
    }),
    new OptimizeCssAssetsWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    })
  ],
  mode:'production'
}
```

### webpack优化配置

