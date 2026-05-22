"use client";

import { useEffect } from "react";

type LinkEmotionRecord = {
  lastClickedTime: number;
  clickCount: number;
};

type LinkEmotionStore = Record<string, LinkEmotionRecord>;

const STORAGE_KEY = "campus-nav:link-emotions";
const LINK_SELECTOR = "a[href], [data-link-href]";
const DAY_MS = 24 * 60 * 60 * 1000;
const ANXIOUS_AFTER_MS = 3 * DAY_MS;
const RESENTFUL_AFTER_MS = 7 * DAY_MS;
const HAPPY_MS = 680;
const EMOTION_EVENT = "campus-nav:link-emotion-change";
const RESENTFUL_TITLE = "你还记得我吗...";

const happyUntilByHref = new Map<string, number>();

function readStore(): LinkEmotionStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LinkEmotionStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: LinkEmotionStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getElementHref(element: Element) {
  const dataHref = (element as HTMLElement).dataset.linkHref;
  if (dataHref) return dataHref;
  if (element instanceof HTMLAnchorElement) return element.href;
  return null;
}

function setResentfulTitle(element: HTMLElement) {
  if (!element.dataset.originalTitle && element.title && element.title !== RESENTFUL_TITLE) {
    element.dataset.originalTitle = element.title;
  }

  element.title = RESENTFUL_TITLE;
}

function restoreTitle(element: HTMLElement) {
  if (element.title !== RESENTFUL_TITLE) return;

  if (element.dataset.originalTitle) {
    element.title = element.dataset.originalTitle;
  } else {
    element.removeAttribute("title");
  }
}

function applyEmotionClass(
  element: HTMLElement,
  href: string,
  record: LinkEmotionRecord,
  now: number
) {
  const isHappy = (happyUntilByHref.get(href) ?? 0) > now;
  const neglectedFor = now - record.lastClickedTime;
  const isResentful = !isHappy && neglectedFor >= RESENTFUL_AFTER_MS;
  const isAnxious = !isHappy && !isResentful && neglectedFor >= ANXIOUS_AFTER_MS;

  element.classList.toggle("happy-link", isHappy);
  element.classList.toggle("resentful-link", isResentful);
  element.classList.toggle("anxious-link", isAnxious);

  if (isResentful) {
    setResentfulTitle(element);
  } else {
    restoreTitle(element);
  }
}

function notifyEmotionChange() {
  window.dispatchEvent(new CustomEvent(EMOTION_EVENT));
}

export function recordBookmarkLinkClick(href: string) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const store = readStore();
  const current = store[href];

  store[href] = {
    lastClickedTime: now,
    clickCount: (current?.clickCount ?? 0) + 1
  };

  writeStore(store);
  happyUntilByHref.set(href, now + HAPPY_MS);
  notifyEmotionChange();
  window.setTimeout(notifyEmotionChange, HAPPY_MS);
}

export function useBookmarkLinkEmotions(knownHrefs: string[]) {
  const knownHrefKey = knownHrefs.join("\n");

  useEffect(() => {
    const seedHrefs = knownHrefKey.split("\n").filter(Boolean);
    let frameId = 0;

    function applyAll() {
      const now = Date.now();
      const store = readStore();
      let dirty = false;

      for (const href of seedHrefs) {
        if (!store[href]) {
          store[href] = { lastClickedTime: now, clickCount: 0 };
          dirty = true;
        }
      }

      document.querySelectorAll<HTMLElement>(LINK_SELECTOR).forEach((element) => {
        const href = getElementHref(element);
        if (!href) return;

        if (!store[href]) {
          store[href] = { lastClickedTime: now, clickCount: 0 };
          dirty = true;
        }

        applyEmotionClass(element, href, store[href], now);
      });

      if (dirty) writeStore(store);
    }

    function scheduleApply() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(applyAll);
    }

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener(EMOTION_EVENT, scheduleApply);
    const timerId = window.setInterval(scheduleApply, 60 * 60 * 1000);

    applyAll();

    return () => {
      observer.disconnect();
      window.removeEventListener(EMOTION_EVENT, scheduleApply);
      window.clearInterval(timerId);
      window.cancelAnimationFrame(frameId);
    };
  }, [knownHrefKey]);
}
