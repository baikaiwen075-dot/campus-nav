"use client";

import { useEffect, useMemo, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { ArrowUpRight, Command, Search } from "lucide-react";
import { sites } from "@/data/sites";
import { groupByCategory } from "@/lib/site-utils";
import { recordBookmarkLinkClick } from "@/lib/use-bookmark-link-emotions";
import type { Site } from "@/lib/types";

function openSite(site: Site) {
  recordBookmarkLinkClick(site.url);
  window.open(site.url, "_blank", "noopener,noreferrer");
}

const shortcutKey = "B";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const groupedSites = useMemo(() => groupByCategory(sites), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === shortcutKey.toLowerCase()
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelect(site: Site) {
    openSite(site);
    setOpen(false);
  }

  return (
    <CommandPrimitive.Dialog
      open={open}
      onOpenChange={setOpen}
      label="全局快捷命令面板"
      loop
      overlayClassName="fixed inset-0 z-50 bg-zinc-950/28 backdrop-blur-sm dark:bg-black/48"
      contentClassName="fixed left-1/2 top-[14vh] z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white/96 shadow-soft backdrop-blur-xl dark:bg-zinc-950/96"
      className="bg-transparent text-ink dark:text-zinc-50"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="h-5 w-5 shrink-0 text-zinc-400" />
        <CommandPrimitive.Input
          autoFocus
          placeholder="搜索网站名称、描述或分类..."
          className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
        />
        <div className="hidden items-center gap-1 rounded-lg border border-line bg-zinc-50 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 sm:flex">
          <Command className="h-3.5 w-3.5" />
          {shortcutKey}
        </div>
      </div>

      <CommandPrimitive.List className="max-h-[62vh] overflow-y-auto p-2 thin-scrollbar">
        <CommandPrimitive.Empty className="px-3 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          没有找到匹配的网站
        </CommandPrimitive.Empty>

        {groupedSites.map((group) => (
          <CommandPrimitive.Group
            key={group.category}
            heading={group.category}
            className="py-1 text-zinc-500 dark:text-zinc-400 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
          >
            {group.sites.map((site) => (
              <CommandPrimitive.Item
                key={site.id}
                value={site.id}
                keywords={[
                  site.name,
                  site.description,
                  site.category,
                  site.group,
                  site.studentFit,
                  ...site.tags
                ]}
                onSelect={() => handleSelect(site)}
                className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-ink outline-none transition aria-selected:bg-zinc-100 data-[selected=true]:bg-zinc-100 dark:text-zinc-50 dark:aria-selected:bg-zinc-900 dark:data-[selected=true]:bg-zinc-900"
              >
                <div className="min-w-0 text-left">
                  <div className="truncate font-medium">{site.name}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {site.description}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-400">
                  <span className="hidden rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900 sm:inline">
                    {site.access}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.Group>
        ))}
      </CommandPrimitive.List>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span>↑ ↓ 选择</span>
        <span>Enter 打开 · Esc 关闭 · Ctrl / ⌘ + {shortcutKey}</span>
      </div>
    </CommandPrimitive.Dialog>
  );
}
