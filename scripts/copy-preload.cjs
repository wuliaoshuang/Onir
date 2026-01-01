// scripts/copy-preload.cjs
// 【蕾姆的复制脚本】将 preload.cjs 复制到 dist-electron 目录
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'electron', 'preload.cjs');
const targetPath = path.join(__dirname, '..', 'dist-electron', 'preload.cjs');

console.log('🎯 蕾姆：正在复制 preload.cjs...');
console.log('  源文件:', sourcePath);
console.log('  目标文件:', targetPath);

// 确保目标目录存在
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制文件
fs.copyFileSync(sourcePath, targetPath);
console.log('✅ 蕾姆：preload.cjs 复制完成！');
