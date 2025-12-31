# 🚀 Cloudflare 部署指南（图形化界面）

本指南将带你通过 **Cloudflare Dashboard（图形化界面）** 完成整个部署流程。

---

## 📋 准备工作

### 需要的账号

- ✅ [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费套餐即可）
- ✅ [GitHub 账号](https://github.com/)（用于托管代码）
- ✅ [Google AI Studio](https://aistudio.google.com/)（可选，用于获取 Gemini API Key）

### 免费额度说明

Cloudflare 免费套餐完全够用：
- **Workers**: 100,000 次请求/天
- **D1 数据库**: 5M 次读取/天，100K 次写入/天
- **R2 存储**: 10 GB 免费存储，1M 次操作/月
- **Pages**: 无限次构建

---

## 📦 第一步：推送代码到 GitHub

### 1. 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 填写仓库名称（例如：`Sprite-Sheet`）
3. 选择 **Public** 或 **Private**
4. **不要**勾选任何初始化选项（README、.gitignore 等）
5. 点击 **Create repository**

### 2. 推送本地代码

在项目根目录执行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/keithhegit/Sprite-Sheet.git
git push -u origin main
```

---

## 🗄️ 第二步：创建 D1 数据库

### 1. 打开 D1 控制台

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **Workers & Pages**
3. 点击顶部 **D1 SQL Database** 标签

### 2. 创建数据库

1. 点击右上角 **Create database** 按钮
2. **Database name** 填写：`ogsprite-db`
3. **Location** 选择：**Automatic**（或选择离你最近的区域）
4. 点击 **Create**

### 3. 复制数据库 ID

创建成功后，你会看到：

```
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**重要**：复制这个 ID，稍后需要用到。

### 4. 初始化数据库表

1. 在数据库详情页，点击 **Console** 标签
2. 点击 **Run SQL** 按钮
3. 打开你项目中的 `api/schema.sql` 文件，复制全部内容
4. 粘贴到 SQL 编辑器
5. 点击 **Execute** 执行

执行成功后，点击 **Tables** 标签，应该能看到 3 个表：
- `users`
- `generation_history`
- `sprite_results`

---

## 📦 第三步：创建 R2 存储桶

### 1. 打开 R2 控制台

1. 在 Cloudflare Dashboard 左侧菜单选择 **R2**
2. 如果是首次使用，需要先激活 R2（点击 **Purchase R2 Plan**，选择免费套餐）

### 2. 创建存储桶

1. 点击右上角 **Create bucket** 按钮
2. **Bucket name** 填写：`ogsprite-images`
3. **Location** 选择：**Automatic**
4. 点击 **Create bucket**

---

## 🔐 第四步：配置 Worker 环境变量

### 1. 修改 `wrangler.toml`

在项目中打开 `api/wrangler.toml` 文件，找到以下行：

```toml
database_id = "local-dev-db"
```

替换为你在**第二步**复制的真实 D1 数据库 ID：

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

保存文件并推送到 GitHub：

```bash
git add api/wrangler.toml
git commit -m "配置生产数据库 ID"
git push
```

### 2. 生成 JWT 密钥

打开终端，运行以下命令生成一个安全的随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

输出示例：

```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**重要**：复制这个密钥，稍后需要用到。

---

## ⚙️ 第五步：部署后端 API（Worker）

### 1. 创建 Worker

1. 在 Cloudflare Dashboard 左侧菜单选择 **Workers & Pages**
2. 点击右上角 **Create** 按钮
3. 选择 **Create Worker**
4. **Worker name** 填写：`ogsprite-api`
5. 点击 **Deploy**（先部署，稍后上传代码）

### 2. 连接 GitHub（自动部署）

#### 方案 A：使用 Wrangler CLI（推荐）

在项目的 `api` 目录下执行：

```bash
cd api
npm install
npx wrangler deploy
```

首次部署会提示登录 Cloudflare，按提示操作即可。

部署成功后，会显示 Worker URL：

```
https://ogsprite-api.your-subdomain.workers.dev
```

**复制这个 URL**，稍后配置前端时需要用到。

#### 方案 B：手动上传代码

1. 在 `api` 目录执行 `npm run build`（如果有构建脚本）
2. 在 Worker 详情页点击 **Quick Edit**
3. 复制 `api/src/index.ts` 的内容并粘贴
4. 点击 **Save and Deploy**

### 3. 绑定 D1 数据库

1. 在 Worker 详情页，点击 **Settings** 标签
2. 找到 **Bindings** 部分，点击 **Add binding**
3. 选择 **D1 database**
4. **Variable name** 填写：`DB`
5. **D1 database** 选择：`ogsprite-db`
6. 点击 **Save**

### 4. 绑定 R2 存储桶

1. 同样在 **Bindings** 部分，点击 **Add binding**
2. 选择 **R2 bucket**
3. **Variable name** 填写：`R2`
4. **R2 bucket** 选择：`ogsprite-images`
5. 点击 **Save**

### 5. 设置环境变量和 Secrets

1. 在 Worker 的 **Settings** 标签中，找到 **Variables** 部分

#### 添加公开变量

点击 **Add variable**：

| Variable name | Value |
|--------------|-------|
| `FRONTEND_URL` | `http://localhost:5173`（暂时填本地地址，部署 Pages 后再修改） |

#### 添加 Secret（加密变量）

点击 **Add variable**，勾选 **Encrypt**：

| Variable name | Value |
|--------------|-------|
| `JWT_SECRET` | 粘贴**第四步**生成的 JWT 密钥 |

保存后，点击页面右上角 **Save and Deploy**。

### 6. 验证 Worker 部署

访问以下地址验证 API 是否正常运行：

```
https://ogsprite-api.your-subdomain.workers.dev/api/health
```

应该返回：

```json
{
  "status": "ok",
  "timestamp": 1234567890123
}
```

---

## 🌐 第六步：部署前端（Pages）

### 1. 创建 Pages 项目

1. 在 Cloudflare Dashboard 左侧菜单选择 **Workers & Pages**
2. 点击右上角 **Create** 按钮
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 2. 连接 GitHub 仓库

1. 选择 **GitHub**
2. 首次使用需要授权 Cloudflare 访问 GitHub（点击 **Connect GitHub**）
3. 在弹窗中选择你的仓库（`Sprite-Sheet`）
4. 点击 **Install & Authorize**

### 3. 配置构建设置

在配置页面填写：

| 设置项 | 值 |
|--------|-----|
| **Project name** | `ogsprite`（或自定义） |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

### 4. 配置环境变量（可选）

在 **Environment variables** 部分，可以添加：

| Variable name | Value |
|--------------|-------|
| `VITE_GEMINI_API_KEY` | 留空（用户可在前端界面输入） |

### 5. 开始部署

点击 **Save and Deploy**。

Cloudflare 会自动：
1. 克隆你的 GitHub 仓库
2. 安装依赖（`npm install`）
3. 执行构建命令（`npm run build`）
4. 部署到 CDN

部署通常需要 2-5 分钟。完成后会显示：

```
Success! Your project is deployed to:
https://ogsprite.pages.dev
```

**复制这个 URL**。

---

## 🔗 第七步：连接前后端

### 1. 配置 Pages 路由到 Worker

为了让前端的 `/api/*` 请求能够访问后端 Worker，需要创建一个路由文件。

#### 方法：使用 Pages Functions

在项目根目录创建 `functions/_middleware.ts` 文件：

```typescript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/')) {
    const workerUrl = (context.env?.WORKER_API_URL || '').toString().replace(/\\/$/, '');
    if (!workerUrl) return new Response('WORKER_API_URL is not set', { status: 500 });
    return fetch(new Request(workerUrl + url.pathname + url.search, context.request));
  }
  return context.next();
}
```

**重要**：需要在 Pages 的环境变量中设置 `WORKER_API_URL` 为你在**第五步**获得的 Worker URL（例如：`https://ogsprite-api.your-subdomain.workers.dev`）。

保存后推送到 GitHub：

```bash
git add functions/_middleware.ts
git commit -m "配置 API 路由"
git push
```

Pages 会自动重新部署。

### 2. 更新 Worker 的 FRONTEND_URL

1. 回到 Worker 的 **Settings** → **Variables**
2. 编辑 `FRONTEND_URL` 变量
3. 修改为你的 Pages 域名：`https://ogsprite.pages.dev`
4. 点击 **Save and Deploy**

---

## ✅ 第八步：测试完整流程

### 1. 访问应用

打开浏览器，访问你的 Pages 域名：

```
https://ogsprite.pages.dev
```

### 2. 注册账号

1. 点击右上角 **"登录 / 注册"**
2. 输入邮箱（必须以 `@ogcloud.com` 结尾）
   - 示例：`test@ogcloud.com`
3. 输入密码（至少 6 位）
4. 点击 **"注册账号"**

### 3. 测试核心功能

- ✅ 设置 Gemini API Key（如果需要）
- ✅ 上传图片
- ✅ 生成精灵图
- ✅ 查看历史记录
- ✅ 删除历史记录

### 4. 验证数据存储

#### 查看 D1 数据库

1. 进入 **D1** → 选择 `ogsprite-db`
2. 点击 **Console** 标签
3. 运行 SQL 查询：

```sql
SELECT COUNT(*) FROM users;
```

应该能看到注册的用户数量。

#### 查看 R2 存储

1. 进入 **R2** → 选择 `ogsprite-images`
2. 点击 **Browse** 标签
3. 应该能看到上传的图片文件

---

## 🎯 常见问题排查

### 问题 1：前端访问 API 报 404

**原因**：Pages 路由未配置或 `_middleware.ts` 中的 Worker URL 错误。

**解决**：
1. 检查 `functions/_middleware.ts` 文件是否存在且已推送到 GitHub
2. 确认文件中的 Worker URL 正确
3. 在 Pages 部署日志中确认 Functions 已部署

### 问题 2：注册时提示"该邮箱已被注册"

**原因**：本地测试时已创建过该用户，数据同步到了生产数据库。

**解决**：
- 使用不同的邮箱注册
- 或者清空 D1 数据库：进入 D1 Console 执行 `DELETE FROM users;`

### 问题 3：图片上传后无法显示

**原因**：R2 Bucket 权限或 Worker 绑定问题。

**解决**：
1. 确认 Worker 的 Bindings 中 R2 变量名为 `R2`
2. 确认 R2 Bucket 名称为 `ogsprite-images`
3. 检查 Worker 日志（Settings → Logs）查看错误信息

### 问题 4：CORS 错误

**原因**：Worker 的 CORS 配置未包含 Pages 域名。

**解决**：
检查 `api/src/index.ts` 中的 CORS 配置，确保包含你的 Pages 域名：

```typescript
origin: (origin) => {
  const allowed = [
    'http://localhost:5173',
    'https://ogsprite.pages.dev',  // 添加你的 Pages 域名
  ];
  return allowed.includes(origin) ? origin : allowed[0];
}
```

---

## 📱 绑定自定义域名（可选）

### 1. 在 Pages 绑定域名

1. 进入 Pages 项目详情页
2. 点击 **Custom domains** 标签
3. 点击 **Set up a custom domain**
4. 输入你的域名（例如：`ogsprite.yourdomain.com`）
5. 按提示在你的 DNS 提供商添加 CNAME 记录

### 2. 更新 Worker 的 FRONTEND_URL

绑定成功后，更新 Worker 的 `FRONTEND_URL` 为你的自定义域名。

---

## 🔄 后续更新流程

每次代码更新后：

```bash
git add .
git commit -m "更新说明"
git push
```

- **Pages** 会自动重新构建并部署
- **Worker** 需要手动部署（在 `api` 目录执行 `npx wrangler deploy`）

---

## 📊 监控与管理

### 查看 Worker 日志

1. 进入 Worker 详情页
2. 点击 **Logs** 标签（实时日志）
3. 或点击 **Metrics** 查看请求统计

### 查看 Pages 部署历史

1. 进入 Pages 项目详情页
2. 点击 **Deployments** 标签
3. 可以回滚到任意历史版本

### 监控资源用量

在 Dashboard 首页可以看到：
- Workers 请求数
- D1 读写次数
- R2 存储用量

接近免费额度时，Cloudflare 会发送邮件提醒。

---

## 🎉 完成！

恭喜你成功部署 OgSprite 到 Cloudflare！

你的应用现在运行在全球 CDN 上，具备：
- ⚡ 极速访问（边缘计算）
- 🔒 自动 HTTPS
- 🌍 全球分发
- 💰 零成本（免费额度）

有任何问题，欢迎查阅 [Cloudflare 官方文档](https://developers.cloudflare.com/)。
