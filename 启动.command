#!/bin/zsh
set -e
cd "${0:A:h}"
if ! command -v npm >/dev/null 2>&1; then
  print '请先安装 Node.js，再重新打开。'
  read -k 1
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm ci
fi
print '游戏站点将在浏览器中打开。关闭预览：按 Control + C。'
npm run dev -- --open
