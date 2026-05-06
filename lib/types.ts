export type SiteCategory =
  | "学习资源"
  | "AI工具"
  | "视频娱乐"
  | "极客基建与社区"
  | "常用邮箱"
  | "学习与效率"
  | "实用工具"
  | "开发者专区"
  | "设计资源"
  | "娱乐信息"
  | "外网精选"
  | "小众神器";

export type AccessStatus = "国内可用" | "需要代理" | "部分可用";

export type Region = "国内" | "国外";

export type Site = {
  id: string;
  name: string;
  url: string;
  category: SiteCategory;
  group: string;
  tags: string[];
  region: Region;
  access: AccessStatus;
  description: string;
  reason?: string;
  featured?: boolean;
  niche?: boolean;
  studentFit: string;
};

export type Submission = {
  name: string;
  url: string;
  reason: string;
  tags?: string[];
};
