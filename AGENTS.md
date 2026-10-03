# AGENTS.md — 优道管理端（jjf-fronted-admin，PC 管理端）

> 项目中文名：**优道**（英文/包名前缀 `jjf`）。

## ⚠️ 最重要的规则：Ant Design 知识

**阅读 https://ant.design/llms-full.txt 并理解 Ant Design 组件库，在编写 Ant Design 代码时使用这些知识。**

- 在编写任何涉及 Ant Design 的代码（组件用法、Props、表单 Form、表格 Table、主题 ConfigProvider、国际化等）之前，**先抓取并通读 `https://ant.design/llms-full.txt`**（Ant Design 官方为 LLM 提供的完整文档全文），再动手写代码。
- 该文件包含所有组件的权威 API、最佳实践与版本差异；**不要凭记忆猜测组件 API 或 Props 名称**，一切以 `llms-full.txt` 中的内容为准。
- 推荐做法：

  ```bash
  curl -s https://ant.design/llms-full.txt -o /tmp/ant-design-llms-full.txt
  # 然后按需检索相关章节（组件名、API 名）再阅读
  grep -n "Table" /tmp/ant-design-llms-full.txt | head
  ```

- 若内容过长无法一次读完，可先检索（grep）与当前任务相关的组件章节精读，但**每次会话至少执行一次上述获取动作**，确保知识来自官方最新文档而非过期记忆。

## ⚠️ ProComponents（中后台组件）

**中后台页面优先使用 ProComponents，而不是从零写 CRUD/表格/表单。**

- 文档（必读）：**https://pro-components.antdigital.dev/**
- 参考项目（最佳实践范例）：**https://github.com/ant-design/ant-design-pro.git** —— 官方中后台脚手架，遇到布局、权限、菜单、表格页、表单页怎么组织的问题，先看它的实现再动手。

### 版本与兼容（重要）

- 本项目安装的是 `@ant-design/pro-components@3.1.15-3`（3.x 线，npm `latest` 标签仍是 2.8.10，别装错），peer 要求 `antd ^6`，与本项目 `antd@6.x` 匹配。
- **2.x 只支持 antd 5，3.x 才支持 antd 6**；升级/降级 antd 时必须同步调整 pro-components 版本。
- 3.x 目前仍是 `beta` 发布节奏，无 stable 3.x；锁文件已锁定 `3.1.15-3`，升级前先查 peerDependencies。

### 使用规范

- 常用组件与文档章节对应：`ProTable`（表格+检索）、`ProForm` 系列（表单）、`ProLayout`（页面布局）、`ProDescriptions`、`ModalForm`/`DrawerForm`。
- 写代码前先到文档站查该组件的 Props 与示例，**不要凭记忆猜 API**（与 Ant Design 规则一致）。
- 项目模板/页面组织方式参考 ant-design-pro 仓库（路由、菜单、权限、请求封装的惯例），但**只借鉴结构与写法，不整体拷贝脚手架**（本项目路由已定为 TanStack Router）。
- 入口：`import { ProTable, ... } from '@ant-design/pro-components'`；按需引入具体子包（如 `@ant-design/pro-table`）非必要不用。

## ⚠️ 线上 API 文档（Swagger / OpenAPI）

**接口的唯一权威来源：https://dev-1.ydndd.com/v3/api-docs**

- 这是线上环境（dev-1）的 **OpenAPI 3.1 规范**（springdoc 生成，标题 `Youdao API`，约 170KB JSON），含全部接口路径、请求/响应 Schema、枚举与认证方式（`bearerAuth` JWT）。
- **编写任何接口调用代码前，先抓取该文档并检索相关接口**，不要凭记忆猜测 URL、参数名、字段类型或响应结构：

  ```bash
  curl -s https://dev-1.ydndd.com/v3/api-docs -o /tmp/yd-api-docs.json
  # 按接口名/路径/模型名检索
  grep -o '"/[^"]*"' /tmp/yd-api-docs.json | sort -u   # 所有接口路径
  python3 -m json.tool /tmp/yd-api-docs.json | grep -A5 "门店"
  ```

- 若需要更可读的界面，可访问 Swagger UI：https://dev-1.ydndd.com/swagger-ui/index.html（如不可用以 `/v3/api-docs` 原文为准）。
- 字段命名、枚举值、必填项等一律以该文档为准；文档与代码/记忆冲突时，**以文档为准**并在提交信息中说明。
- 后续若接入 TypeScript 类型生成（如 `openapi-typescript`），从该 URL 生成类型后即可替代手动检索。

## 项目概述

- 独立 git 子模块（挂载于根仓库 `jjf-fronted` 的 `apps/admin`），远程：`git@github.com:Kexience/youdao-jjf-admin.git`，分支 `main`。
- 技术栈：**React 19 + TypeScript + Vite 8**，`"type": "module"`。
- UI 组件库：**Ant Design**（antd 6.x）+ **ProComponents**（`@ant-design/pro-components` 3.x）——所有 UI 编码遵循上面两个置顶章节的文档阅读规则。

## 常用命令

依赖安装**必须在根仓库目录执行**（yarn workspaces，根 `yarn.lock` 唯一有效）：

```bash
# 根目录
yarn install                # 安装全部依赖
yarn dev:admin              # 开发服务器 :5173
yarn build:admin            # 构建：tsc -b && vite build

# 本模块内
cd apps/admin
yarn dev                    # 等价于 vite
yarn build                  # tsc -b && vite build（类型错误会中断构建）
yarn lint                   # eslint .
yarn preview                # vite preview
```

## 代码约定

- **TypeScript 严格**：`build` 是 `tsc -b && vite build`，任何类型错误都会中断构建；提交前先跑 `yarn build`。
- **组件写法**：函数组件 + 显式 `Props` 类型；不使用 `any`，需要时用 `unknown` 后收窄。
- **Ant Design 使用规范**（前提：已读 `llms-full.txt`）：
  - 优先使用受控属性与官方推荐的组合方式（如 `Form` + `Form.useForm`、`Table` 的 `columns`/`dataSource`）。
  - 表单校验走 `rules` + `Form`，不手写校验状态。
  - 主题/全局配置统一走 `<ConfigProvider>`，不要在局部散写 token 覆盖。
  - 需要日期处理时优先 antd 生态一致的方案，避免混用多套日期库。
- **ProComponents 使用规范**（前提：已读 pro-components 文档站）：
  - 列表页直接用 `ProTable`（`request` + `columns.search`），不要手写 Table + Form 拼检索。
  - 新建/编辑用 `ProForm` 系列 + `ModalForm`/`DrawerForm`，校验走 `rules`。
  - 页面骨架优先 `ProLayout`；与 TanStack Router 的菜单/路由打通参考 ant-design-pro 的做法。
- **Lint**：flat config（`eslint.config.js`），提交前 `yarn lint` 必须通过。
- **路由：TanStack Router（文件式路由）**
  - 路由文件放 `src/routes/`（`__root.tsx` 为根布局，`index.tsx` 为 `/`，其余按路径命名，如 `about.tsx` → `/about`）。
  - 新增页面 = 在 `src/routes/` 加一个文件并 `export const Route = createFileRoute('/path')(...)`；`routeTree.gen.ts` 由 Vite 插件自动生成，**不要手改**（已加入 eslint ignore）。
  - `src/router.tsx` 创建 router 并通过 `declare module '@tanstack/react-router'` 注册类型；入口 `main.tsx` 渲染 `<RouterProvider>`，不要再用根组件直接挂页面。
  - 路由内跳转用 `<Link to="...">` / `useNavigate`，不要用 `<a>`。
  - 依赖：`@tanstack/react-router`（runtime）+ `@tanstack/router-plugin`（devDependency，提供 `tanstackRouter()` Vite 插件）。
- **样式**：跟随现有 `src/index.css` / 组件内样式的既有做法，不引入新的 CSS 方案除非另有约定。

## 目录结构

```
apps/admin/
├── index.html          # Vite 入口 HTML
├── vite.config.ts      # 端口等 dev server 配置
├── tsconfig.*.json     # tsc -b 工程引用（app / node）
├── eslint.config.js    # flat config
├── src/
│   ├── main.tsx          # React 挂载入口（渲染 RouterProvider）
│   ├── router.tsx        # createRouter + 类型注册
│   ├── routeTree.gen.ts  # 路由树（插件自动生成，勿手改）
│   ├── routes/           # 文件式路由（__root.tsx / index.tsx / about.tsx）
│   ├── views/            # 页面组件（被 routes 引用）
│   └── index.css         # 全局样式
└── dist/               # 构建产物（gitignore，勿提交）
```

## Git 工作流（子模块）

```bash
cd apps/admin
git pull
# ...改代码...
yarn lint && yarn build        # 本地校验
git add -A && git commit -m "feat: xxx"
git push
cd ../..                       # 回根仓库更新子模块指针
git add apps/admin
git commit -m "chore: 更新 admin 子模块"
```

- 子模块有新提交后，根仓库必须显式 `git add apps/admin` 才会更新指针。
- 提交信息遵循 Conventional Commits：`feat:` / `fix:` / `chore:` / `docs:`。

## 已知注意事项

- 仓库内自带的 `apps/admin/yarn.lock` 在 workspace 模式下**不生效**（根 `yarn.lock` 唯一有效），待清理。
- 构建产物 `dist/`、`node_modules/` 已在 `.gitignore` 忽略，勿提交。
- 本模块与根仓库规则冲突时，以更具体的本文件为准；根仓库整体约定见 `../../AGENTS.md`。
