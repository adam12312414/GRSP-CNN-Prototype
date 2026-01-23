// ELEMENT REFERENCES
const searchInput = document.getElementById("search");
function getMainCards() {
  return document.querySelectorAll(".col-main .card");
}
const sideItems = document.querySelectorAll(".side-item");
const noResults = document.getElementById("noResults");
const navBtns = document.querySelectorAll(".navbtn");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const extraCards = document.getElementById("extraCards");
const moreStoryCards = document.querySelectorAll("#moreStoriesBlock .card[data-category]");

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const lowCarbonToggle = document.getElementById("lowCarbonToggle");

const modeModal = document.getElementById("modeModal");
const chooseStandard = document.getElementById("chooseStandard");
const chooseLow = document.getElementById("chooseLow");

const colSide = document.querySelector(".col-side");
const loadMoreSection = document.querySelector(".load-more-section");

let activeCategory = "all";

let imgObserver = null;

function startImageObserver() {
  stopImageObserver();

  imgObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      const card = img.closest(".card");
      const isMoreHidden = card && card.classList.contains("more-hidden");
      if (isMoreHidden) return;

      img.src = img.dataset.src;
      img.removeAttribute("data-src");
      imgObserver.unobserve(img);
    });
  }, { root: null, rootMargin: "200px 0px", threshold: 0.01 }); // loads slightly before entering view

  document.querySelectorAll("img[data-src]").forEach((img) => {
    const card = img.closest(".card");
    const isMoreHidden = card && card.classList.contains("more-hidden");
    if (isMoreHidden) return;
    imgObserver.observe(img);
  });
}

function stopImageObserver() {
  if (imgObserver) {
    imgObserver.disconnect();
    imgObserver = null;
  }
}

function renderExtrasForCategory() {
  if (!extraCards) return;

  // Clear previously injected cards
  extraCards.innerHTML = "";

  // Only inject extras when a category tab (not All) is selected
  if (activeCategory === "all") return;

  moreStoryCards.forEach((card) => {
    const category = (card.dataset.category || "").toLowerCase();
    if (category !== activeCategory) return;

    // Clone sidebar card into main grid
    const clone = card.cloneNode(true);
    clone.classList.remove("compact");
    extraCards.appendChild(clone);

    if (!document.body.classList.contains("low-carbon")) {
      // if observer is running, observe images in the newly injected cards
      clone.querySelectorAll("img[data-src]").forEach((img) => imgObserver?.observe(img));
    }
  });
}

// FILTERING (SEARCH + CATEGORY)
if (navBtns.length) {
  document.body.classList.add("view-all");
}

function applyFilters() {
  if (!searchInput) return;

  // Normalise search query for case-insensitive matching
  const q = searchInput.value.trim().toLowerCase();
  const isSearching = q !== "";
  let visibleCount = 0;

  // Filter main grid cards by search text + active category
  getMainCards().forEach((card) => {
    const title = (card.dataset.title || "").toLowerCase();
    const category = (card.dataset.category || "all").toLowerCase();

    const matchSearch = !isSearching || title.includes(q);
    const matchCategory = activeCategory === "all" || category === activeCategory;

    const show = matchSearch && matchCategory;
    card.style.display = show ? "" : "none";
    if (show) visibleCount++;
  });

  // Filter sidebar "Catch up" items (only by search text)
  sideItems.forEach((item) => {
    const title = (item.dataset.title || "").toLowerCase();
    item.style.display = !isSearching || title.includes(q) ? "" : "none";
  });

  if (colSide) colSide.style.display = isSearching ? "none" : "";
  if (loadMoreSection) loadMoreSection.style.display = isSearching ? "none" : "";

  if (noResults) {
    noResults.hidden = !(isSearching && visibleCount === 0);
  }

  if (loadMoreBtn) {
    const hiddenLeft = document.querySelectorAll(".more-hidden").length > 0;
    loadMoreBtn.style.display =
      !isSearching && activeCategory === "all" && hiddenLeft ? "" : "none";
  }
}

searchInput?.addEventListener("input", applyFilters);

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    activeCategory = btn.dataset.filter || "all";
    document.body.classList.toggle("view-all", activeCategory === "all");
    document.body.classList.toggle("view-category", activeCategory !== "all");

    renderExtrasForCategory();
    applyFilters();

  });
});

document
  .querySelector('.navbtn[data-filter="all"]')
  ?.classList.add("active");

renderExtrasForCategory();
applyFilters();

// THEME TOGGLE (LIGHT / DARK)
if (themeToggle) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "light" ? "🌙" : "☀️";
  }

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";

    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggle.textContent = next === "light" ? "🌙" : "☀️";
  });
}

function setLowCarbonMode(isOn) {
  document.body.classList.toggle("low-carbon", isOn);
  localStorage.setItem("lowCarbon", String(isOn));

  if (isOn) {
    // Low-carbon: don't load images at all
    stopImageObserver();
  } else {
    // Standard: load images only when they come into view
    startImageObserver();
  }
}

// POPUP ONCE PER TAB SESSION
const POPUP_FLAG = "greenCNN_modePopupShown=1";

function popupAlreadyShownThisTab() {
  return (window.name || "").includes(POPUP_FLAG);
}

function markPopupShownThisTab() {
  const name = window.name || "";
  if (!name.includes(POPUP_FLAG)) {
    window.name = name ? `${name};${POPUP_FLAG}` : POPUP_FLAG;
  }
}

document.querySelectorAll('a.card-link[data-article="true"]').forEach((link) => {
  link.addEventListener("click", () => {
    sessionStorage.setItem("skipModePopupOnce", "true");
  });
});

(function initReadingMode() {
  // Always apply saved mode on page load
  // Default = LOW-CARBON if no preference exists yet
  const savedPref = localStorage.getItem("lowCarbon");
  const isLowCarbon = savedPref === null ? true : savedPref === "true";
  setLowCarbonMode(isLowCarbon);

  if (sessionStorage.getItem("skipModePopupOnce") === "true") {
    sessionStorage.removeItem("skipModePopupOnce");
    return;
  }

  // Once per TAB session
  if (popupAlreadyShownThisTab()) return;

  markPopupShownThisTab();

  // Show popup
  if (modeModal) modeModal.hidden = false;
})();

chooseStandard?.addEventListener("click", () => {
  if (modeModal) modeModal.hidden = true;
  setLowCarbonMode(false);
});

chooseLow?.addEventListener("click", () => {
  if (modeModal) modeModal.hidden = true;
  setLowCarbonMode(true);
});

// toggle button
lowCarbonToggle?.addEventListener("click", () => {
  const next = !document.body.classList.contains("low-carbon");
  setLowCarbonMode(next);
});

loadMoreBtn?.addEventListener("click", () => {
  document.querySelectorAll(".more-hidden").forEach((el) => {
    el.classList.remove("more-hidden");
  });

  if (!document.body.classList.contains("low-carbon")) {
    startImageObserver(); 
  }

  loadMoreBtn.style.display = "none";
});
