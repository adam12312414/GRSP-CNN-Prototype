// Green JS: local filtering (no server calls)
// - Search filters by title
// - Category tabs filter by data-category
// - Shows "No results found" if nothing matches

const searchInput = document.getElementById("search");
const cards = document.querySelectorAll(".col-main .card"); // MAIN cards only
const sideItems = document.querySelectorAll(".side-item");
const noResults = document.getElementById("noResults");
const navBtns = document.querySelectorAll(".navbtn");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let activeCategory = "all";

// Set homepage view class
if (navBtns.length) {
  document.body.classList.add("view-all");
}

function applyFilters() {
  if (!searchInput) return;

  const q = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  // Filter MAIN cards
  cards.forEach((card) => {
    const title = (card.dataset.title || "").toLowerCase();
    const category = (card.dataset.category || "all").toLowerCase();

    const matchSearch = q === "" || title.includes(q);
    const matchCategory = activeCategory === "all" || category === activeCategory;

    const show = matchSearch && matchCategory;
    card.style.display = show ? "" : "none";

    if (show) visibleCount++;
  });

  // Filter sidebar "Catch up" items (search only)
  sideItems.forEach((item) => {
    const title = (item.dataset.title || "").toLowerCase();
    const show = q === "" || title.includes(q);
    item.style.display = show ? "" : "none";
  });

  // No results message
  if (noResults) {
    noResults.hidden = visibleCount !== 0;
  }

  // Show / hide Load More
  if (loadMoreBtn) {
    const hiddenLeft = document.querySelectorAll(".more-hidden").length > 0;
    const shouldShow =
      activeCategory === "all" &&
      hiddenLeft &&
      q === "";

    loadMoreBtn.style.display = shouldShow ? "" : "none";
  }
}

// Search input
if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

// Category buttons
if (navBtns.length) {
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      activeCategory = btn.dataset.filter || "all";

      document.body.classList.toggle("view-all", activeCategory === "all");
      document.body.classList.toggle("view-category", activeCategory !== "all");

      applyFilters();
    });
  });

  // Default active tab
  document
    .querySelector('.navbtn[data-filter="all"]')
    ?.classList.add("active");

  // Initial render
  applyFilters();
}

// Theme toggle (Light / Dark)
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "light" ? "🌙" : "☀️";
  } else {
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    themeToggle.textContent = prefersLight ? "🌙" : "☀️";
  }

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";

    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggle.textContent = next === "light" ? "🌙" : "☀️";
  });
}

// Low-Carbon Reading Mode (Text-first)
const lowCarbonToggle = document.getElementById("lowCarbonToggle");

if (lowCarbonToggle) {
  const savedLowCarbon = localStorage.getItem("lowCarbon");
  if (savedLowCarbon === "true") {
    document.body.classList.add("low-carbon");
  }

  lowCarbonToggle.addEventListener("click", () => {
    document.body.classList.toggle("low-carbon");
    localStorage.setItem(
      "lowCarbon",
      document.body.classList.contains("low-carbon")
    );
  });
}

// Load More (ONE click only)
loadMoreBtn?.addEventListener("click", () => {
  document.querySelectorAll(".more-hidden").forEach(el => el.classList.remove("more-hidden"));
  loadMoreBtn.style.display = "none";
});
