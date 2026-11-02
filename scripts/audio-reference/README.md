# 音效制作参考导出

用户要求每个音效独立提供 MP4，画面清楚标注音效起点与结束点。共 13 个，来源是 `public/Audio/manifest.json`；没有制作音频，也不启用空 WAV。

- 输出：`production/audio-reference/`，整目录已忽略，不进 Git，也不复制进站点构建。
- 规格：1920×1080、60 fps、H.264 / yuv420p、6 秒、无音轨。
- 所有起点：第 120 帧（00:00:02:00）。结束是建议尾音，持续在画面右侧与时间轴上显示；可按声音制作结果调整。
- 用途：动作与对齐参考。游戏动作来自实际关卡 `step` / `bite` 转换，事件时间与网页共用 `frameHoldMs`；画面通过 Remotion 按帧重放，不是浏览器屏幕录制。界面确认/返回使用本地页面截图，片尾呈现入场动作。
- WAV 导出不要带参考片前面的两秒空白。命名和目录与原占位 WAV 一致。

## 重新生成

1. 启动 `npm run dev`，将中文版首页和第一关的 1280×720 页面截图保存到 `production/audio-reference/assets/ui/home.png`、`game.png`。截图由正常浏览器预览采集，不包含个人信息。
2. `npm run audio:stills`：每个片段导出准备、起点、建议结束、尾帧。人工检查起止标注及动作。
3. `npm run audio:render`：批量导出 13 个 MP4，并生成本地 `index.html`、`cue-sheet.csv`、`cue-sheet.json`。
4. 打开 `production/audio-reference/index.html` 查看全部片段。用 ffprobe 核验分辨率、帧率、时长、帧数和无音轨；抽查动作与时间码。生产导出前应先检查静帧。

原来的独立蛇头 PNG 已移到本地忽略目录 `retired-art/`，网站和参考片都采用蛇身 PNG + 独立 SVG 眼睛。
