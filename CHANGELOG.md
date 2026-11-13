# Changelog

## 1.0.1 — 2026-11-13

- 修复收起范围：仅隐藏输入卡片，保留 `conversation.composer.dock` 中的插件和上下文表。
- 语言字典改为 effect 管理，停用时清理，避免重新启用或热重载时重复注册失败。
- 修复手势取消后吞掉下次键盘点击；只处理当前指针的取消事件。
- 补充兼容性复查结果、中文搜索名称与版本发布建议。

Hide only the composer card, preserve sibling dock extensions, dispose locale dictionaries, and reset canceled pointer gestures without swallowing the next keyboard click. These changes were checked against the rc.5 host source; browser interaction testing remains pending.

## 1.0.0 — 2026-11-13

- 首次整理为独立 Git 发布目录，保留原有 `@local/dsh-composer-drawer` 包名、模块 id 和 `local-composer-drawer` 插件行 id。
- 保留点击、拖动、方向键切换输入框以及切换会话恢复展开的现有行为；运行时代码和原始图标未修改。
- 补齐 gaoerge / MIT 署名、GitHub 仓库信息、中英文说明与明确的打包清单。
- DSH 兼容声明精确限定为 `0.2.1-rc.5`；记录内部 DOM / CSS 依赖。
- 添加不依赖第三方库的发布资源验证脚本。真实截图另行补充。

Initial standalone Git release preparation. Runtime behavior and original icon retained; bilingual documentation, MIT metadata, explicit packing rules, and built-in Node.js release checks added. DSH compatibility is limited to `0.2.1-rc.5`.
