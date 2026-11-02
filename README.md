# stupid games i saw in ads

那些我在广告里看到的傻X小游戏。

把刷视频或浏览不同平台时看到的小游戏做成可以在网页里玩的版本。

## 当前进度

2026-11-01 立项，2026-11-02 完成首版。已包含冒泡开场、共享标题过渡、游戏卡片、重力贪吃蛇十关、仅 9 颗苹果的追逐关、中英双语、重绘贴图与独立蛇眼和每侧 329 条的双列共用片尾。13 个正式音效已接入；四个方向均无法移动时立即失败。

[在线游玩](https://dirty-octopus.github.io/stupid-games-i-saw-in-ads/)

首个游戏：**重力贪吃蛇**。初始两格，吃苹果从尾部增长一格；只有地块提供支撑，全身失去支撑时下落，掉出地图死亡。

## 本地运行

双击仓库中的 `启动.command`，或运行：

```sh
npm ci
npm run dev
```

方向键 / WASD 或屏幕方向按钮移动，按住可连续操作。R 重开，P / Escape 暂停。关卡菜单可选择十个关卡；进度与分数只在当前页面的内存中存在。

```sh
npm test       # 31 项规则、音效、双语、片尾与服务边界检查
npm run solve  # 回放十关的合法解法，追逐关包含定时咬尾
npm run build  # 类型检查与静态产物
```

首次进入在页面内选择语言，之后可在右上角切换；只记住语言偏好。片尾按住回车或屏幕加速按钮为 8 倍速，松开恢复，空格跳过。

## 项目资料

- [协作约定](AGENTS.md)：提问、实现、音效交接和发布流程。
- [项目需求与进度](docs/PROJECT.md)：站点范围与验收要求。
- [视觉与动效](docs/DESIGN.md)：页面层级、开场与交互节奏。
- [架构方案](docs/ARCHITECTURE.md)：游戏解耦、后端接口和 Pages 路径。
- [重力贪吃蛇](docs/games/gravity-snake.md)：最终规则、展开算法与关卡范围。
- [验证记录](docs/VALIDATION.md)：实际执行的检查和当前限制。
- [音效交接](public/Audio/README.md)：固定路径、文件用途与替换方式。

## 发布

用户于 2026-11-02 授权推送并部署第一版。GitHub Pages 使用 `.github/workflows/pages.yml`，在 Actions 中手动运行 **Deploy GitHub Pages** 后执行测试、十关验证、构建及发布；普通 push 不会自动部署。

音效默认开启，在首次键盘或指针操作时解锁。右上角可静音；重开、换关或返回会停止旧音效。音效 MP4 制作参考保留在被忽略的 `production/audio-reference/`，不会进入 Git 或网站构建。

远端：[Dirty-Octopus/stupid-games-i-saw-in-ads](https://github.com/Dirty-Octopus/stupid-games-i-saw-in-ads)
