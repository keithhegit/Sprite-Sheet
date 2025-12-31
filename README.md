# 🎭 OgSprite - AI 精灵图生成器

<div align="center">
  <img width="1200" height="auto" alt="OgSprite Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <p><em>基于 Google Gemini 的高性能像素艺术精灵图生成工具</em></p>
</div>

---

## ✨ 核心功能

- **🎨 AI 智能生成**：上传角色图，自动生成 4x4（16帧）精灵图序列
- **🔄 多动作支持**：奔跑、行走、待机、攻击、受击、跳跃等，支持自定义 Prompt
- **🎞️ 实时预览**：内置 Canvas 播放器，可调节 FPS 和背景颜色
- **✂️ 交互式编辑**：点击屏蔽"坏帧"，自动从预览和导出中排除
- **💾 多格式导出**：PNG 精灵图、GIF 动画
- **📚 历史记录**：自动保存生成历史，云端存储
- **👤 用户系统**：邮箱登录，数据隔离

---

## 🛠️ 技术栈

**前端**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand

**后端**: Cloudflare Workers + Hono + D1 (SQLite) + R2 存储

**AI 模型**: Google Gemini 3.0 Pro

---

## 🚀 快速开始

### 本地开发

#### 1. 安装依赖

```bash
# 前端
npm install

# 后端
cd api && npm install && cd ..
```

#### 2. 初始化数据库

```bash
cd api
npx wrangler d1 execute sprite_sheet --local --file=schema.sql
```

#### 3. 启动服务

**终端 1 - 后端**：

```bash
cd api
npx wrangler dev
```

等待显示 `Ready on http://localhost:8787`

**终端 2 - 前端**（新开终端）：

```bash
npm run dev
```

等待显示 `Local: http://localhost:3000/`

#### 4. 访问应用

打开浏览器：**http://localhost:3000**

#### 5. 测试流程

1. 注册账号（邮箱必须以 `@ogcloud.com` 结尾）
2. 设置 Gemini API Key（[获取地址](https://aistudio.google.com/app/apikey)）
3. 上传图片，生成精灵图

---

## ☁️ 部署到 Cloudflare

完整的图形化界面部署指南：**[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)**

### 部署步骤概览

```
1. 推送代码到 GitHub
   ↓
2. 创建 D1 数据库（Dashboard 操作）
   ↓
3. 创建 R2 存储桶（Dashboard 操作）
   ↓
4. 部署 Worker API（Wrangler CLI 或 Dashboard）
   ↓
5. 部署前端到 Pages（Dashboard 连接 Git）
   ↓
6. 配置路由和环境变量
   ↓
7. 完成！访问 https://your-app.pages.dev
```

**详细步骤请查看 [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)**

---

## 📂 项目结构

```
OgSprite/
├── api/                          # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts              # 入口文件
│   │   ├── routes/               # API 路由
│   │   │   ├── auth.ts           # 认证（邮箱密码登录）
│   │   │   ├── history.ts        # 历史记录
│   │   │   └── upload.ts         # 图片上传
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT 认证
│   │   └── utils/
│   │       └── jwt.ts            # JWT 工具
│   ├── schema.sql                # 数据库建表语句
│   ├── wrangler.toml             # Workers 配置
│   └── package.json
│
├── components/                   # React 组件
│   ├── GeneratorPage.tsx         # 生成器主页
│   ├── auth/                     # 认证组件
│   ├── history/                  # 历史记录
│   └── settings/                 # 设置页面
│
├── services/                     # 服务层
│   ├── geminiService.ts          # Gemini API
│   ├── authService.ts            # 认证服务
│   ├── historyService.ts         # 历史记录
│   └── uploadService.ts          # 上传服务
│
├── stores/                       # Zustand 状态管理
│   └── userStore.ts
│
├── App.tsx                       # 应用入口
├── index.tsx                     # ReactDOM 挂载
├── vite.config.ts                # Vite 配置
└── README.md                     # 本文件
```

---

## 🎯 使用说明

### 生成精灵图

1. **上传图片**：拖拽或点击上传角色参考图
2. **选择动作**：单选或多选（支持快捷预设）
3. **生成**：点击"开始生成"，AI 自动创建精灵图
4. **预览**：实时播放动画，调节 FPS 和背景
5. **编辑**：点击帧缩略图屏蔽坏帧
6. **导出**：下载 PNG 或 GIF

### 历史记录

- 所有生成自动保存到云端
- 按时间倒序查看
- 支持删除（同时删除云端图片）

---

## 🔐 认证说明

- **注册/登录**：仅支持 `@ogcloud.com` 邮箱域
- **密码要求**：至少 6 位字符
- **JWT 认证**：Token 本地存储，有效期 7 天
- **数据隔离**：每个用户只能访问自己的历史记录

---

## 📊 免费额度（Cloudflare）

| 资源 | 免费额度 | 说明 |
|------|---------|------|
| Workers | 100,000 次请求/天 | API 调用 |
| D1 数据库 | 5M 读取/天，100K 写入/天 | 用户和历史记录 |
| R2 存储 | 10 GB 存储，1M 操作/月 | 图片存储 |
| Pages | 无限次构建 | 前端托管 |

对于个人项目和小团队完全够用！

---

## 🤝 贡献

欢迎 PR 和 Issue！

---

## 📝 开源协议

MIT License
