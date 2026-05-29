# KeyHub

KeyHub 是一个基于 Vue 3 + Tauri 2 的桌面应用，用于集中管理各类 AI Provider 的 API 信息（Key、URL、模型、状态）并支持余额/用量拉取。

## 项目特性

- 分组化管理：支持根分组、子分组、条目结构。
- 条目字段：Provider、网站、API Key、API URL、模型、启用状态等。
- 多值输入：Key / URL / 模型支持多行输入并保存为列表。
- 自动图标：根据 Provider 名称自动匹配常见厂商图标（也支持自定义图标 URL）。
- 详情操作：复制、密钥明文切换、上一条/下一条快速切换。
- 高级配置：可配置余额接口与用量接口 JSON 路径。
- 数据拉取：在详情页点击即可请求余额/用量并展示最近结果。
- 历史存储：拉取结果写入独立数据文件，保留历史记录。
- 配置编辑器：支持直接编辑 JSON、树视图查看、导入/下载配置。
- 界面能力：侧边栏折叠、宽度拖拽、排序模式拖拽重排、浅色/深色/跟随系统主题、中文/英文切换。
- 桌面体验：支持窗口置顶（环境支持时）。

## 技术栈

- 前端：Vue 3、Vite、Naive UI、Vue I18n、vuedraggable
- 桌面：Tauri 2（Rust）
- 包管理：pnpm

## 环境要求

建议版本：

- Node.js 18+
- pnpm 8+
- Rust stable（含 Cargo）
- Tauri 2 构建依赖（按你的系统安装）

如果是首次配置 Tauri 环境，请参考官方文档：
https://tauri.app/start/prerequisites/

## 安装与启动

1. 安装依赖

```bash
pnpm install
```

2. Web 开发模式（仅前端）

```bash
pnpm dev
```

默认端口为 1420（见 vite.config.js）。

3. Tauri 桌面开发模式

```bash
pnpm dev:tauri
```

## 构建

1. 构建前端产物

```bash
pnpm build
```

2. 构建桌面安装包

```bash
pnpm build:tauri
```

## 常用脚本

- pnpm dev：启动 Vite 开发服务
- pnpm build：构建前端
- pnpm preview：预览前端构建
- pnpm dev:tauri：启动 Tauri 开发模式
- pnpm build:tauri：构建 Tauri 应用
- pnpm icon：生成/更新应用图标资源

## 数据文件说明

应用默认读写以下文件：

- ~/.config/keyhub/settings.json：主配置（分组与条目）
- ~/.config/keyhub/data.json：拉取到的余额/用量历史数据

写入采用原子写入策略（临时文件 + rename），降低配置损坏风险。

## 配置结构示例

settings.json 支持数组根结构，或对象结构（{ "groups": [...] }）。

```json
{
  "groups": [
    {
      "type": "subGroup",
      "id": "group-openai",
      "name": "OpenAI",
      "children": [
        {
          "type": "item",
          "id": "item-gpt",
          "name": "Production Key",
          "description": "Main production key",
          "provider": "openai",
          "website": "https://platform.openai.com",
          "api_keys": ["sk-xxx"],
          "api_urls": ["https://api.openai.com/v1"],
          "models": ["gpt-4o", "gpt-4.1"],
          "switch": true,
          "balance_url": "https://example.com/balance",
          "balance_amount_path": "data.total_balance",
          "balance_unit_path": "data.unit",
          "usage_url": "https://example.com/usage",
          "usage_path": "data.usage_5h",
          "usage_week_path": "data.usage_week"
        }
      ]
    }
  ]
}
```

## 安全提示

- settings.json 中包含敏感密钥，请勿提交到公共仓库。
- 如需同步配置，建议自行加密后再存储。
- 调用余额/用量接口时会使用第一条 API Key 作为 Bearer Token。

## 未来规划（草案）

- 首页仪表盘
- 用量分析视图
