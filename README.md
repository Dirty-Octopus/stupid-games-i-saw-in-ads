<h1 align="center">stupid games i saw in ads</h1>

<h3 align="center">那些我在广告里看到的傻X小游戏</h3>

<p align="center">把刷视频或浏览不同平台时看到的小游戏做成可以在网页里玩的版本。</p>

<p align="center">
  <a href="https://dirty-octopus.github.io/stupid-games-i-saw-in-ads/">
    <img src="https://img.shields.io/badge/play-online-699cda" alt="在线游玩" />
  </a>
  <a href="./package.json">
    <img src="https://img.shields.io/github/package-json/v/Dirty-Octopus/stupid-games-i-saw-in-ads?label=version&amp;color=78a86a" alt="项目版本" />
  </a>
  <a href="https://repology.org/projects/?search=stupid-games-i-saw-in-ads">
    <img src="https://img.shields.io/badge/Repology-search-7f70bb" alt="在 Repology 中搜索项目" />
  </a>
</p>

<p align="center">
  <a href="https://dirty-octopus.github.io/stupid-games-i-saw-in-ads/">在线游玩</a> ·
  <a href="#开发">本地运行</a> ·
  <a href="#项目资料">项目资料</a> ·
  <a href="https://github.com/Dirty-Octopus/stupid-games-i-saw-in-ads/issues">反馈问题</a>
</p>

## 在线游玩

打开 [GitHub Pages](https://dirty-octopus.github.io/stupid-games-i-saw-in-ads/) 即可游玩，无需安装。支持桌面键盘与手机触屏操作。

首次进入时选择中文或英文，之后可在右上角切换语言、深浅主题和声音。声音默认开启，在首次键盘或指针操作后解锁。

## 功能

- **重力贪吃蛇**：十个关卡，最后一关为仅有 9 颗苹果的追逐关。
- **键盘与触屏**：支持方向键、WASD 和屏幕方向按钮，按住可连续移动。
- **中英双语与深浅主题**：玩法说明、关卡和片尾随界面语言切换。
- **弹性动效**：字母冒泡开场、标题连续移入左上角，以及卡片、按钮和游戏对象的动作反馈；支持系统的减少动态效果设置。
- **正式音效**：已接入 13 个 WAV，覆盖移动、吃苹果、下落、咬尾、结算与页面操作；重开、换关或返回会停止旧音效。
- **共用片尾**：最终关通关后显示双列制作名单，支持按住加速和跳过。

## 游戏与操作

### 重力贪吃蛇

蛇从两格开始，每吃一颗苹果从尾部增长一格。只要任意一节身体下方有地块，整条蛇就能保持支撑；全身失去支撑时下落，掉出地图死亡。蛇头进入出口即可通关，苹果可以选吃，吃得越多得分越高。四个方向都无法移动时立即失败。

第十关中，怪物每五秒咬掉尾部三格，身体少于两格时失败。十关均可在关卡菜单中直接选择，完整规则与计分方式见[游戏文档](docs/games/gravity-snake.md)。

| 操作 | 键盘 | 屏幕按钮 |
| --- | --- | --- |
| 移动 | 方向键 / WASD，支持按住 | 按住或点按方向按钮 |
| 重开当前关卡 | R | 重开 |
| 暂停 / 继续 | P / Escape | 暂停 / 继续 |
| 片尾加速 | 按住 Enter 为 8 倍速，松开恢复 | 按住加速按钮 |
| 跳过片尾 | Space / Escape | 跳过 |

## 开发

使用 Node.js 24 和 npm，与仓库的 Pages 构建环境保持一致。

```sh
git clone https://github.com/Dirty-Octopus/stupid-games-i-saw-in-ads.git
cd stupid-games-i-saw-in-ads
npm ci
npm run dev
```

默认本地地址为 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)。macOS 也可以在安装 Node.js 后双击仓库中的 [`启动.command`](启动.command)，自动安装依赖并打开浏览器。

### 验证

```sh
npm test       # 规则、音效、双语、片尾与服务边界检查
npm run solve  # 回放十关的合法解法，追逐关包含定时咬尾
npm run build  # TypeScript 检查与生产构建，输出到 dist/
```

### 构建预览与部署

构建后运行 `npm run preview`，默认在 [http://127.0.0.1:4173/](http://127.0.0.1:4173/) 预览静态产物。路由和资源路径支持 GitHub Pages 仓库子路径。

Pages 使用[手动部署工作流](.github/workflows/pages.yml)：在 Actions 中运行 **Deploy GitHub Pages**，依次执行测试、十关解法验证、构建和发布。普通推送不会自动部署；部署需按[协作约定](AGENTS.md)获得用户确认。

## 项目资料

| 文档 | 内容 |
| --- | --- |
| [协作约定](AGENTS.md) | 需求确认、实现、音效交接和发布流程 |
| [项目需求与进度](docs/PROJECT.md) | 站点范围与验收要求 |
| [视觉与动效](docs/DESIGN.md) | 页面层级、开场与交互节奏 |
| [架构方案](docs/ARCHITECTURE.md) | 游戏解耦、数据接口和 Pages 路径 |
| [重力贪吃蛇](docs/games/gravity-snake.md) | 最终规则、计分、尾部展开算法与关卡范围 |
| [验证记录](docs/VALIDATION.md) | 已执行的检查与当前限制 |
| [音效交接](public/Audio/README.md) | WAV 文件名、触发时机、用途与替换方式 |

音效位于 `public/Audio/gravity-snake/` 和 `public/Audio/shared/`。本地 MP4 动作参考保留在被忽略的 `production/audio-reference/`，不进入 Git 或网站构建。

## 参与贡献

欢迎通过 [Issues](https://github.com/Dirty-Octopus/stupid-games-i-saw-in-ads/issues) 提供小游戏截图、视频或机制说明，也欢迎反馈问题和提交 Pull Request。反馈游戏问题时，请附上关卡、操作步骤、设备与浏览器信息。

新增游戏或调整规则前，请先按[协作约定](AGENTS.md)确认玩法、胜负条件、操作方式和关卡范围，再更新对应游戏文档。

## 鸣谢

- [React](https://github.com/facebook/react)：界面组件。
- [Vite](https://github.com/vitejs/vite) 与 [TypeScript](https://github.com/microsoft/TypeScript)：开发、构建与类型检查。
- [Motion](https://github.com/motiondivision/motion)：界面与游戏动效。
- [Phosphor Icons](https://github.com/phosphor-icons/react) 与 [Nunito](https://fonts.google.com/specimen/Nunito)：图标与字体。

## 隐私与数据

当前为静态前端，无账号、后端、排行榜或分析服务。分数与关卡进度只保留在当前页面的内存中，刷新或关闭页面后清空；浏览器本地存储仅用于记住语言偏好。
