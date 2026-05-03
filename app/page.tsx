"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Check,
  Code2,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Globe2,
  Heart,
  Moon,
  Palette,
  Plus,
  Search,
  Sparkles,
  Star,
  Sun,
  Tv,
  Wand2
} from "lucide-react";
import { sites } from "@/data/sites";
import type { Site, SiteCategory } from "@/lib/types";
import {
  accessTone,
  categoryOrder,
  groupByCategory,
  isProbablyUrl,
  normalizeUrl,
  searchSites
} from "@/lib/site-utils";
import clsx from "clsx";

type NavCategory = SiteCategory | "全部";
type SearchEngineId = "google" | "baidu" | "bing" | "github" | "site";

const categoryIcon: Record<SiteCategory, React.ElementType> = {
  学习资源: BookOpen,
  AI工具: Brain,
  实用工具: FileText,
  开发者专区: Code2,
  设计资源: Palette,
  娱乐信息: Tv,
  外网精选: Globe2,
  小众神器: Sparkles
};

const categorySectionId: Record<NavCategory, string> = {
  全部: "page-top",
  学习资源: "category-study",
  AI工具: "category-ai",
  实用工具: "category-tools",
  开发者专区: "category-developer",
  设计资源: "category-design",
  娱乐信息: "category-media",
  外网精选: "category-global",
  小众神器: "category-niche"
};

const searchEngines: Array<{
  id: SearchEngineId;
  label: string;
  placeholder: string;
  buildUrl?: (query: string) => string;
}> = [
  {
    id: "google",
    label: "Google",
    placeholder: "Google 搜索...",
    buildUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: "baidu",
    label: "百度",
    placeholder: "百度搜索...",
    buildUrl: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
  },
  {
    id: "bing",
    label: "Bing",
    placeholder: "Bing 搜索...",
    buildUrl: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: "github",
    label: "GitHub",
    placeholder: "搜索 GitHub 项目、代码或开发资源...",
    buildUrl: (query) => `https://github.com/search?q=${encodeURIComponent(query)}`
  },
  {
    id: "site",
    label: "站内",
    placeholder: "搜索站内网址，或输入网址直接打开..."
  }
];

const storageKeys = {
  favorites: "campus-nav:favorites",
  recent: "campus-nav:recent",
  quick: "campus-nav:quick",
  theme: "campus-nav:theme"
};

const defaultQuick = ["chatgpt", "kimi", "icourse", "github", "ilovepdf", "today-hot"];

function readList(key: string, fallback: string[]) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState<SearchEngineId>("baidu");
  const [activeCategory, setActiveCategory] = useState<NavCategory>("全部");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [quick, setQuick] = useState<string[]>(defaultQuick);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setFavorites(readList(storageKeys.favorites, []));
    setRecent(readList(storageKeys.recent, []));
    setQuick(readList(storageKeys.quick, defaultQuick));
    const savedTheme = window.localStorage.getItem(storageKeys.theme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(savedTheme ? savedTheme === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem(storageKeys.theme, dark ? "dark" : "light");
  }, [dark]);

  const filteredSites = useMemo(() => {
    const categoryFiltered =
      activeCategory === "全部"
        ? sites
        : sites.filter((site) => site.category === activeCategory);

    return searchSites(categoryFiltered, selectedSearchEngine === "site" ? query : "");
  }, [activeCategory, query, selectedSearchEngine]);

  const selectedEngine =
    searchEngines.find((engine) => engine.id === selectedSearchEngine) ?? searchEngines[0];

  const quickSites = useMemo(
    () => quick.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[],
    [quick]
  );

  const favoriteSites = useMemo(
    () => favorites.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[],
    [favorites]
  );

  const recentSites = useMemo(
    () => recent.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[],
    [recent]
  );

  const featuredAI = sites.filter((site) => site.category === "AI工具" && site.featured);
  const globalPicks = sites.filter((site) => site.category === "外网精选");
  const nicheTools = sites.filter((site) => site.niche || site.category === "小众神器");

  function rememberVisit(site: Site) {
    const next = [site.id, ...recent.filter((id) => id !== site.id)].slice(0, 8);
    setRecent(next);
    writeList(storageKeys.recent, next);
  }

  function openSite(site: Site) {
    rememberVisit(site);
    window.open(site.url, "_blank", "noopener,noreferrer");
  }

  function toggleFavorite(site: Site) {
    const next = favorites.includes(site.id)
      ? favorites.filter((id) => id !== site.id)
      : [site.id, ...favorites].slice(0, 60);
    setFavorites(next);
    writeList(storageKeys.favorites, next);
  }

  function toggleQuick(site: Site) {
    const next = quick.includes(site.id)
      ? quick.filter((id) => id !== site.id)
      : [...quick, site.id].slice(0, 10);
    setQuick(next);
    writeList(storageKeys.quick, next);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    if (selectedEngine.id !== "site" && selectedEngine.buildUrl) {
      window.open(selectedEngine.buildUrl(keyword), "_blank", "noopener,noreferrer");
      return;
    }

    if (isProbablyUrl(keyword)) {
      window.open(normalizeUrl(keyword), "_blank", "noopener,noreferrer");
      return;
    }

    const exact = filteredSites.find(
      (site) => site.name.toLowerCase() === keyword.toLowerCase()
    );
    if (exact) openSite(exact);
  }

  function scrollToCategory(category: NavCategory) {
    setActiveCategory(category);

    window.setTimeout(() => {
      const target =
        document.getElementById(categorySectionId[category]) ??
        document.getElementById("category-directory");
      target?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  return (
    <main
      id={categorySectionId["全部"]}
      className="min-h-screen bg-mist text-ink transition-colors dark:bg-zinc-950 dark:text-zinc-50"
    >
      <header className="sticky top-0 z-30 border-b border-line bg-white/86 backdrop-blur-xl dark:bg-zinc-950/86">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1 text-left"
            onClick={() => {
              setActiveCategory("全部");
              setQuery("");
            }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
              <Compass className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4">CampusNav</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">学生效率入口</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              onClick={() =>
                window.open("https://wj.qq.com/s2/26537466/a29d/", "_blank", "noopener,noreferrer")
              }
              title="投稿"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              onClick={() => setDark((value) => !value)}
              title={dark ? "浅色模式" : "深色模式"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            精选学习、AI、开发和小众效率工具
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
            大学生的一站式效率导航
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
            搜工具、直达网址、收藏常用入口，并快速判断外网工具是否适合当前网络环境。
          </p>

          <form onSubmit={handleSearch} className="mt-8">
            <div className="mb-2 flex flex-wrap justify-center gap-1.5">
              {searchEngines.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setSelectedSearchEngine(engine.id)}
                  className={clsx(
                    "focus-ring h-8 rounded-lg px-3 text-sm font-medium transition",
                    selectedSearchEngine === engine.id
                      ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
                      : "text-zinc-500 hover:bg-white hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  )}
                >
                  {engine.label}
                </button>
              ))}
            </div>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-soft dark:bg-zinc-900">
              <Search className="h-5 w-5 shrink-0 text-zinc-400" />
              <input
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={selectedEngine.placeholder}
              />
              <button className="focus-ring hidden rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-ink sm:inline-flex">
                搜索
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
          {(["全部", ...categoryOrder] as const).map((category) => {
            const Icon = category === "全部" ? Compass : categoryIcon[category];
            return (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={clsx(
                  "focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition",
                  activeCategory === category
                    ? "border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink"
                    : "border-line bg-white text-zinc-600 hover:text-ink dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {category}
              </button>
            );
          })}
        </div>

        <QuickPanel
          quickSites={quickSites}
          favoriteSites={favoriteSites}
          recentSites={recentSites}
          onOpen={openSite}
        />

        <SpotlightSection
          id={categorySectionId["AI工具"]}
          title="AI 工具专栏"
          eyebrow="高频刚需"
          icon={Brain}
          sites={featuredAI}
          favorites={favorites}
          quick={quick}
          onOpen={openSite}
          onFavorite={toggleFavorite}
          onQuick={toggleQuick}
        />

        <SpotlightSection
          id={categorySectionId["外网精选"]}
          title="外网精选"
          eyebrow="可用性标注"
          icon={Globe2}
          sites={globalPicks}
          favorites={favorites}
          quick={quick}
          onOpen={openSite}
          onFavorite={toggleFavorite}
          onQuick={toggleQuick}
        />

        <SpotlightSection
          id={categorySectionId["小众神器"]}
          title="小众神器"
          eyebrow="冷门但好用"
          icon={Wand2}
          sites={nicheTools}
          favorites={favorites}
          quick={quick}
          onOpen={openSite}
          onFavorite={toggleFavorite}
          onQuick={toggleQuick}
          showReason
        />

        <section id="category-directory" className="mt-10 scroll-mt-28">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Directory
              </p>
              <h2 className="mt-1 text-2xl font-semibold">分类导航</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {filteredSites.length} 个结果
            </p>
          </div>

          <div className="space-y-8">
            {groupByCategory(filteredSites).map((group) => {
              const Icon = categoryIcon[group.category];
              return (
                <div
                  key={group.category}
                  id={categorySectionId[group.category]}
                  className="scroll-mt-28"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-zinc-700 ring-1 ring-line dark:bg-zinc-900 dark:text-zinc-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold">{group.category}</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.sites.map((site) => (
                      <SiteCard
                        key={site.id}
                        site={site}
                        favorite={favorites.includes(site.id)}
                        quick={quick.includes(site.id)}
                        onOpen={openSite}
                        onFavorite={toggleFavorite}
                        onQuick={toggleQuick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <footer className="border-t border-line px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        CampusNav 数据可通过 <code className="rounded bg-white px-1.5 py-0.5 dark:bg-zinc-900">/api/sites</code> 访问，后续可接入登录、审核后台和开放 API。
      </footer>

    </main>
  );
}

function QuickPanel({
  quickSites,
  favoriteSites,
  recentSites,
  onOpen
}: {
  quickSites: Site[];
  favoriteSites: Site[];
  recentSites: Site[];
  onOpen: (site: Site) => void;
}) {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">常用快捷入口</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickSites.map((site) => (
            <button
              key={site.id}
              onClick={() => onOpen(site)}
              className="focus-ring flex h-14 items-center justify-between rounded-lg border border-line px-3 text-left transition hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{site.name}</span>
                <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {site.group}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-semibold">收藏 / 最近访问</h2>
          </div>
          <Download className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...favoriteSites, ...recentSites]
            .filter((site, index, arr) => arr.findIndex((item) => item.id === site.id) === index)
            .slice(0, 8)
            .map((site) => (
              <button
                key={site.id}
                onClick={() => onOpen(site)}
                className="focus-ring rounded-lg border border-line px-2.5 py-1.5 text-xs text-zinc-600 hover:text-ink dark:text-zinc-300 dark:hover:text-white"
              >
                {site.name}
              </button>
            ))}
          {favoriteSites.length === 0 && recentSites.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              打开或收藏网站后，这里会变成你的个人入口。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SpotlightSection({
  id,
  title,
  eyebrow,
  icon: Icon,
  sites: sectionSites,
  favorites,
  quick,
  onOpen,
  onFavorite,
  onQuick,
  showReason = false
}: {
  id: string;
  title: string;
  eyebrow: string;
  icon: React.ElementType;
  sites: Site[];
  favorites: string[];
  quick: string[];
  onOpen: (site: Site) => void;
  onFavorite: (site: Site) => void;
  onQuick: (site: Site) => void;
  showReason?: boolean;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-28">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-zinc-700 ring-1 ring-line dark:bg-zinc-900 dark:text-zinc-200">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {eyebrow}
          </p>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sectionSites.map((site) => (
          <SiteCard
            key={`${title}-${site.id}`}
            site={site}
            favorite={favorites.includes(site.id)}
            quick={quick.includes(site.id)}
            onOpen={onOpen}
            onFavorite={onFavorite}
            onQuick={onQuick}
            showReason={showReason}
          />
        ))}
      </div>
    </section>
  );
}

function SiteCard({
  site,
  favorite,
  quick,
  onOpen,
  onFavorite,
  onQuick,
  showReason = false
}: {
  site: Site;
  favorite: boolean;
  quick: boolean;
  onOpen: (site: Site) => void;
  onFavorite: (site: Site) => void;
  onQuick: (site: Site) => void;
  showReason?: boolean;
}) {
  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={() => onOpen(site)}
            className="focus-ring group flex max-w-full items-center gap-1 rounded text-left"
          >
            <h3 className="truncate text-base font-semibold">{site.name}</h3>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
          </button>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {site.category} · {site.group}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onFavorite(site)}
            className={clsx(
              "focus-ring grid h-8 w-8 place-items-center rounded-lg border border-line",
              favorite ? "bg-rose-50 text-rose-600 dark:bg-rose-400/10" : "text-zinc-400"
            )}
            title={favorite ? "取消收藏" : "收藏"}
          >
            <Heart className={clsx("h-4 w-4", favorite && "fill-current")} />
          </button>
          <button
            onClick={() => onQuick(site)}
            className={clsx(
              "focus-ring grid h-8 w-8 place-items-center rounded-lg border border-line",
              quick ? "bg-amber-50 text-amber-600 dark:bg-amber-400/10" : "text-zinc-400"
            )}
            title={quick ? "移出首页快捷" : "加入首页快捷"}
          >
            {quick ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-zinc-600 dark:text-zinc-300">
        {site.description}
      </p>
      {showReason && site.reason && (
        <p className="mt-2 rounded-lg bg-zinc-50 p-2 text-xs leading-5 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
          {site.reason}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "rounded-full px-2 py-1 text-xs ring-1",
            accessTone[site.access]
          )}
        >
          {site.access === "国内可用" ? "✅ " : site.access === "需要代理" ? "⚠️ " : "◐ "}
          {site.access}
        </span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {site.region}
        </span>
        {site.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{site.studentFit}</p>
    </article>
  );
}
