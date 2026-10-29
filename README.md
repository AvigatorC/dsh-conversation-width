# dsh-conversation-width

把 DSH（DeepSeek Harness）Web 界面的「对话框」内容列宽度固定下来：可以锁定为像素值，也可以按窗口比例随缩放变化。设置项位于 **设置 → 通用**，紧跟在「字号大小」之后。

仓库：<https://github.com/AvigatorC/dsh-conversation-width> · 版本：v1.0.0 · 许可：MIT

DSH Web UI 的对话内容列默认带左右拖动手柄，宽度记在 `localStorage`。装了本插件后可三选一：

| 模式 | 行为 |
| --- | --- |
| 默认可调 | 完全不干预，保留原生左右拖动 |
| 固定像素 | 锁死为 420–2400px，拖动手柄隐藏 |
| 窗口比例 | 40–100%，随窗口缩放自动跟随 |

数值框支持直接键入（Enter / 失焦提交），悬停或聚焦时出现上下箭头微调（像素 ±10，比例 ±1）。

## 兼容性

在 dsh `0.2.1-rc.3` 上开发与验证。插件不声明 `engines`，因此版本号不会拦截安装；若某个 dsh 版本的会话体没有 `data-conversation-content` 属性，宽度的 CSS 覆盖会**静默失效**（不报错、不影响界面，只是不生效）。

## 安装

本插件**未发布到 npm**，从仓库安装即可：

```powershell
git clone https://github.com/AvigatorC/dsh-conversation-width.git
```

然后把克隆下来的目录作为本地插件装进当前 DSH profile（`plugin_manager` 的 `install_bundle` 接受目录路径），例如让会话里的 Agent 执行：

> 把 `D:\Code\dsh-conversation-width` 装成插件

装好后打开 **设置 → 通用**，在「字号大小」下方选择模式即可。卸载/升级：`git pull` 后刷新窗口（DSH 会热替换插件模块），要移除则用同一个 `plugin_manager` 的 `remove_bundle`。

## 实现要点

- 宽度覆盖作用在会话体已经发布的 CSS 变量 `--dsh-chat-content-width` 上（`!important`），正文列与输入框卡片的 `max-width` 都读它，因此不改动 DSH 组件本身、也不与拖拽逻辑冲突。
- 比例模式读取 DSH 自己写出的 `--dsh-conversation-column-width`，所以是「对话列宽 × N%」，侧栏开合时会跟着自适应。
- 锚点是会话体上的 `data-conversation-content` 属性。若将来 DSH 改名，覆盖会静默失效，只需改 `client.js` 里 `widthCss()` 的选择器。
- 设置行复用官方 `@deepseek-ai/dsh-client-ui-primitives` 的 `Menu` 与箭头图标（与「工作步骤展示」等原生行同款）；该模块不可用时自动退回原生 `select`，不会让行崩掉。

## 存储

`localStorage["dsh.conversationWidth"]`，形如：

```json
{ "mode": "percent", "px": 820, "percent": 72 }
```

想恢复默认，把模式切回「默认可调」即可；清掉这个键等于恢复出厂。

## License

MIT

---

## English

Pins the conversation column of the DeepSeek Harness Web UI to a pixel width, or to a share of the conversation column that follows the window. The setting is a row on **Settings → General**, right after the font-size row.

Developed and verified against dsh `0.2.1-rc.3`. No `engines` requirement is declared, so no version gate blocks installation.

- **Default (draggable)** leaves the shipped drag handles untouched.
- **Fixed pixels** locks 420–2400px and hides the handles.
- **Share of window** uses 40–100% of the conversation column, so it scales with the window.

Type a value directly (Enter or blur commits) or use the hover arrows (step 10px / 1%).

Not published to npm: clone the repository and install that directory as a local bundle through `plugin_manager` (`install_bundle` accepts a directory path). Pull and refresh to upgrade.

Repository: <https://github.com/AvigatorC/dsh-conversation-width>. MIT licensed.
