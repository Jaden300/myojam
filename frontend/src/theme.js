export function getTheme() {
  try { return localStorage.getItem("theme") || "light" } catch { return "light" }
}

export function setTheme(t) {
  try { localStorage.setItem("theme", t) } catch {}
  document.documentElement.setAttribute("data-theme", t)
  window.dispatchEvent(new Event("themechange"))
}

export function initTheme() {
  const t = getTheme()
  document.documentElement.setAttribute("data-theme", t)
}