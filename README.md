# DSH 输入框收起插件 · Composer Drawer

<img src="icon.svg" alt="插件图标" width="64" height="64">
![许可证 MIT](https://img.shields.io/badge/license-MIT-green)
![目标 DSH 0.2.1-rc.5](https://img.shields.io/badge/DSH-0.2.1--rc.5-blue)

[English](README.en.md)

给 DeepSeek Harness（DSH）Web 对话输入框增加一个小把手：收起输入框，为阅读留出空间；需要继续输入时再展开。

## 使用方式

- 点击把手切换收起 / 展开。
- 向下拖动把手超过约 18 像素收起；向上拖动超过约 18 像素展开。轻微移动不会切换。
- 把手获得键盘焦点后，按 ↓ 收起、↑ 展开；原生按钮也支持 Enter / 空格。
- 收起通过 CSS 隐藏输入卡片，不主动清空或提交草稿。草稿由 DSH 自身管理，本插件不提供额外备份。
- 切换会话时恢复展开；空白对话页隐藏把手并显示输入框。插件重新挂载后也默认展开。
- 提供中文、英文按钮文案和插件管理元数据。

## 安装

本插件是可直接加载的 JavaScript bundle，无运行时 npm 依赖，无需 `npm install` 或构建。保留包名 `@local/dsh-composer-drawer`、模块 id 和插件行 id `local-composer-drawer`，避免为同一功能创建第二份标识。`private: true` 仅阻止误发布至 npm，不妨碍 Git / 本地目录安装。

推荐打开 DSH Web 侧栏的「插件」页面，安装以下 Git 源，并启用「输入框抽屉」bundle：

```text
github:gaoerge/dsh-composer-drawer#main
```

终端安装语法已在 DSH 0.2.1-rc.5 通过 `dsh plugin --help` 只读核实。目标 profile 为 `web` 时：

```sh
dsh plugin --profile web add "github:gaoerge/dsh-composer-drawer#main"
```

也可先下载仓库，将绝对路径作为安装源：

```sh
dsh plugin --profile web add "C:/path/to/dsh-composer-drawer"
```

将 `web` 替换为实际 profile。安装影响该 profile 的所有会话。完成后在「插件」页面检查 bundle 和插件行已启用；如果安装结果提示需要重启，请重启 DSH 并刷新页面。此仓库没有 `prepare` / 安装脚本，不需要为本插件批准构建脚本。Git 安装需要 Git 和网络；这与插件运行时的网络行为不同。

## 禁用与卸载

在「插件」页面关闭「输入框抽屉」bundle 或禁用 `local-composer-drawer` 行即可暂停功能；移除 bundle 可卸载。CLI 卸载：

```sh
dsh plugin --profile web remove @local/dsh-composer-drawer
```

按操作结果完成必要的重启 / 刷新。不要同时安装更名后的副本；如果先前已有相同本地包，应使用插件管理器处理原安装再切换来源。

## 兼容范围与限制

- 本发布版本仅声明兼容 **DSH 0.2.1-rc.5 Web**，`engines.dsh` 精确限定该版本。没有声明其他 DSH 版本已经验证。发布文件检查不等于 Git 安装或端到端交互测试。
- 使用 `conversation.input.dock` slot、宿主 React / locale 服务和主题 token。
- 收起效果依赖内部 DOM 标记 `[data-composer-seat]`、`[data-composer-card]`、`[data-conversation-content][data-content-phase="blank"]` 以及 CSS `:has()`。这些不是稳定公共布局契约；DSH 页面结构变化或浏览器不支持 `:has()` 时，隐藏效果可能失效。
- 这只是界面显隐功能，不会暂停运行任务、停止模型回复或改变发送逻辑。
- 从 `1.0.1` 起，仅隐藏输入卡片；卡片旁的 `conversation.composer.dock` 插件和上下文表保留。若扩展把控件放进输入卡片内部，它仍会随卡片隐藏。
- 字典随插件生命周期清理，避免停用再启用时重复注册。此修复已对照 rc.5 官方 locale 实现，尚未完成浏览器重启用测试。
- 未发现与轮次导航的选择器交集；它们可分别影响输入卡片和消息区原生导航。改写相同输入 DOM、使用更高优先级 CSS 的插件仍需联合实测。

## 版本与反馈

GitHub Release 不是 Git 安装的前提。本项目目前保持源码发布，待真实浏览器验证后再创建稳定 Release；`#main` 会随提交变化。需要固定版本时，可把安装源的 `#main` 改为 GitHub 提交页面上的完整 SHA。

反馈问题请使用仓库 Issues，附 DSH 与插件版本、浏览器、启用的界面插件及最短复现步骤；不要附访问令牌或私人对话。

## 隐私

按当前 `index.js` / `client.js` 代码核对：插件不主动发网络请求，不写文件、localStorage、sessionStorage、IndexedDB 或其他持久化存储；展开状态和拖动信息只保存在 React 组件内存中。插件不读取或发送草稿正文。DSH 自身的数据保存和网络行为不在此声明范围内。

## 截图

真实截图待补充，当前未展示占位图或模拟截图。

## 开发与发布检查

只需要 Node.js 和 npm（发布整理时使用 Node.js 24），无需安装依赖：

```sh
node --check index.js
node --check client.js
node --check scripts/verify.mjs
node scripts/verify.mjs --readme-links
npm pack --dry-run --ignore-scripts --json
```

验证脚本使用 Node 内置模块，检查清单、exports、bundle patch、locale 元数据、图标、包内路径 / symlink、明确的打包文件规则；可选检查 README 相对链接。`--pack-json <文件>` 可检查 npm dry-run JSON 的实际文件列表。`npm run check` 执行语法与资源检查；它不是 UI 测试，也不复制交互逻辑编造单元测试。验证脚本一并进入安装包，方便检查已下载的资源。当前未附 GitHub Actions workflow，发布前请在本地运行检查。

详细变更见 [CHANGELOG.md](CHANGELOG.md)。代码与原始图标按 [MIT License](LICENSE) 授权，署名 gaoerge。
