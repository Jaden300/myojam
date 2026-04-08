const EN = {
  nav_howItWorks: "How it works",
  nav_about: "About",
  nav_team: "Team",
  nav_contact: "Contact",
  nav_education: "Education",
  nav_download: "Download for Mac",
  landing_badge: "Open source · Assistive technology",
  landing_hero1: "Control your",
  landing_hero2: "computer",
  landing_hero3: "with your muscles.",
  landing_try: "Try the demo",
  landing_cta_title: "See it in action",
  landing_cta_btn: "Open demo",
  landing_dl_title: "Download myojam",
  landing_dl_btn: "↓ Download for Mac",
  landing_dl_source: "View source",
}

const FR = {
  nav_howItWorks: "Comment ça marche",
  nav_about: "À propos",
  nav_team: "Équipe",
  nav_contact: "Contact",
  nav_education: "Éducation",
  nav_download: "Télécharger pour Mac",
  landing_badge: "Open source · Technologie d'assistance",
  landing_hero1: "Contrôlez votre",
  landing_hero2: "ordinateur",
  landing_hero3: "avec vos muscles.",
  landing_try: "Essayer la démo",
  landing_cta_title: "Voir en action",
  landing_cta_btn: "Ouvrir la démo",
  landing_dl_title: "Télécharger myojam",
  landing_dl_btn: "↓ Télécharger pour Mac",
  landing_dl_source: "Voir le code source",
}

const TRANSLATIONS = { en: EN, fr: FR }

export function getLang() {
  try { return localStorage.getItem("lang") || "en" } catch { return "en" }
}

export function setLang(l) {
  try { localStorage.setItem("lang", l) } catch {}
  window.dispatchEvent(new Event("langchange"))
}

export function t(key) {
  const lang = getLang()
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key
}