const profile = {
  resume: "./resume.pdf",
  socials: {
    LinkedIn: "",
    Instagram: "",
    "X / Twitter": "",
    GitHub: "",
  },
  projects: [
    { id: "autosupply", name: "AutoSupply", readme: "", appUrl: "" },
    { id: "samjhao", name: "Samjhao", readme: "", appUrl: "" },
    { id: "karya", name: "Karya", readme: "", appUrl: "" },
    { id: "restaurant-erp", name: "RestaurantERP", readme: "", appUrl: "" },
    { id: "salon-erp", name: "SalonERP", readme: "", appUrl: "" },
    { id: "sports-academy-erp", name: "SportsAcademyERP", readme: "", appUrl: "" },
  ],
};

const desktop = document.querySelector("#desktop");
const bootScreen = document.querySelector("#boot-screen");
const bootSignInButton = document.querySelector("#boot-signin-button");
const bootWelcome = document.querySelector("#boot-welcome");
const bootSigninSpinner = document.querySelector("#boot-signin-spinner");
const desktopIcons = document.querySelector("#desktop-icons");
const windowLayer = document.querySelector("#window-layer");
const pinnedApps = document.querySelector("#taskbar-pinned-apps");
const taskbarApps = document.querySelector("#taskbar-open-apps");
const startGrid = document.querySelector("#start-grid");
const startMenu = document.querySelector("#start-menu");
const startButton = document.querySelector("#start-button");
const taskbarSearch = document.querySelector("#taskbar-search");
const startSearch = document.querySelector("#start-search");
const startSearchResults = document.querySelector("#start-search-results");
const contextMenu = document.querySelector("#context-menu");
const toast = document.querySelector("#toast");
const quickSettingsPanel = document.querySelector("#quick-settings-panel");
const calendarPanel = document.querySelector("#calendar-panel");
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedCalendarDate = new Date();
const quickSettingState = { wifi: true, bluetooth: false, airplane: false, "battery-saver": false };
const socialItems = [
  { name: "LinkedIn", glyph: "in", iconClass: "linkedin-shortcut" },
  { name: "Instagram", glyph: "ig", iconClass: "instagram-shortcut" },
  { name: "X / Twitter", glyph: "X", iconClass: "x-shortcut" },
  { name: "GitHub", glyph: "gh", iconClass: "github-shortcut" },
];
const explorerLocations = [
  { id: "this-pc", name: "This PC", icon: "▣" },
  { id: "desktop", name: "Desktop", icon: "▤" },
  { id: "downloads", name: "Downloads", icon: "↓" },
  { id: "documents", name: "Documents", icon: "▤" },
  { id: "photos", name: "Photos", icon: "▧" },
  { id: "videos", name: "Videos", icon: "▶" },
  { id: "recycle-bin", name: "Recycle Bin", icon: "♲" },
];

let nextWindowId = 0;
let nextTabId = 0;
let zIndex = 20;
let chromeTabs = [];
let activeTabId = null;
let contextTarget = null;
let dragState = null;
let toastTimer;
const explorerHistory = new WeakMap();

function playBootSequence() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bootDuration = reducedMotion ? 250 : 1450;
  const fadeDuration = reducedMotion ? 100 : 500;
  window.setTimeout(() => {
    bootScreen.dataset.phase = "signin";
    bootScreen.setAttribute("aria-label", "Sign in to Krishna Gera's desktop");
    bootSignInButton.focus();
  }, bootDuration);

  bootSignInButton.addEventListener("click", () => {
    if (bootScreen.dataset.phase !== "signin") return;
    bootScreen.dataset.phase = "welcome";
    bootScreen.setAttribute("aria-label", "Signing in to Krishna Gera's desktop");
    bootScreen.setAttribute("aria-busy", "true");
    bootWelcome.hidden = false;
    bootSigninSpinner.hidden = false;
    window.setTimeout(() => {
      bootScreen.classList.add("boot-screen-exiting");
      bootScreen.setAttribute("aria-label", "Desktop ready");
      bootScreen.removeAttribute("aria-busy");
      window.setTimeout(() => bootScreen.remove(), fadeDuration);
    }, reducedMotion ? 400 : 1200);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function showPropertiesDialog(target) {
  const details = getProperties(target);
  desktop.querySelector(".properties-backdrop")?.remove();
  desktop.insertAdjacentHTML("beforeend", `
    <div class="properties-backdrop" data-properties-backdrop>
      <section class="properties-dialog" role="dialog" aria-modal="true" aria-labelledby="properties-title">
        <header class="properties-titlebar"><span id="properties-title">${escapeHtml(details.name)} Properties</span><button data-close-properties aria-label="Close properties">×</button></header>
        <div class="properties-tabs"><button class="selected">General</button>${details.url ? "<button>Web Document</button>" : ""}</div>
        <div class="properties-body">
          <div class="properties-name"><span class="properties-type-icon">${details.icon}</span><strong>${escapeHtml(details.name)}</strong></div>
          <div class="properties-rule"></div>
          ${details.rows.map(([label, value]) => `<div class="property-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
          ${details.url ? `<div class="property-row property-url"><span>Target</span><strong>${escapeHtml(details.url)}</strong></div>` : ""}
          <div class="properties-rule"></div>
          <div class="properties-actions"><button data-close-properties>OK</button><button data-close-properties>Cancel</button></div>
        </div>
      </section>
    </div>`);
  desktop.querySelector(".properties-dialog button")?.focus();
}

function showDisplaySettings() {
  desktop.querySelector(".display-backdrop")?.remove();
  const currentSize = desktopIcons.dataset.iconSize || "medium";
  desktop.insertAdjacentHTML("beforeend", `
    <div class="display-backdrop" data-display-backdrop>
      <section class="display-dialog" role="dialog" aria-modal="true" aria-labelledby="display-title">
        <header class="properties-titlebar"><span id="display-title">Display settings</span><button data-close-display aria-label="Close display settings">×</button></header>
        <div class="display-body">
          <p>Desktop icon size</p>
          <div class="display-size-options" role="group" aria-label="Desktop icon size">
            ${["small", "medium", "large"].map((size) => `<button type="button" data-display-size="${size}" aria-pressed="${size === currentSize}"><span class="display-size-preview ${size}"><i></i><i></i><i></i></span><strong>${size[0].toUpperCase()}${size.slice(1)} icons</strong></button>`).join("")}
          </div>
          <div class="properties-actions"><button data-apply-display>Apply</button><button data-close-display>Cancel</button></div>
        </div>
      </section>
    </div>`);
  desktop.querySelector(`[data-display-size="${currentSize}"]`)?.focus();
}

function getProperties(target) {
  if (target.kind === "location") {
    const location = explorerLocations.find((item) => item.id === target.locationId);
    return {
      name: location?.name || "Folder",
      icon: location?.id === "recycle-bin" ? recycleBinSvg() : escapeHtml(location?.icon || "▤"),
      rows: [
        ["Type", "System folder"],
        ["Location", location?.id === "this-pc" ? "Desktop" : `This PC\\${location?.name || ""}`],
        ["Contains", location?.id === "this-pc" ? "5 locations" : location?.id === "desktop" ? `${profile.projects.length + socialItems.length + 3} items` : "0 items"],
      ],
    };
  }
  if (target.kind === "folder") {
    const project = projectById(target.projectId);
    return {
      name: project.name,
      icon: folderSvg(),
      rows: [
        ["Type", "File folder"],
        ["Location", `Desktop\\${project.name}`],
        ["Contains", "2 files"],
      ],
    };
  }
  if (target.kind === "file") {
    const project = projectById(target.projectId);
    return target.fileKind === "readme"
      ? {
        name: "README.md",
        icon: '<span class="readme-file-icon"><span>MD</span></span>',
        rows: [
          ["Type", "Markdown File"],
          ["Location", `Desktop\\${project.name}`],
          ["Opens with", "Portfolio document viewer"],
          ["Size", project.readme ? `${new Blob([project.readme]).size} bytes` : "Not available"],
        ],
      }
      : {
        name: "App",
        icon: chromeSvg(),
        url: project.appUrl || "",
        rows: [
          ["Type", "Internet Shortcut"],
          ["Location", `Desktop\\${project.name}`],
          ["Opens with", "Google Chrome"],
        ],
      };
  }
  if (target.kind === "social") {
    return {
      name: target.name,
      icon: socialIconMarkup(socialItems.find((item) => item.name === target.name)),
      url: profile.socials[target.name] || "",
      rows: [
        ["Type", "Internet Shortcut"],
        ["Location", "Desktop"],
        ["Opens with", "Google Chrome"],
      ],
    };
  }
  if (target.action === "recycle-bin") {
    return {
      name: "Recycle Bin",
      icon: recycleBinSvg(),
      rows: [
        ["Type", "System folder"],
        ["Location", "Desktop"],
        ["Contains", "0 items"],
      ],
    };
  }
  const isResume = target.action === "resume";
  return {
    name: isResume ? "Resume.pdf" : "Recycle Bin",
    icon: isResume ? "PDF" : recycleBinSvg(),
    url: isResume ? profile.resume : "",
    rows: [
      ["Type", isResume ? "PDF File" : "System folder"],
      ["Location", "Desktop"],
      ...(isResume ? [["Opens with", "Google Chrome"]] : []),
      ...(!isResume ? [["Contains", "0 items"]] : []),
    ],
  };
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function safeDestination(value) {
  if (!value) return "";
  try {
    const destination = new URL(value, document.baseURI);
    return ["http:", "https:", "file:"].includes(destination.protocol) ? destination.href : "";
  } catch {
    return "";
  }
}

function projectById(id) {
  return profile.projects.find((project) => project.id === id);
}

function folderSvg() {
  return `<svg viewBox="0 0 48 40" aria-hidden="true">
    <path d="M4 9.5A3.5 3.5 0 0 1 7.5 6H19l4 4h17.5A3.5 3.5 0 0 1 44 13.5v19a3.5 3.5 0 0 1-3.5 3.5h-33A3.5 3.5 0 0 1 4 32.5v-23Z" fill="#efbd4e" stroke="rgba(255,255,255,.55)"/>
    <path d="M4.5 15.5h39l-3 17.2a3 3 0 0 1-3 2.3h-29a3 3 0 0 1-3-2.8l-1-16.7Z" fill="#f5d782" stroke="rgba(255,255,255,.35)"/>
  </svg>`;
}

function recycleBinSvg() {
  return `<svg viewBox="0 0 40 44" aria-hidden="true">
    <path d="M10 11h20l-2 28H12L10 11Z" fill="#eaf4fb" stroke="#7893a8" stroke-width="1.5"/>
    <path d="M8 8h24M15 5h10M16 15v19M21 15v19M26 15v19" fill="none" stroke="#7893a8" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`;
}

function chromeSvg() {
  return `<svg class="chrome-mark" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#e9463d"/>
    <path d="M45.6 17H23.8c-7.8 0-12.5 8.4-8.7 15.2l8.7 15.2A22 22 0 0 0 45.6 17Z" fill="#32a852"/>
    <path d="M23.8 2a22 22 0 0 0-19.1 11.1l11 19.1c-3.8-6.8.9-15.2 8.7-15.2h21.2A22 22 0 0 0 23.8 2Z" fill="#f7c647"/>
    <circle cx="24" cy="24" r="9.8" fill="#f8fbff"/>
    <circle cx="24" cy="24" r="7.5" fill="#2584e8"/>
  </svg>`;
}

function socialIconMarkup(item) {
  if (item.name === "Instagram") {
    return `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="8" fill="none" stroke="currentColor" stroke-width="2.8"/><circle cx="16" cy="16" r="6.4" fill="none" stroke="currentColor" stroke-width="2.8"/><circle cx="24.3" cy="7.9" r="1.9" fill="currentColor"/></svg>`;
  }
  if (item.name === "GitHub") {
    return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1.9a14.1 14.1 0 0 0-4.46 27.48c.7.13.96-.3.96-.68v-2.48c-3.95.86-4.78-1.67-4.78-1.67-.64-1.64-1.58-2.08-1.58-2.08-1.28-.88.1-.87.1-.87 1.42.1 2.16 1.46 2.16 1.46 1.26 2.17 3.32 1.54 4.13 1.18.13-.91.49-1.54.9-1.9-3.15-.36-6.45-1.58-6.45-7 0-1.55.55-2.8 1.47-3.8-.15-.36-.64-1.8.15-3.75 0 0 1.2-.39 3.88 1.45a13.45 13.45 0 0 1 7.06 0c2.68-1.84 3.88-1.45 3.88-1.45.78 1.95.29 3.39.15 3.75.91 1 1.46 2.25 1.46 3.8 0 5.44-3.31 6.64-6.47 7 .52.44.96 1.3.96 2.62v3.73c0 .38.25.82.97.67A14.1 14.1 0 0 0 16 1.9Z" fill="currentColor"/></svg>`;
  }
  if (item.name === "LinkedIn") {
    return `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M7.1 10.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM4.8 12.4h4.6v14.8H4.8V12.4Zm7.5 0h4.4v2h.1c.6-1.1 2.1-2.3 4.4-2.3 4.7 0 5.6 3.1 5.6 7.1v8h-4.6v-7.1c0-1.7 0-3.9-2.4-3.9s-2.8 1.8-2.8 3.8v7.2h-4.6V12.4Z"/></svg>`;
  }
  return escapeHtml(item.glyph);
}

function renderDesktop() {
  const projectIcons = profile.projects.map((project) => `
    <button class="desktop-icon project-shortcut" data-project-folder="${project.id}" aria-label="Open ${escapeAttribute(project.name)} folder">
      <span class="shortcut-art folder-art">${folderSvg()}</span><span>${escapeHtml(project.name)}</span>
    </button>`).join("");
  const utilityIcons = `
    <button class="desktop-icon" data-action="resume" aria-label="Open Resume PDF">
      <span class="shortcut-art paper-art"><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M7 2.5h16l11 11V43a2.5 2.5 0 0 1-2.5 2.5h-25A2.5 2.5 0 0 1 4 43V5a2.5 2.5 0 0 1 3-2.5Z" fill="#f6faff"/><path d="M23 3v10h10" fill="#c5d9eb"/><path d="M11 23h16M11 29h16M11 35h11" stroke="#358ad1" stroke-width="2" stroke-linecap="round"/></svg></span><span>Resume.pdf</span>
    </button>
    <button class="desktop-icon" data-action="recycle-bin" aria-label="Open Recycle Bin">
      <span class="shortcut-art recycle-bin-art">${recycleBinSvg()}</span><span>Recycle Bin</span>
    </button>
    ${socialItems.map((item) => `
      <button class="desktop-icon social-desktop-icon" data-social-shortcut="${escapeAttribute(item.name)}" aria-label="Open Krishna's ${escapeAttribute(item.name)}">
        <span class="shortcut-art social-shortcut ${item.iconClass}">${socialIconMarkup(item)}</span><span>${escapeHtml(item.name)}</span>
      </button>`).join("")}`;
  desktopIcons.innerHTML = projectIcons + utilityIcons;

  const projectTiles = profile.projects.map((project) => `
    <button data-project="${project.id}" aria-label="Open ${escapeAttribute(project.name)} folder">
      <span class="start-tile-icon tile-folder">${folderSvg()}</span><span>${escapeHtml(project.name)}</span>
    </button>`).join("");
  startGrid.innerHTML = `${projectTiles}
    <button data-action="resume"><span class="start-tile-icon tile-resume">PDF</span><span>Resume</span></button>
    <button data-action="chrome"><span class="start-tile-icon tile-chrome">${chromeSvg()}</span><span>Chrome</span></button>`;

  pinnedApps.innerHTML = `${profile.projects.map((project) => `
    <button class="taskbar-pin" data-pin-project="${project.id}" title="${escapeAttribute(project.name)} — app" aria-label="Open ${escapeAttribute(project.name)} app in Chrome">
      <span class="pin-project-icon">${escapeHtml(project.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase())}</span>
    </button>`).join("")}
    <button class="taskbar-pin chrome-pin" data-pin-chrome title="Google Chrome" aria-label="Open Google Chrome">${chromeSvg()}</button>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

function showContextMenu(x, y, target) {
  contextTarget = target;
  if (target.kind === "desktop") {
    contextMenu.innerHTML = `
      <button class="context-menu-item" data-context-action="refresh">Refresh</button>
      <div class="context-separator"></div>
      <div class="context-menu-group">
        <button class="context-menu-item" aria-haspopup="true">Sort by<span>›</span></button>
        <div class="context-submenu" role="menu">
          <button class="context-menu-item" data-context-action="sort-name">Name</button>
          <button class="context-menu-item" data-context-action="sort-type">Item type</button>
        </div>
      </div>
      <div class="context-menu-group">
        <button class="context-menu-item" aria-haspopup="true">View<span>›</span></button>
        <div class="context-submenu" role="menu">
          <button class="context-menu-item" data-context-action="view-small">Small icons</button>
          <button class="context-menu-item" data-context-action="view-medium">Medium icons</button>
          <button class="context-menu-item" data-context-action="view-large">Large icons</button>
          <div class="context-separator"></div>
          <button class="context-menu-item" data-context-action="view-auto">Auto arrange icons</button>
          <button class="context-menu-item" data-context-action="view-align">Align icons to grid</button>
          <button class="context-menu-item" data-context-action="view-desktop">Show desktop icons</button>
        </div>
      </div>
      <div class="context-separator"></div>
      <div class="context-menu-group">
        <button class="context-menu-item is-disabled" disabled aria-haspopup="true">New<span>›</span></button>
        <div class="context-submenu" role="menu">
          <button class="context-menu-item is-disabled" disabled>Folder</button>
          <button class="context-menu-item is-disabled" disabled>Shortcut</button>
          <button class="context-menu-item is-disabled" disabled>Text Document</button>
        </div>
      </div>
      <button class="context-menu-item is-disabled" disabled>Paste</button>
      <button class="context-menu-item is-disabled" disabled>Paste shortcut</button>
      <button class="context-menu-item is-disabled" disabled>Undo delete</button>
      <div class="context-separator"></div>
      <button class="context-menu-item" data-context-action="display-settings">Display settings</button>
      <button class="context-menu-item" data-context-action="personalize">Personalize</button>`;
    contextMenu.hidden = false;
    const bounds = contextMenu.getBoundingClientRect();
    contextMenu.style.left = `${Math.max(4, Math.min(x, innerWidth - bounds.width - 6))}px`;
    contextMenu.style.top = `${Math.max(4, Math.min(y, innerHeight - bounds.height - 6))}px`;
    return;
  }
  let items;
  if (target.kind === "folder") {
    items = [
      ["open", "Open"],
      ["open-new", "Open in new window"],
      ["pin", "Pin to taskbar"],
      ["properties", "Properties"],
    ];
  } else if (target.kind === "file") {
    items = [
      ["open", "Open"],
      ["submenu", "Open with"],
      ["copy", "Copy path"],
      ["properties", "Properties"],
    ];
  } else if (target.kind === "location") {
    items = [
      ["open", "Open"],
      ["properties", "Properties"],
    ];
  } else if (target.kind === "browser") {
    items = [
      ["new-tab", "New tab"],
      ["external", "Open current page externally"],
      ["copy-link", "Copy link"],
    ];
  } else if (target.kind === "shortcut") {
    items = [
      ["open", "Open"],
      ["submenu", "Open with"],
      ["properties", "Properties"],
    ];
  } else {
    items = [
      ["open", "Open"],
      ["submenu", "Open with"],
      ["copy-link", "Copy link"],
      ["properties", "Properties"],
    ];
  }
  contextMenu.innerHTML = items.map(([action, label]) => {
    if (action === "submenu") {
      return `<div class="context-menu-group">
        <button class="context-menu-item" role="menuitem" aria-haspopup="true">${label}<span>›</span></button>
        <div class="context-submenu" role="menu">
          <button class="context-menu-item" role="menuitem" data-context-action="open-chrome">${chromeSvg()}<span>Google Chrome</span></button>
          <button class="context-menu-item" role="menuitem" data-context-action="open-default"><span class="default-app-icon">↗</span><span>Default browser</span></button>
        </div>
      </div>`;
    }
    return `<button class="context-menu-item" role="menuitem" data-context-action="${action}">${label}${action === "open" ? "<span>↵</span>" : ""}</button>`;
  }).join("");
  contextMenu.hidden = false;
  const bounds = contextMenu.getBoundingClientRect();
  contextMenu.style.left = `${Math.max(4, Math.min(x, innerWidth - bounds.width - 6))}px`;
  contextMenu.style.top = `${Math.max(4, Math.min(y, innerHeight - bounds.height - 6))}px`;
}

function hideContextMenu() {
  contextMenu.hidden = true;
  contextTarget = null;
}

function getWindow(key) {
  return [...windowLayer.querySelectorAll(".portfolio-window")].find((item) => item.dataset.window === key);
}

function focusWindow(element) {
  element.style.zIndex = String(++zIndex);
  windowLayer.querySelectorAll(".portfolio-window").forEach((item) => item.classList.remove("focused"));
  element.classList.add("focused");
  renderTaskbar();
}

function renderTaskbar() {
  const openProjectApps = new Set(chromeTabs.map((tab) => tab.projectId).filter(Boolean));
  pinnedApps.querySelectorAll("[data-pin-project]").forEach((button) => {
    button.classList.toggle("is-running", openProjectApps.has(button.dataset.pinProject));
  });
  pinnedApps.querySelector("[data-pin-chrome]")?.classList.toggle("is-running", Boolean(getWindow("chrome")));
  taskbarApps.innerHTML = [...windowLayer.querySelectorAll(".portfolio-window")]
    .map((element) => {
      const minimized = element.classList.contains("minimized");
      const focused = element.classList.contains("focused");
      const isChrome = element.classList.contains("chrome-window");
      const icon = isChrome
        ? chromeSvg()
        : element.classList.contains("explorer-window")
          ? `<span class="taskbar-app-icon taskbar-folder-icon">${folderSvg()}</span>`
          : `<span class="taskbar-app-icon">${escapeHtml(element.dataset.taskIcon || "KG")}</span>`;
      const label = element.dataset.taskTitle || "Window";
      const state = minimized ? "Restore" : focused ? "Minimize" : "Activate";
      return `<button class="taskbar-app${focused && !minimized ? " active" : ""}" data-restore="${element.dataset.window}" aria-label="${state} ${escapeAttribute(label)}">${icon}<span>${escapeHtml(label)}</span></button>`;
    }).join("");
}

function buildWindow({ key, title, icon = "KG", className = "", content, footer = title.toUpperCase() }) {
  let element = getWindow(key);
  if (element) {
    element.classList.remove("minimized");
    focusWindow(element);
    return element;
  }
  const id = ++nextWindowId;
  element = document.createElement("section");
  element.className = `portfolio-window ${className}`;
  element.dataset.window = key;
  element.dataset.windowId = String(id);
  element.dataset.taskTitle = title;
  element.dataset.taskIcon = icon;
  element.setAttribute("aria-label", title);
  element.style.setProperty("--window-offset", `${(id % 5) * 22}px`);
  element.innerHTML = `
    <header class="window-titlebar">
      <span class="window-app-icon">${icon === "CHROME" ? chromeSvg() : escapeHtml(icon)}</span><span class="window-title">${escapeHtml(title)}</span>
      <div class="window-controls">
        <button data-minimize aria-label="Minimize window">−</button>
        <button data-maximize aria-label="Maximize window">□</button>
        <button data-close aria-label="Close window">×</button>
      </div>
    </header>${content}
    <footer class="window-footer"><span>${escapeHtml(footer)}</span><span>KRISHNA GERA</span></footer>`;
  windowLayer.append(element);
  focusWindow(element);
  return element;
}

function openBasicWindow(key) {
  const socialLinks = socialItems.map((item) => {
    const url = profile.socials[item.name];
    return `<button class="social-link" data-social-open="${escapeAttribute(item.name)}">
      <span class="social-glyph">${socialIconMarkup(item)}</span>
      <span><span class="social-name">${escapeHtml(item.name)}</span><span class="social-state">${url ? "OPEN PROFILE ↗" : "PROFILE LINK NOT ADDED"}</span></span>
    </button>`;
  }).join("");
  const views = {
    socials: {
      title: "Social links", icon: "in", footer: "SOCIAL LINKS",
      content: `<div class="window-content basic-content"><p class="window-kicker">SOCIAL PROFILES</p><h2 class="window-heading">FIND ME<br><span>ON THE WEB.</span></h2><div class="social-list">${socialLinks}</div></div>`,
    },
    resume: {
      title: "Resume.pdf", icon: "PDF", footer: "RESUME",
      content: `<div class="window-content basic-content"><p class="window-kicker">RESUME</p><h2 class="window-heading">KRISHNA<br><span>GERA.</span></h2>${profile.resume
        ? `<div class="resume-card"><span class="resume-icon">PDF</span><span class="resume-copy"><strong>Resume.pdf</strong><span>Open the supplied resume PDF in Chrome.</span></span><button class="resume-action" data-open-resume>OPEN ↗</button></div>`
        : `<div class="empty-projects"><strong>Resume PDF not added yet.</strong><span>Once you provide the PDF, this desktop shortcut will open it in the browser.</span></div>`}</div>`,
    },
  };
  const view = views[key];
  if (!view) return;
  const element = buildWindow({ key, title: view.title, icon: view.icon, content: view.content, footer: view.footer });
  if (key === "resume" && profile.resume) {
    element.querySelector("[data-open-resume]").addEventListener("click", () => openChrome(profile.resume, "Resume.pdf"));
  }
}

function explorerContent(route) {
  const isProject = route.startsWith("project:");
  const project = isProject ? projectById(route.slice("project:".length)) : null;
  const location = isProject ? null : explorerLocations.find((item) => item.id === route.slice("location:".length));
  const locationId = location?.id || "this-pc";
  const activeLocationId = project ? "desktop" : locationId;
  const title = project?.name || location?.name || "This PC";
  const isThisPc = !project && locationId === "this-pc";
  const isDesktop = !project && locationId === "desktop";
  const locationRows = explorerLocations.filter((item) => item.id !== "this-pc" && item.id !== "recycle-bin").map((item) => `
    <button class="explorer-folder-row" data-folder-location="${item.id}">
      <span class="file-name-cell"><span class="file-icon location-file-icon">${item.icon}</span><span>${item.name}</span></span><span class="file-type-cell">System folder</span>
    </button>`).join("");
  const desktopRows = [
    ...profile.projects.map((item) => `<button class="explorer-folder-row" data-folder-project="${item.id}">
      <span class="file-name-cell"><span class="file-icon folder-file-icon">${folderSvg()}</span><span>${escapeHtml(item.name)}</span></span><span class="file-type-cell">File folder</span>
    </button>`),
    `<button class="explorer-folder-row" data-desktop-shortcut="resume"><span class="file-name-cell"><span class="file-icon">PDF</span><span>Resume.pdf</span></span><span class="file-type-cell">PDF File</span></button>`,
    ...socialItems.map((item) => `<button class="explorer-folder-row" data-desktop-social="${escapeAttribute(item.name)}"><span class="file-name-cell"><span class="file-icon">${socialIconMarkup(item)}</span><span>${escapeHtml(item.name)}</span></span><span class="file-type-cell">Internet Shortcut</span></button>`),
    `<button class="explorer-folder-row" data-desktop-shortcut="recycle-bin"><span class="file-name-cell"><span class="file-icon recycle-file-icon">${recycleBinSvg()}</span><span>Recycle Bin</span></span><span class="file-type-cell">System folder</span></button>`,
  ].join("");
  const projectRows = profile.projects.map((item) => `<button class="explorer-folder-row" data-folder-project="${item.id}">
    <span class="file-name-cell"><span class="file-icon folder-file-icon">${folderSvg()}</span><span>${escapeHtml(item.name)}</span></span><span class="file-type-cell">File folder</span>
  </button>`).join("");
  const rows = isThisPc ? locationRows : isDesktop ? desktopRows : project ? `
    <button class="file-row" data-file-kind="app" data-project="${project.id}">
      <span class="file-name-cell"><span class="file-icon app-file-icon">${chromeSvg()}</span><span>App</span></span><span class="file-type-cell">Internet Shortcut</span>
    </button>
    <button class="file-row" data-file-kind="readme" data-project="${project.id}">
      <span class="file-name-cell"><span class="file-icon readme-file-icon"><span>MD</span></span><span>README.md</span></span><span class="file-type-cell">Markdown File</span>
    </button>` : "";
  const count = isThisPc ? "5 locations" : isDesktop ? `${profile.projects.length + socialItems.length + 2} items` : project ? "2 items" : "0 items";
  return `
    <div class="explorer-tabs" role="tablist" aria-label="Explorer locations">
      ${explorerLocations.filter((item) => item.id !== "recycle-bin").map((item) => `<button class="explorer-tab${activeLocationId === item.id ? " active" : ""}" role="tab" aria-selected="${activeLocationId === item.id}" data-explorer-location="${item.id}">${item.name}</button>`).join("")}
    </div>
    <div class="explorer-commandbar">
      <button data-sort-files>Sort</button><button data-toggle-view>View</button>
      <span class="explorer-command-spacer"></span><span class="explorer-project-label">${escapeHtml(title)}</span>
    </div>
    <div class="explorer-navigation">
      <button class="explorer-nav-button" aria-label="Back" data-explorer-back disabled>‹</button><button class="explorer-nav-button" aria-label="Forward" data-explorer-forward disabled>›</button><button class="explorer-nav-button" aria-label="Up one level" data-explorer-up>↑</button>
      <div class="explorer-address"><button data-address-location="this-pc">This PC</button>${project ? `<b>›</b><button data-address-location="desktop">Desktop</button><b>›</b><strong>${escapeHtml(project.name)}</strong>` : locationId !== "this-pc" ? `<b>›</b><strong>${escapeHtml(title)}</strong>` : ""}</div>
      <input class="explorer-search" aria-label="Search ${escapeAttribute(title)}" placeholder="Search ${escapeAttribute(title)}">
    </div>
    <div class="explorer-body">
      <aside class="explorer-sidebar">
        <div class="explorer-side-heading">Locations</div>
        ${explorerLocations.filter((item) => item.id !== "this-pc" && item.id !== "recycle-bin").map((item) => `<button class="explorer-side-item${locationId === item.id && !project || item.id === "desktop" && project ? " current" : ""}" data-explorer-location="${item.id}"><span>${item.icon}</span>${item.name}</button>`).join("")}
        <div class="explorer-side-heading">Quick access</div>
        ${profile.projects.map((item) => `<button class="explorer-side-item${item.id === project?.id ? " current" : ""}" data-sidebar-project="${item.id}"><span class="side-folder">${folderSvg()}</span>${escapeHtml(item.name)}</button>`).join("")}
        <div class="explorer-side-divider"></div>
        <button class="explorer-side-item${locationId === "this-pc" ? " current" : ""}" data-explorer-location="this-pc"><span>▣</span>This PC</button>
        <button class="explorer-side-item${locationId === "recycle-bin" ? " current" : ""}" data-explorer-location="recycle-bin"><span class="recycle-sidebar-icon">${recycleBinSvg()}</span>Recycle Bin</button>
      </aside>
      <div class="explorer-file-area">
        <div class="explorer-file-heading"><span>Name</span><span>Type</span></div>
        ${rows || `<div class="explorer-empty-location"><strong>${locationId === "recycle-bin" ? "Recycle Bin is empty" : `${escapeHtml(title)} is empty`}</strong><span>No items have been added here.</span></div>`}
        <div class="explorer-selection" aria-live="polite">${escapeHtml(title)} <span>${count}</span></div>
      </div>
    </div>`;
}

function renderExplorer(element, route) {
  const project = route.startsWith("project:") ? projectById(route.slice("project:".length)) : null;
  const location = explorerLocations.find((item) => `location:${item.id}` === route);
  const title = project?.name || location?.name || "This PC";
  element.dataset.explorerRoute = route;
  element.dataset.projectId = project?.id || "";
  element.querySelector(".window-title").textContent = title;
  element.dataset.taskTitle = title;
  element.setAttribute("aria-label", title);
  element.querySelector(".window-footer span").textContent = project ? "2 ITEMS" : location?.id === "desktop" ? `${profile.projects.length + socialItems.length + 2} ITEMS` : location?.id === "this-pc" ? "5 LOCATIONS" : "0 ITEMS";
  element.querySelector(".window-titlebar").insertAdjacentHTML("afterend", explorerContent(route));
}

function updateExplorer(element, route, historyMode = "push") {
  const history = explorerHistory.get(element) || { entries: [element.dataset.explorerRoute || "location:this-pc"], index: 0 };
  const nextId = route || "location:this-pc";
  if (historyMode === "push" && history.entries[history.index] !== nextId) {
    history.entries = history.entries.slice(0, history.index + 1);
    history.entries.push(nextId);
    history.index += 1;
  } else if (historyMode === "back" && history.index > 0) {
    history.index -= 1;
  } else if (historyMode === "forward" && history.index < history.entries.length - 1) {
    history.index += 1;
  }
  explorerHistory.set(element, history);
  element.querySelector(".explorer-tabs")?.remove();
  element.querySelector(".explorer-commandbar")?.remove();
  element.querySelector(".explorer-navigation")?.remove();
  element.querySelector(".explorer-body")?.remove();
  renderExplorer(element, nextId);
  element.querySelector("[data-explorer-back]").disabled = history.index === 0;
  element.querySelector("[data-explorer-forward]").disabled = history.index >= history.entries.length - 1;
  focusWindow(element);
}

function openExplorer(projectId, alwaysNew = false, sourceWindow = null) {
  const project = projectId ? projectById(projectId) : null;
  if (projectId && !project) return;
  const route = project ? `project:${project.id}` : "location:this-pc";
  const existing = sourceWindow || (!alwaysNew
    ? [...windowLayer.querySelectorAll(".explorer-window")].find((item) => item.classList.contains("focused"))
      || [...windowLayer.querySelectorAll(".explorer-window")].find((item) => !item.classList.contains("minimized"))
      || windowLayer.querySelector(".explorer-window")
    : null);
  if (existing) {
    existing.classList.add("no-window-transition");
    existing.classList.remove("minimized");
    updateExplorer(existing, route);
    requestAnimationFrame(() => existing.classList.remove("no-window-transition"));
    return existing;
  }
  const key = alwaysNew ? `explorer:new:${++nextWindowId}` : "explorer";
  const element = buildWindow({
    key,
    title: project?.name || "This PC",
    icon: "▰",
    className: "explorer-window",
    content: "",
    footer: project ? "2 ITEMS" : "5 LOCATIONS",
  });
  explorerHistory.set(element, { entries: [route], index: 0 });
  renderExplorer(element, route);
  return element;
}

function openExplorerLocation(locationId, sourceWindow = null) {
  const location = explorerLocations.find((item) => item.id === locationId);
  if (!location) return;
  const route = `location:${location.id}`;
  const existing = sourceWindow
    || [...windowLayer.querySelectorAll(".explorer-window")].find((item) => item.classList.contains("focused"))
    || [...windowLayer.querySelectorAll(".explorer-window")].find((item) => !item.classList.contains("minimized"))
    || windowLayer.querySelector(".explorer-window");
  if (existing) {
    existing.classList.add("no-window-transition");
    existing.classList.remove("minimized");
    updateExplorer(existing, route);
    requestAnimationFrame(() => existing.classList.remove("no-window-transition"));
    return existing;
  }
  const element = buildWindow({
    key: "explorer",
    title: location.name,
    icon: "▰",
    className: "explorer-window",
    content: "",
    footer: location.id === "this-pc" ? "5 LOCATIONS" : location.id === "desktop" ? `${profile.projects.length + socialItems.length + 2} ITEMS` : "0 ITEMS",
  });
  explorerHistory.set(element, { entries: [route], index: 0 });
  renderExplorer(element, route);
  return element;
}

function openReadme(projectId) {
  const project = projectById(projectId);
  if (!project) return;
  const content = project.readme
    ? `<pre class="readme-text">${escapeHtml(project.readme)}</pre>`
    : `<div class="readme-not-provided"><span class="readme-file-icon"><span>MD</span></span><div><strong>README.md</strong><p>No README content has been provided for ${escapeHtml(project.name)} yet.</p></div></div>`;
  buildWindow({
    key: `readme:${project.id}`,
    title: `${project.name} — README.md`,
    icon: "MD",
    className: "readme-window",
    content: `<div class="readme-menubar"><span>File</span><span>Edit</span><span>View</span><span>Help</span></div><div class="window-content readme-content">${content}</div>`,
    footer: "README.MD",
  });
}

function ensureChromeWindow() {
  let element = getWindow("chrome");
  if (element) {
    element.classList.remove("minimized");
    focusWindow(element);
    return element;
  }
  element = buildWindow({
    key: "chrome",
    title: "Google Chrome",
    icon: "CHROME",
    className: "chrome-window",
    content: `<div class="chrome-tabs" data-chrome-tabs></div><div class="chrome-toolbar">
      <button class="chrome-control" data-history="back" aria-label="Back" title="Back">‹</button>
      <button class="chrome-control" data-history="forward" aria-label="Forward" title="Forward">›</button>
      <button class="chrome-control" data-history="reload" aria-label="Reload" title="Reload">↻</button>
      <form class="chrome-address-form"><span class="chrome-address-mark">⌕</span><input class="chrome-address" aria-label="Search or enter address" placeholder="Search or enter address" autocomplete="off" spellcheck="false"><button class="chrome-go" type="submit" aria-label="Go">→</button></form>
      <button class="chrome-menu-button" data-browser-menu aria-label="Browser menu">⋮</button>
    </div><div class="chrome-page" data-chrome-page></div>`,
    footer: "GOOGLE CHROME",
  });
  return element;
}

function getActiveTab() {
  return chromeTabs.find((tab) => tab.id === activeTabId);
}

function createTab({ url = "", title = "New tab", projectId = "" } = {}) {
  const tab = { id: ++nextTabId, url, title, projectId, history: url ? [url] : [], historyIndex: url ? 0 : -1 };
  chromeTabs.push(tab);
  activeTabId = tab.id;
  renderChrome();
  renderTaskbar();
  return tab;
}

function openChrome(url = "", title = "New tab", projectId = "") {
  const destination = safeDestination(url);
  if (url && !destination) {
    showToast("This address cannot be opened in Chrome.");
    return;
  }
  ensureChromeWindow();
  createTab({ url: destination, title, projectId });
}

function openReadmeInChrome(projectId) {
  const project = projectById(projectId);
  if (!project) return;
  ensureChromeWindow();
  const body = project.readme
    ? `<pre style="font:13px/1.7 monospace;white-space:pre-wrap">${escapeHtml(project.readme)}</pre>`
    : `<main style="max-width:620px;margin:12vh auto;padding:24px;color:#39434d;font:14px/1.65 Arial,sans-serif"><h1 style="font-size:19px">README.md</h1><p>No README content has been provided for ${escapeHtml(project.name)} yet.</p></main>`;
  const tab = { id: ++nextTabId, url: "", title: `${project.name} — README.md`, projectId: "", history: [], historyIndex: -1, html: body };
  chromeTabs.push(tab);
  activeTabId = tab.id;
  renderChrome();
  renderTaskbar();
}

function openProjectApp(projectId) {
  const project = projectById(projectId);
  if (!project) return;
  if (project.appUrl) {
    openChrome(project.appUrl, project.name, project.id);
  } else {
    openChrome("", project.name, project.id);
  }
}

function renderChrome() {
  const element = getWindow("chrome");
  if (!element) return;
  const tabsHost = element.querySelector("[data-chrome-tabs]");
  const pageHost = element.querySelector("[data-chrome-page]");
  const address = element.querySelector(".chrome-address");
  const active = getActiveTab();
  tabsHost.innerHTML = `${chromeTabs.map((tab) => `
    <button class="chrome-tab${tab.id === activeTabId ? " selected" : ""}" data-tab="${tab.id}" title="${escapeAttribute(tab.title)}">
      <span class="chrome-tab-favicon">${tab.projectId ? "↗" : chromeSvg()}</span><span class="chrome-tab-title">${escapeHtml(tab.title)}</span><span class="chrome-tab-close" data-close-tab="${tab.id}" aria-label="Close tab">×</span>
    </button>`).join("")}<button class="chrome-new-tab" data-new-tab aria-label="New tab" title="New tab">+</button>`;
  if (!active) {
    pageHost.innerHTML = "";
    return;
  }
  address.value = active.url;
  element.dataset.historyBack = String(active.historyIndex > 0);
  element.dataset.historyForward = String(active.historyIndex >= 0 && active.historyIndex < active.history.length - 1);
  element.querySelector('[data-history="back"]').disabled = active.historyIndex <= 0;
  element.querySelector('[data-history="forward"]').disabled = active.historyIndex < 0 || active.historyIndex >= active.history.length - 1;
  if (active.projectId && !active.url) {
    const project = projectById(active.projectId);
    pageHost.innerHTML = `<div class="chrome-unavailable">${chromeSvg()}<p class="chrome-page-kicker">${escapeHtml(project.name)}</p><h2>App link not added</h2><p>The destination for this project’s app hasn’t been supplied yet. Once its URL is added, this tab will open the live project.</p></div>`;
    return;
  }
  if (!active.url) {
    if (active.html) {
      pageHost.innerHTML = `<div class="chrome-local-page">${active.html}</div>`;
      return;
    }
    pageHost.innerHTML = `<div class="chrome-newtab-page"><div class="chrome-newtab-brand">${chromeSvg()}<span>Chrome</span></div><form class="chrome-search-form"><input aria-label="Search or enter address" placeholder="Search or enter address"><button type="submit">Search</button></form></div>`;
    return;
  }
  if (isGoogleUrl(active.url)) {
    pageHost.innerHTML = `<div class="chrome-external-page">
      <span class="google-wordmark"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></span>
      <p>${active.externalSearch ? "Your Google search is ready." : "Google does not allow its results page to be embedded in another site."}</p>
      <a class="chrome-open-external" href="${escapeAttribute(active.url)}" target="_blank" rel="noopener noreferrer">Open in a new browser tab <span>↗</span></a>
      <small>This opens the real Google page outside the portfolio window. The browser blocks embedded Google results.</small>
    </div>`;
    return;
  }
  pageHost.innerHTML = `<div class="chrome-frame-wrap"><iframe class="chrome-frame" title="${escapeAttribute(active.title)}" src="${escapeAttribute(active.url)}" referrerpolicy="no-referrer" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe><a class="chrome-external-fallback" href="${escapeAttribute(active.url)}" target="_blank" rel="noopener noreferrer">Open outside this window ↗</a></div>`;
}

function isGoogleUrl(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "google.com" || hostname.endsWith(".google.com");
  } catch {
    return false;
  }
}

function isSearchQuery(value) {
  const input = value.trim();
  return Boolean(input && !/^(https?:\/\/|file:\/\/)/i.test(input) &&
    !/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(input) &&
    !/^localhost(:\d+)?(\/.*)?$/.test(input) &&
    !/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/.test(input));
}

function resolveAddress(value) {
  const entered = value.trim();
  if (!entered) return "";
  if (/^https?:\/\//i.test(entered) || /^file:\/\//i.test(entered)) return entered;
  if (/^javascript:/i.test(entered) || /^data:/i.test(entered)) return "";
  if (/^\.{1,2}\//.test(entered) || entered.startsWith("/")) return new URL(entered, document.baseURI).href;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(entered) || /^localhost(:\d+)?(\/.*)?$/.test(entered)) return `https://${entered}`;
  return `https://www.google.com/search?q=${encodeURIComponent(entered)}`;
}

function navigateTab(tab, value, addHistory = true) {
  const url = resolveAddress(value);
  if (!url) return;
  if (isSearchQuery(value)) {
    navigateGoogleSearch(tab, value, url, addHistory);
    return;
  }
  tab.url = url;
  tab.projectId = "";
  tab.title = url.replace(/^https?:\/\//, "").split("/")[0];
  tab.externalSearch = false;
  if (addHistory) {
    tab.history = tab.history.slice(0, tab.historyIndex + 1);
    tab.history.push(url);
    tab.historyIndex = tab.history.length - 1;
  }
  renderChrome();
}

function navigateGoogleSearch(tab, query, url = resolveAddress(query), addHistory = true) {
  if (!url || !tab) return;
  tab.url = url;
  tab.title = `Google — ${query.trim()}`;
  tab.projectId = "";
  tab.externalSearch = true;
  if (addHistory) {
    tab.history = tab.history.slice(0, tab.historyIndex + 1);
    tab.history.push(url);
    tab.historyIndex = tab.history.length - 1;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  renderChrome();
}

function openDefault(url, title = "Link") {
  const destination = safeDestination(url);
  if (!destination) {
    showToast("This shortcut does not have a destination yet.");
    return;
  }
  openChrome(destination, title);
}

function openSocial(name) {
  const url = profile.socials[name];
  if (url) openDefault(url, name);
  else openBasicWindow("socials");
}

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit", minute: "2-digit",
  }).format(now);
  const shortDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(now);
  const longDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(now);
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  setText("#clock-time", time);
  setText("#clock-date", shortDate);
  setText("#calendar-time", time);
  setText("#calendar-long-date", longDate);
  setText("#boot-clock", time);
  setText("#boot-date", new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  }).format(now));
  renderCalendar();
}

function renderCalendar() {
  const label = document.querySelector("#calendar-month-label");
  const grid = document.querySelector("#calendar-grid");
  if (!label || !grid) return;
  label.textContent = new Intl.DateTimeFormat("en-IN", {
    month: "long", year: "numeric",
  }).format(calendarMonth);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const today = new Date();
  const cells = weekdays.map((day) => `<span class="calendar-weekday" role="columnheader">${day}</span>`);
  for (let blank = 0; blank < firstWeekday; blank += 1) cells.push('<span class="calendar-day-placeholder" aria-hidden="true"></span>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === selectedCalendarDate.toDateString();
    cells.push(`<button type="button" class="calendar-day${isToday ? " today" : ""}${isSelected ? " selected" : ""}" data-calendar-day="${day}" aria-label="${escapeAttribute(new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date))}" aria-pressed="${isSelected}">${day}</button>`);
  }
  grid.innerHTML = cells.join("");
}

function setTrayExpanded(button, expanded) {
  button?.setAttribute("aria-expanded", String(expanded));
}

function closeSystemPanels() {
  quickSettingsPanel.hidden = true;
  calendarPanel.hidden = true;
  setTrayExpanded(document.querySelector("#tray-network"), false);
  setTrayExpanded(document.querySelector("#tray-battery"), false);
  setTrayExpanded(document.querySelector("#tray-clock"), false);
}

function toggleQuickSettings(source) {
  const sourceButton = document.querySelector(source === "network" ? "#tray-network" : "#tray-battery");
  const willOpen = sourceButton?.getAttribute("aria-expanded") !== "true";
  closeSystemPanels();
  quickSettingsPanel.hidden = !willOpen;
  setTrayExpanded(document.querySelector("#tray-network"), willOpen && source === "network");
  setTrayExpanded(document.querySelector("#tray-battery"), willOpen && source === "battery");
}

function updateQuickSettings() {
  quickSettingsPanel.querySelectorAll("[data-quick-toggle]").forEach((button) => {
    const key = button.dataset.quickToggle;
    const enabled = quickSettingState[key];
    button.classList.toggle("enabled", enabled);
    button.setAttribute("aria-pressed", String(enabled));
    const state = button.querySelector("small");
    if (key === "wifi") state.textContent = enabled ? "Portfolio network" : "Off";
    else state.textContent = enabled ? "On" : "Off";
  });
  const brightness = quickSettingsPanel.querySelector('input[type="range"]');
  desktop.style.setProperty("--demo-brightness", String(Number(brightness.value) / 80));
}

function activateDesktopIcon(button) {
  if (button.dataset.projectFolder) openExplorer(button.dataset.projectFolder);
  else if (button.dataset.socialShortcut) openSocial(button.dataset.socialShortcut);
  else if (button.dataset.action === "resume" && profile.resume) openChrome(profile.resume, "Resume.pdf");
  else if (button.dataset.action === "recycle-bin") openExplorerLocation("recycle-bin");
  else if (button.dataset.action) openBasicWindow(button.dataset.action);
}

function runContextAction(action) {
  const target = contextTarget;
  hideContextMenu();
  if (!target) return;
  if (action === "open" || action === "open-new") {
    if (target.kind === "folder") {
      const sourceWindow = target.windowId
        ? [...windowLayer.querySelectorAll(".explorer-window")].find((item) => item.dataset.windowId === target.windowId)
        : null;
      openExplorer(target.projectId, action === "open-new", action === "open-new" ? null : sourceWindow);
    }
    else if (target.kind === "location") {
      const sourceWindow = target.windowId
        ? [...windowLayer.querySelectorAll(".explorer-window")].find((item) => item.dataset.windowId === target.windowId)
        : null;
      openExplorerLocation(target.locationId, sourceWindow);
    } else if (target.kind === "file") {
      if (target.fileKind === "readme") openReadme(target.projectId);
      else openProjectApp(target.projectId);
    } else if (target.kind === "location") {
      const sourceWindow = target.windowId
        ? [...windowLayer.querySelectorAll(".explorer-window")].find((item) => item.dataset.windowId === target.windowId)
        : null;
      openExplorerLocation(target.locationId, sourceWindow);
    } else if (target.kind === "social") openSocial(target.name);
    else if (target.kind === "shortcut") {
      if (target.action === "recycle-bin") openExplorerLocation("recycle-bin");
      else if (target.action === "resume" && profile.resume) openChrome(profile.resume, "Resume.pdf");
      else openBasicWindow(target.action);
    }
    return;
  }
  if (action === "new-tab" && target.kind === "browser") {
    createTab();
    return;
  }
  if (action === "external" && target.kind === "browser") {
    const tab = getActiveTab();
    if (tab?.url) window.open(tab.url, "_blank", "noopener,noreferrer");
    else showToast("There is no page address to open externally yet.");
    return;
  }
  if (action === "open-chrome" || action === "open-default") {
    if (target.kind === "file" && target.fileKind === "readme") {
      openReadmeInChrome(target.projectId);
    } else if (target.kind === "file") {
      const project = projectById(target.projectId);
      if (action === "open-default" && safeDestination(project.appUrl)) window.open(safeDestination(project.appUrl), "_blank", "noopener,noreferrer");
      else openProjectApp(target.projectId);
    } else if (target.kind === "social") {
      const url = profile.socials[target.name];
      if (action === "open-default" && safeDestination(url)) window.open(safeDestination(url), "_blank", "noopener,noreferrer");
      else openSocial(target.name);
    } else if (target.kind === "shortcut") {
      if (target.action === "resume" && profile.resume) {
        if (action === "open-default" && safeDestination(profile.resume)) window.open(safeDestination(profile.resume), "_blank", "noopener,noreferrer");
        else openChrome(profile.resume, "Resume.pdf");
      } else {
        openBasicWindow(target.action);
      }
    }
    return;
  }
  if (action === "pin") {
    const project = projectById(target.projectId);
    showToast(`${project.name} app is pinned to the taskbar.`);
    return;
  }
  if (action === "copy" || action === "copy-link") {
    let value = "";
    if (target.kind === "social") value = profile.socials[target.name] || "";
    else if (target.kind === "browser") value = getActiveTab()?.url || "";
    else if (target.kind === "file") {
      const project = projectById(target.projectId);
      value = target.fileKind === "app" ? project.appUrl : `${project.name}/README.md`;
    }
    if (!value) {
      showToast("There is no path or link to copy yet.");
      return;
    }
    navigator.clipboard.writeText(value).then(
      () => showToast("Copied."),
      () => showToast("Clipboard access was denied by the browser."),
    );
    return;
  }
  if (action === "properties") {
    if (target.kind === "folder") {
      showPropertiesDialog(target);
    } else if (["file", "social", "shortcut", "location"].includes(target.kind)) {
      showPropertiesDialog(target);
    }
    return;
  }
  if (target.kind === "desktop") {
    if (action === "refresh") {
      desktopIcons.querySelectorAll(".desktop-icon").forEach((icon) => icon.classList.remove("selected"));
    } else if (action.startsWith("view-")) {
      const size = action.replace("view-", "");
      if (["small", "medium", "large"].includes(size)) desktopIcons.dataset.iconSize = size;
      else if (size === "desktop") desktopIcons.hidden = !desktopIcons.hidden;
      else if (size === "auto") desktopIcons.classList.toggle("auto-arrange");
      else if (size === "align") desktopIcons.classList.toggle("align-grid");
    } else if (action.startsWith("sort-")) {
      const icons = [...desktopIcons.querySelectorAll(".desktop-icon")];
      icons.sort((left, right) => left.textContent.trim().localeCompare(right.textContent.trim()));
      icons.forEach((icon) => desktopIcons.append(icon));
    } else if (action === "display-settings") {
      showDisplaySettings();
    } else if (action === "personalize") {
      showToast("Personalization is handled by the visitor's device.");
    }
  }
}

renderDesktop();
desktopIcons.dataset.iconSize ||= "medium";
updateClock();
playBootSequence();
window.setInterval(updateClock, 30_000);

desktopIcons.addEventListener("click", (event) => {
  const button = event.target.closest(".desktop-icon");
  if (!button) return;
  desktopIcons.querySelectorAll(".desktop-icon").forEach((icon) => icon.classList.remove("selected"));
  button.classList.add("selected");
  if (matchMedia("(pointer: coarse)").matches) activateDesktopIcon(button);
});
desktopIcons.addEventListener("dblclick", (event) => {
  const button = event.target.closest(".desktop-icon");
  if (button) activateDesktopIcon(button);
});
desktopIcons.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const button = event.target.closest(".desktop-icon");
  if (!button) return;
  event.preventDefault();
  activateDesktopIcon(button);
});

windowLayer.addEventListener("input", (event) => {
  const search = event.target.closest(".explorer-search");
  if (!search) return;
  const query = search.value.trim().toLocaleLowerCase();
  search.closest(".explorer-window").querySelectorAll(".file-row, .explorer-folder-row").forEach((row) => {
    row.hidden = !row.querySelector(".file-name-cell").textContent.toLocaleLowerCase().includes(query);
  });
});

function openStartMenu({ search = false } = {}) {
  startMenu.hidden = false;
  startButton.setAttribute("aria-expanded", "true");
  startSearch.value = "";
  filterStartMenu("");
  window.clearTimeout(openStartMenu.focusTimer);
  openStartMenu.focusTimer = window.setTimeout(() => (search ? startSearch : startSearch).focus(), 0);
}

function closeStartMenu() {
  startMenu.hidden = true;
  startButton.setAttribute("aria-expanded", "false");
  startSearch.value = "";
  filterStartMenu("");
}

function filterStartMenu(query) {
  const normalized = query.trim().toLocaleLowerCase();
  let shown = 0;
  startGrid.querySelectorAll("button").forEach((button) => {
    const match = !normalized || button.textContent.toLocaleLowerCase().includes(normalized) ||
      (normalized.includes("google") && button.textContent.toLocaleLowerCase().includes("chrome"));
    button.hidden = !match;
    if (match) shown += 1;
  });
  document.querySelector(".start-section-heading strong").textContent = normalized ? "Search results" : "Pinned";
  startGrid.hidden = shown === 0;
  startSearchResults.hidden = shown > 0 || !normalized;
  startSearchResults.textContent = shown ? "" : "No results found";
}

function runStartSearch() {
  const query = startSearch.value.trim();
  if (!query) return;
  const match = [...startGrid.querySelectorAll("button")].find((button) => !button.hidden);
  if (match) {
    match.click();
    return;
  }
  closeStartMenu();
  openChrome();
  const tab = getActiveTab();
  navigateGoogleSearch(tab, query);
}

startButton.addEventListener("click", () => {
  if (startMenu.hidden) openStartMenu({ search: true });
  else closeStartMenu();
});
taskbarSearch.addEventListener("click", () => {
  if (startMenu.hidden) openStartMenu({ search: true });
  else startSearch.focus();
});
document.querySelector("#tray-network").addEventListener("click", () => toggleQuickSettings("network"));
document.querySelector("#tray-battery").addEventListener("click", () => toggleQuickSettings("battery"));
document.querySelector("#tray-clock").addEventListener("click", () => {
  const willOpen = calendarPanel.hidden;
  closeSystemPanels();
  calendarPanel.hidden = !willOpen;
  setTrayExpanded(document.querySelector("#tray-clock"), willOpen);
});
quickSettingsPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-toggle]");
  if (!button) return;
  const key = button.dataset.quickToggle;
  quickSettingState[key] = !quickSettingState[key];
  if (key === "airplane" && quickSettingState.airplane) quickSettingState.wifi = false;
  if (key === "wifi" && quickSettingState.wifi) quickSettingState.airplane = false;
  updateQuickSettings();
});
quickSettingsPanel.querySelector('input[type="range"]').addEventListener("input", updateQuickSettings);
calendarPanel.addEventListener("click", (event) => {
  const shift = event.target.closest("[data-calendar-shift]");
  if (shift) {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + Number(shift.dataset.calendarShift), 1);
    renderCalendar();
    return;
  }
  if (event.target.closest("[data-close-calendar]")) {
    closeSystemPanels();
    return;
  }
  const day = event.target.closest("[data-calendar-day]");
  if (day) {
    selectedCalendarDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), Number(day.dataset.calendarDay));
    renderCalendar();
  }
});
updateQuickSettings();
startSearch.addEventListener("input", () => filterStartMenu(startSearch.value));
document.querySelector("#start-search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runStartSearch();
});
document.querySelector(".start-all-apps").addEventListener("click", () => {
  startSearch.value = "";
  filterStartMenu("");
});
document.querySelector(".start-power").addEventListener("click", () => showToast("Power options are not available in this portfolio."));
startGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  closeStartMenu();
  if (button.dataset.project) openExplorer(button.dataset.project);
  else if (button.dataset.action === "chrome") openChrome();
  else if (button.dataset.action) openBasicWindow(button.dataset.action);
});

pinnedApps.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-pin-project]");
  if (projectButton) {
    openProjectApp(projectButton.dataset.pinProject);
    return;
  }
  if (event.target.closest("[data-pin-chrome]")) openChrome();
});

taskbarApps.addEventListener("click", (event) => {
  const button = event.target.closest("[data-restore]");
  if (!button) return;
  const element = getWindow(button.dataset.restore);
  if (!element) return;
  if (element.classList.contains("minimized")) {
    element.classList.remove("minimized");
    focusWindow(element);
  } else if (element.classList.contains("focused")) {
    element.classList.add("minimized");
    renderTaskbar();
  } else {
    focusWindow(element);
  }
});

windowLayer.addEventListener("click", (event) => {
  const element = event.target.closest(".portfolio-window");
  if (!element) return;
  focusWindow(element);
  const target = event.target;

  if (target.closest("[data-close]")) {
    const wasChrome = element.dataset.window === "chrome";
    element.remove();
    if (wasChrome) {
      chromeTabs = [];
      activeTabId = null;
    }
    renderTaskbar();
    return;
  }
  if (target.closest("[data-minimize]")) {
    element.classList.add("minimized");
    renderTaskbar();
    return;
  }
  if (target.closest("[data-maximize]")) {
    const wasMaximized = element.classList.contains("maximized");
    if (!wasMaximized) {
      const rect = element.getBoundingClientRect();
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.transform = "none";
    }
    element.classList.toggle("maximized");
    if (!wasMaximized) {
      element.style.left = "";
      element.style.top = "";
      element.style.transform = "";
    }
    return;
  }
  if (target.closest("[data-explorer-up]")) {
    const route = element.dataset.explorerRoute || "location:this-pc";
    updateExplorer(element, route.startsWith("project:") ? "location:desktop" : "location:this-pc");
    return;
  }
  if (target.closest("[data-explorer-back]")) {
    const history = explorerHistory.get(element);
    if (history) updateExplorer(element, history.entries[history.index - 1] || "location:this-pc", "back");
    return;
  }
  if (target.closest("[data-explorer-forward]")) {
    const history = explorerHistory.get(element);
    if (history) updateExplorer(element, history.entries[history.index + 1] || "location:this-pc", "forward");
    return;
  }
  const locationButton = target.closest("[data-explorer-location], [data-address-location]");
  if (locationButton) {
    const locationId = locationButton.dataset.explorerLocation || locationButton.dataset.addressLocation;
    updateExplorer(element, `location:${locationId}`);
    return;
  }
  const sidebarProject = target.closest("[data-sidebar-project]");
  if (sidebarProject) {
    updateExplorer(element, `project:${sidebarProject.dataset.sidebarProject}`);
    return;
  }
  if (target.closest("[data-sidebar-home]")) {
    updateExplorer(element, "location:this-pc");
    return;
  }
  const explorerFolder = target.closest(".explorer-folder-row");
  if (explorerFolder) {
    element.querySelectorAll(".explorer-folder-row").forEach((row) => row.classList.remove("selected"));
    explorerFolder.classList.add("selected");
    return;
  }
  if (target.closest("[data-sort-files]")) {
    const area = element.querySelector(".explorer-file-area");
    const rows = [...area.querySelectorAll(".file-row, .explorer-folder-row")].reverse();
    rows.forEach((row) => area.insertBefore(row, area.querySelector(".explorer-selection")));
    return;
  }
  if (target.closest("[data-toggle-view]")) {
    element.querySelector(".explorer-file-area").classList.toggle("list-view");
    return;
  }
  if (target.closest("[data-browser-menu]")) {
    const rect = target.closest("[data-browser-menu]").getBoundingClientRect();
    showContextMenu(rect.left, rect.bottom, { kind: "browser" });
    return;
  }
  const fileRow = target.closest(".file-row");
  if (fileRow) {
    windowLayer.querySelectorAll(".file-row").forEach((row) => row.classList.remove("selected"));
    fileRow.classList.add("selected");
    if (matchMedia("(pointer: coarse)").matches) openFileRow(fileRow);
    return;
  }
  const tabClose = target.closest("[data-close-tab]");
  if (tabClose) {
    const tabId = Number(tabClose.dataset.closeTab);
    const index = chromeTabs.findIndex((tab) => tab.id === tabId);
    chromeTabs = chromeTabs.filter((tab) => tab.id !== tabId);
    if (activeTabId === tabId) activeTabId = chromeTabs[Math.max(0, index - 1)]?.id ?? null;
    if (chromeTabs.length === 0) element.remove();
    else renderChrome();
    renderTaskbar();
    return;
  }
  const tabButton = target.closest("[data-tab]");
  if (tabButton) {
    activeTabId = Number(tabButton.dataset.tab);
    renderChrome();
    return;
  }
  if (target.closest("[data-new-tab]")) {
    createTab();
    return;
  }
  const historyButton = target.closest("[data-history]");
  if (historyButton) {
    const tab = getActiveTab();
    if (!tab) return;
    if (historyButton.dataset.history === "reload") renderChrome();
    if (historyButton.dataset.history === "back" && tab.historyIndex > 0) {
      tab.historyIndex -= 1;
      tab.url = tab.history[tab.historyIndex];
      renderChrome();
    }
    if (historyButton.dataset.history === "forward" && tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex += 1;
      tab.url = tab.history[tab.historyIndex];
      renderChrome();
    }
    return;
  }
  const socialButton = target.closest("[data-social-open]");
  if (socialButton) {
    openSocial(socialButton.dataset.socialOpen);
    return;
  }
  if (target.closest("[data-open-resume]")) openChrome(profile.resume, "Resume.pdf");
});

function openFileRow(fileRow) {
  if (fileRow.dataset.fileKind === "readme") openReadme(fileRow.dataset.project);
  else openProjectApp(fileRow.dataset.project);
}

function openExplorerRow(row) {
  const element = row.closest(".explorer-window");
  if (row.dataset.folderProject) openExplorer(row.dataset.folderProject, false, element);
  else if (row.dataset.folderLocation) openExplorerLocation(row.dataset.folderLocation, element);
  else if (row.dataset.explorerLocation) openExplorerLocation(row.dataset.explorerLocation, element);
  else if (row.dataset.desktopShortcut === "resume" && profile.resume) openChrome(profile.resume, "Resume.pdf");
  else if (row.dataset.desktopShortcut === "recycle-bin") openExplorerLocation("recycle-bin", element);
  else if (row.dataset.desktopSocial) openSocial(row.dataset.desktopSocial);
}

windowLayer.addEventListener("dblclick", (event) => {
  const fileRow = event.target.closest(".file-row");
  if (fileRow) openFileRow(fileRow);
  const folderRow = event.target.closest(".explorer-folder-row");
  if (folderRow) openExplorerRow(folderRow);
});

windowLayer.addEventListener("keydown", (event) => {
  const explorerTab = event.target.closest(".explorer-tabs .explorer-tab");
  if (explorerTab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    const tabs = [...explorerTab.parentElement.querySelectorAll(".explorer-tab")];
    const currentIndex = tabs.indexOf(explorerTab);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
    return;
  }
  if (event.key !== "Enter" && event.key !== " ") return;
  const fileRow = event.target.closest(".file-row");
  const folderRow = event.target.closest(".explorer-folder-row");
  if (!fileRow && !folderRow) return;
  event.preventDefault();
  if (folderRow) openExplorerRow(folderRow);
  else openFileRow(fileRow);
});

windowLayer.addEventListener("submit", (event) => {
  const chromeWindow = event.target.closest(".chrome-window");
  if (!chromeWindow) return;
  event.preventDefault();
  const input = event.target.querySelector("input");
  const tab = getActiveTab();
  if (!input?.value.trim()) return;
  if (tab) navigateTab(tab, input.value);
  else {
    const newTab = createTab();
    if (isSearchQuery(input.value)) navigateGoogleSearch(newTab, input.value);
    else navigateTab(newTab, input.value);
  }
});

windowLayer.addEventListener("contextmenu", (event) => {
  const folderRow = event.target.closest(".explorer-folder-row");
  if (folderRow) {
    event.preventDefault();
    const element = folderRow.closest(".explorer-window");
    const target = { windowId: element.dataset.windowId };
    if (folderRow.dataset.folderProject) Object.assign(target, { kind: "folder", projectId: folderRow.dataset.folderProject });
    else if (folderRow.dataset.folderLocation || folderRow.dataset.explorerLocation || folderRow.dataset.desktopShortcut === "recycle-bin") {
      Object.assign(target, { kind: "location", locationId: folderRow.dataset.folderLocation || folderRow.dataset.explorerLocation || "recycle-bin" });
    } else if (folderRow.dataset.desktopSocial) Object.assign(target, { kind: "social", name: folderRow.dataset.desktopSocial });
    else if (folderRow.dataset.desktopShortcut) Object.assign(target, { kind: "shortcut", action: folderRow.dataset.desktopShortcut });
    else return;
    showContextMenu(event.clientX, event.clientY, target);
    return;
  }
  const row = event.target.closest(".file-row");
  if (row) {
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, {
      kind: "file",
      projectId: row.dataset.project,
      fileKind: row.dataset.fileKind,
    });
    return;
  }
  const browser = event.target.closest(".chrome-window");
  if (browser) {
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, { kind: "browser" });
  }
});

desktop.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".portfolio-window")) return;
  const icon = event.target.closest(".desktop-icon");
  event.preventDefault();
  if (!icon) {
    showContextMenu(event.clientX, event.clientY, { kind: "desktop" });
    return;
  }
  if (icon.dataset.projectFolder) {
    showContextMenu(event.clientX, event.clientY, { kind: "folder", projectId: icon.dataset.projectFolder });
  } else if (icon.dataset.socialShortcut) {
    showContextMenu(event.clientX, event.clientY, { kind: "social", name: icon.dataset.socialShortcut });
  } else if (icon.dataset.action) {
    showContextMenu(event.clientX, event.clientY, { kind: "shortcut", action: icon.dataset.action });
  }
});

contextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-context-action]");
  if (button) runContextAction(button.dataset.contextAction);
});

desktop.addEventListener("click", (event) => {
  const sizeButton = event.target.closest("[data-display-size]");
  if (sizeButton) {
    desktop.querySelectorAll("[data-display-size]").forEach((button) => button.setAttribute("aria-pressed", String(button === sizeButton)));
    return;
  }
  if (event.target.closest("[data-apply-display]")) {
    const selected = desktop.querySelector('[data-display-size][aria-pressed="true"]');
    if (selected) desktopIcons.dataset.iconSize = selected.dataset.displaySize;
    desktop.querySelector(".display-backdrop")?.remove();
    return;
  }
  if (event.target.closest("[data-close-display]") || event.target.matches("[data-display-backdrop]")) {
    desktop.querySelector(".display-backdrop")?.remove();
    return;
  }
  if (event.target.closest("[data-close-properties]") || event.target.matches("[data-properties-backdrop]")) {
    desktop.querySelector(".properties-backdrop")?.remove();
  }
});

desktop.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    desktop.querySelector(".properties-backdrop")?.remove();
    desktop.querySelector(".display-backdrop")?.remove();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#context-menu")) hideContextMenu();
  if (!event.target.closest("#start-menu, #start-button, #taskbar-search")) {
    closeStartMenu();
  }
  if (!event.target.closest("#quick-settings-panel, #calendar-panel, #tray-network, #tray-battery, #tray-clock")) {
    closeSystemPanels();
  }
  if (!event.target.closest(".desktop-icon")) desktopIcons.querySelectorAll(".desktop-icon").forEach((icon) => icon.classList.remove("selected"));
});

windowLayer.addEventListener("pointerdown", (event) => {
  const titlebar = event.target.closest(".window-titlebar");
  if (!titlebar || event.target.closest(".window-controls") || titlebar.parentElement.classList.contains("maximized")) return;
  const element = titlebar.parentElement;
  const rect = element.getBoundingClientRect();
  element.classList.add("no-window-transition");
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.transform = "none";
  dragState = { element, x: event.clientX - rect.left, y: event.clientY - rect.top };
  titlebar.setPointerCapture(event.pointerId);
  focusWindow(element);
});
windowLayer.addEventListener("pointermove", (event) => {
  if (!dragState) return;
  const maxLeft = innerWidth - dragState.element.offsetWidth;
  const maxTop = innerHeight - 54 - 38;
  dragState.element.style.left = `${Math.max(0, Math.min(maxLeft, event.clientX - dragState.x))}px`;
  dragState.element.style.top = `${Math.max(0, Math.min(maxTop, event.clientY - dragState.y))}px`;
});
function finishWindowDrag() {
  if (!dragState) return;
  const element = dragState.element;
  dragState = null;
  requestAnimationFrame(() => element.classList.remove("no-window-transition"));
}
windowLayer.addEventListener("pointerup", finishWindowDrag);
windowLayer.addEventListener("pointercancel", finishWindowDrag);

document.querySelector("#show-desktop").addEventListener("click", () => {
  windowLayer.querySelectorAll(".portfolio-window").forEach((element) => element.classList.add("minimized"));
  renderTaskbar();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideContextMenu();
    closeStartMenu();
    closeSystemPanels();
  }
});
