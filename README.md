# mirai-core-js

mirai-core-js 是一个简单的 [mirai](https://github.com/mamoe/mirai) Javascript 启动器。他并没有为你提供任何的 mirai额外 的功能，而是提供了一个简单的启动器，你可以基于它方便的来在你的 Node.js 程序中控制 mirai 的命令行版本。

## 安装

```bash
npm install mirai-core-js
```
或者使用yarn
```bash
yarn add mirai-core-js
```

## 使用

mirai-core-js 接管了 mirai 的命令行版本的输入输出，以方便你在 Node.js 中控制 mirai的启动、停止、重启、执行控制台命令等操作。


```js
const Mirai = require('mirai-core-js')

const mirai = new Mirai({
    javaPath: path.resolve('./mcl_core/java/bin/java'), // java的路径
    mclPath: path.resolve('./mcl_core'), // mirai 的根目录
    onStatusChange: (status) => {
      console.log(status);
    },
    onOutput: (data: string) => {
      if (!data) return;
    },
});
```
默认情况下，会自动启动mirai进程， 你可以通过设置配置`autoStart: false` 然后 通过 `mirai.start()` 来手动启动mirai进程。

## API

### mirai.start()

启动mirai进程

### mirai.stop()

停止mirai进程

### mirai.restart()

重启mirai进程

### mirai.exec(command: string)

执行控制台命令, 例如 `mirai.exec('/help')`

## Options

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| javaPath | string |  | java可执行文件的路径 |
| mclPath | string |  | mirai的根目录 |
| autoStart | boolean | true | 是否自动启动mirai进程 |
| onStatusChange | function |  | mirai进程状态改变时的回调函数 |
| onOutput | function |  | mirai进程输出时的回调函数 |

## License

MIT

## 作者

[CafuChino](https://github.com/CafuChino)
