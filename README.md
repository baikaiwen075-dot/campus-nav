# CampusNav

面向中国大陆大学生的现代化网址导航工具站，聚焦学习资源、AI 工具、开发者工具、实用小工具、外网精选和小众神器。

## 功能

- 极简首页：搜索框支持站内搜索，也支持输入网址直接跳转。
- 分类导航：学习资源、AI 工具、实用工具、开发者专区、设计资源、娱乐信息。
- 外网精选：为国外优质工具标注 `国内可用`、`部分可用`、`需要代理`。
- 小众神器：给冷门但实用的网站提供推荐理由。
- 个人化：收藏网站、自定义快捷入口、最近访问、深色模式。
- API：`GET /api/sites` 输出导航数据；用户投稿通过第三方表单收集。

## 项目结构

```txt
campus-nav/
├─ app/
│  ├─ api/
│  │  ├─ sites/route.ts       # 导航数据 API
│  ├─ globals.css             # Tailwind 全局样式
│  ├─ layout.tsx              # 页面元数据与根布局
│  └─ page.tsx                # 首页、分类导航、收藏与投稿交互
├─ data/
│  └─ sites.ts                # 示例站点数据
├─ lib/
│  ├─ site-utils.ts           # 搜索、分组、URL 判断等工具函数
│  └─ types.ts                # 数据结构类型
├─ Dockerfile                 # Docker 部署
├─ next.config.mjs
├─ tailwind.config.ts
└─ package.json
```

## 数据结构

```ts
type Site = {
  id: string;
  name: string;
  url: string;
  category:
    | "学习资源"
    | "AI工具"
    | "实用工具"
    | "开发者专区"
    | "设计资源"
    | "娱乐信息"
    | "外网精选"
    | "小众神器";
  group: string;
  tags: string[];
  region: "国内" | "国外";
  access: "国内可用" | "需要代理" | "部分可用";
  description: string;
  reason?: string;
  featured?: boolean;
  niche?: boolean;
  studentFit: string;
};
```

示例：

```json
{
  "id": "chatgpt",
  "name": "ChatGPT",
  "url": "https://chat.openai.com",
  "category": "AI工具",
  "group": "AI对话",
  "tags": ["AI", "对话", "论文", "编程"],
  "region": "国外",
  "access": "需要代理",
  "description": "通用 AI 助手，适合论文梳理、代码解释、英语润色和灵感发散。",
  "studentFit": "课程作业、科研阅读、代码排错"
}
```

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## Vercel 部署

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目并导入仓库。
3. Framework 选择 Next.js，构建命令使用默认 `npm run build`。
4. 部署后可直接访问站点和 `/api/sites`。

## Docker 部署

```bash
docker build -t campus-nav .
docker run -p 3000:3000 campus-nav
```

## 后续产品路线

- 接入 Supabase：站点数据、用户、收藏、投稿审核。
- 增加浏览器插件版：新标签页、快捷键呼出、导入导出收藏。
- 增加智能推荐：基于专业、年级、常用分类推荐工具。
- 开放 API：按分类、标签、访问状态过滤导航数据。
