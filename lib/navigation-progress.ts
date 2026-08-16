"use client";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

const MIN_VISIBLE_MS = 180;

let configured = false;
let isNavigating = false;
let startedAt = 0;
let doneTimeout: number | null = null;

function ensureConfigured() {
  if (configured || typeof window === "undefined") {
    return;
  }

  NProgress.configure({ showSpinner: false });
  configured = true;
}

function clearDoneTimeout() {
  if (doneTimeout !== null) {
    window.clearTimeout(doneTimeout);
    doneTimeout = null;
  }
}

export function startNavigationProgress() {
  if (typeof window === "undefined") {
    return;
  }

  ensureConfigured();
  clearDoneTimeout();

  if (isNavigating) {
    return;
  }

  isNavigating = true;
  startedAt = Date.now();
  NProgress.start();
}

export function finishNavigationProgress() {
  if (typeof window === "undefined" || !isNavigating) {
    return;
  }

  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

  clearDoneTimeout();
  doneTimeout = window.setTimeout(() => {
    isNavigating = false;
    doneTimeout = null;
    NProgress.done();
  }, remaining);
}

export function forceDoneNavigationProgress() {
  if (typeof window === "undefined") {
    return;
  }

  clearDoneTimeout();
  isNavigating = false;
  NProgress.done();
}
