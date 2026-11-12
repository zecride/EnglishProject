/* ==========================================================
   Universités
   Pour en ajouter une : ajoute une ligne ci-dessous.
   - color : couleur principale du site pour cette université
   - image : photo d'arrière-plan (dans le dossier images/).
             Si le fichier n'existe pas, un dégradé de la couleur
             de l'université est utilisé à la place.
   - logo  : (facultatif) image du logo. Sans logo, le sigle est
             affiché en blanc sur la couleur de l'université.
   ========================================================== */
const UNIVERSITIES = [
  { id: "unil",  label: "UNIL",  name: "l'UNIL",  full: "Université de Lausanne",  color: "#0038ff", image: "images/unil.jpg",  logo: "images/unil-logo.jpg" },
  { id: "epfl",  label: "EPFL",  name: "l'EPFL",  full: "École polytechnique fédérale", color: "#e2001a", image: "images/epfl.jpg" },
  { id: "unige", label: "UNIGE", name: "l'UNIGE", full: "Université de Genève",    color: "#cf0063", image: "images/unige.jpg" },
  { id: "unifr", label: "UNIFR", name: "l'UNIFR", full: "Université de Fribourg",  color: "#1f4e9c", image: "images/unifr.jpg" },
  { id: "unine", label: "UNINE", name: "l'UNINE", full: "Université de Neuchâtel", color: "#3f8f2f", image: "images/unine.jpg" },
];

const STORAGE_KEY = "universite";

const root      = document.documentElement;
const uniBadge  = document.getElementById("uniBadge");
const uniList   = document.getElementById("uniList");
const uniName   = document.getElementById("uniName");
const bgLayers  = document.querySelectorAll(".bg-layer");
const dropdowns = document.querySelectorAll(".dropdown");

let currentId = null;
let visibleLayer = 0;

/* ---------- Outils ---------- */

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function gradientFor(color) {
  return `radial-gradient(120% 90% at 20% 15%, ${hexToRgba(color, 0.95)} 0%, ${hexToRgba(color, 0.45)} 45%, #0b0d12 100%)`;
}

function fillBadge(el, uni) {
  el.style.setProperty("--uni-color", uni.color);
  el.textContent = uni.label;
  el.classList.toggle("has-logo", Boolean(uni.logo));
  el.style.backgroundImage = uni.logo ? `url("${uni.logo}")` : "";
}

/* ---------- Arrière-plan avec fondu ---------- */

function showBackground(background, instant) {
  if (instant) {
    bgLayers[visibleLayer].style.backgroundImage = background;
    return;
  }
  const next = 1 - visibleLayer;
  bgLayers[next].style.backgroundImage = background;
  bgLayers[next].classList.add("is-visible");
  bgLayers[visibleLayer].classList.remove("is-visible");
  visibleLayer = next;
}

function loadBackground(uni, instant) {
  const img = new Image();
  const apply = (background) => {
    if (currentId === uni.id) showBackground(background, instant);
  };
  img.onload  = () => apply(`url("${uni.image}")`);
  img.onerror = () => apply(gradientFor(uni.color));
  img.src = uni.image;
}

/* ---------- Changement d'université ---------- */

function renderUniList() {
  uniList.innerHTML = "";
  UNIVERSITIES.filter((u) => u.id !== currentId).forEach((uni) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "uni-option";
    btn.style.setProperty("--uni-color", uni.color);

    const badge = document.createElement("span");
    badge.className = "uni-badge";
    fillBadge(badge, uni);

    const text = document.createElement("span");
    text.textContent = uni.full;

    btn.append(badge, text);
    btn.addEventListener("click", () => {
      setUniversity(uni.id);
      closeDropdown(btn.closest(".dropdown"), true);
    });
    li.append(btn);
    uniList.append(li);
  });
}

function setUniversity(id, instant = false) {
  const uni = UNIVERSITIES.find((u) => u.id === id) || UNIVERSITIES[0];
  currentId = uni.id;

  root.dataset.uni = uni.id;
  root.style.setProperty("--accent", uni.color);
  root.style.setProperty("--accent-soft", hexToRgba(uni.color, 0.35));

  fillBadge(uniBadge, uni);
  uniName.textContent = uni.name;
  renderUniList();
  loadBackground(uni, instant);

  try { localStorage.setItem(STORAGE_KEY, uni.id); } catch (e) { /* stockage indisponible */ }
}

/* ---------- Menus déroulants ----------
   Souris : ouverture au survol (géré en CSS).
   Tactile / clavier : ouverture au clic sur le bouton.          */

function closeDropdown(dropdown, force = false) {
  dropdown.classList.remove("open");
  dropdown.querySelector("button").setAttribute("aria-expanded", "false");
  if (force) {
    // Empêche le survol de garder le panneau ouvert juste après un choix
    dropdown.classList.add("is-closing");
    if (document.activeElement) document.activeElement.blur();
    const release = () => dropdown.classList.remove("is-closing");
    dropdown.addEventListener("mouseleave", release, { once: true });
    setTimeout(release, 600);
  }
}

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector("button");

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !dropdown.classList.contains("open");
    dropdowns.forEach((d) => closeDropdown(d));
    if (willOpen) {
      dropdown.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    } else {
      trigger.blur();
    }
  });
});

document.addEventListener("click", (event) => {
  dropdowns.forEach((d) => { if (!d.contains(event.target)) closeDropdown(d); });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") dropdowns.forEach((d) => closeDropdown(d, true));
});

/* ---------- Démarrage ---------- */

let saved = null;
try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* stockage indisponible */ }
setUniversity(saved || "unil", true);
