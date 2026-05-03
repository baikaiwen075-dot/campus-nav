import type { Site, SiteCategory } from "@/lib/types";

export const categoryOrder: SiteCategory[] = [
  "学习资源",
  "AI工具",
  "实用工具",
  "开发者专区",
  "设计资源",
  "娱乐信息",
  "外网精选",
  "小众神器"
];

export const accessTone = {
  国内可用: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20",
  需要代理: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20",
  部分可用: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20"
} satisfies Record<Site["access"], string>;

export function isProbablyUrl(value: string) {
  const text = value.trim();
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(text);
}

export function normalizeUrl(value: string) {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

export function searchSites(sites: Site[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return sites;

  return sites.filter((site) => {
    const haystack = [
      site.name,
      site.category,
      site.group,
      site.description,
      site.studentFit,
      site.access,
      site.region,
      ...site.tags
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });
}

export function groupByCategory(sites: Site[]) {
  return categoryOrder
    .map((category) => ({
      category,
      sites: sites.filter((site) => site.category === category)
    }))
    .filter((group) => group.sites.length > 0);
}
