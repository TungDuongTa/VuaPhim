export function resetWindowScroll() {
  const top = { top: 0, left: 0, behavior: "instant" as const };
  window.scrollTo(top);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const main = document.querySelector("main");
  if (main instanceof HTMLElement) {
    main.scrollTop = 0;
  }
}
