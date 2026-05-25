import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const API_BASE = "https://www.themealdb.com/api/json/v2/65232507";

const AREA_REGIONS = {
  Filipino: "Asia",
  Japanese: "Asia",
  Chinese: "Asia",
  Thai: "Asia",
  Indian: "Asia",
  Vietnamese: "Asia",
  Malaysian: "Asia",

  Italian: "Europe",
  French: "Europe",
  British: "Europe",
  Croatian: "Europe",
  Dutch: "Europe",
  Greek: "Europe",
  Irish: "Europe",
  Polish: "Europe",
  Portuguese: "Europe",
  Russian: "Europe",
  Spanish: "Europe",

  American: "North America",
  Canadian: "North America",
  Mexican: "North America",

  Jamaican: "Caribbean",

  Moroccan: "Africa",
  Tunisian: "Africa",
  Kenyan: "Africa",
  Egyptian: "Africa",

  Turkish: "Middle East",
  Lebanese: "Middle East",

  Brazilian: "South America",
  Argentine: "South America",

  Australian: "Oceania"
};

const AREA_FLAGS = {
  Filipino: "🇵🇭",
  Japanese: "🇯🇵",
  Chinese: "🇨🇳",
  Thai: "🇹🇭",
  Indian: "🇮🇳",
  Vietnamese: "🇻🇳",
  Malaysian: "🇲🇾",

  Italian: "🇮🇹",
  French: "🇫🇷",
  British: "🇬🇧",
  Croatian: "🇭🇷",
  Dutch: "🇳🇱",
  Greek: "🇬🇷",
  Irish: "🇮🇪",
  Polish: "🇵🇱",
  Portuguese: "🇵🇹",
  Russian: "🇷🇺",
  Spanish: "🇪🇸",

  American: "🇺🇸",
  Canadian: "🇨🇦",
  Mexican: "🇲🇽",

  Jamaican: "🇯🇲",

  Moroccan: "🇲🇦",
  Tunisian: "🇹🇳",
  Kenyan: "🇰🇪",
  Egyptian: "🇪🇬",

  Turkish: "🇹🇷",
  Lebanese: "🇱🇧",

  Brazilian: "🇧🇷",
  Argentine: "🇦🇷",

  Australian: "🇦🇺"
};

const CATEGORY_EMOJI = {
  Beef: "🥩",
  Chicken: "🍗",
  Dessert: "🍰",
  Seafood: "🦐",
  Vegetarian: "🥗",
  Pasta: "🍝",
  Breakfast: "🥞",
  Lamb: "🍖",
  Pork: "🥓",
  Side: "🥕",
  Goat: "🐐",
  Vegan: "🌱",
  Starter: "🍽️",
  Miscellaneous: "🍴"
};

const ingredientInput = document.getElementById("ingredientInput");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const ingredientChips = document.getElementById("ingredientChips");
const ingredientHelperText = document.getElementById("ingredientHelperText");

const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const browseAllBtn = document.getElementById("browseAllBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const homeBrand = document.getElementById("homeBrand");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuPanel = document.getElementById("mobileMenuPanel");
const mobileUserBadge = document.getElementById("mobileUserBadge");

const mobileFavoritesBtn = document.getElementById("mobileFavoritesBtn");
const mobileLoginBtn = document.getElementById("mobileLoginBtn");
const mobileSignupBtn = document.getElementById("mobileSignupBtn");
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
const mobileRandomBtn = document.getElementById("mobileRandomBtn");

const categoryListPrimary = document.getElementById("categoryListPrimary");
const categoryListSecondary = document.getElementById("categoryListSecondary");

const resultsGrid = document.getElementById("resultsGrid");
const resultsTitle = document.getElementById("resultsTitle");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const recipesSection = document.querySelector(".recipes-section");

const recipeModal = document.getElementById("recipeModal");
const recipeDetailContainer = document.getElementById("recipeDetailContainer");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");

const authModal = document.getElementById("authModal");
const authModalBackdrop = document.getElementById("authModalBackdrop");
const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");

const showLoginTabBtn = document.getElementById("showLoginTabBtn");
const showSignupTabBtn = document.getElementById("showSignupTabBtn");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const authMessage = document.getElementById("authMessage");
const userBadge = document.getElementById("userBadge");
const toastContainer = document.getElementById("toastContainer");

const areaList = document.getElementById("areaList");
const regionList = document.getElementById("regionList");
const areaGroupWrap = document.getElementById("areaGroupWrap");
const areaGroupTitle = document.getElementById("areaGroupTitle");

let customRecipes = [];
let pantryIngredients = [];
let activeCategoryRequestId = 0;
let activeRegion = null;

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  bindAuthEvents();
  await loadCustomRecipes();
  await loadCategories();
  await loadAreas();
  await loadInitialRecipes(false);
  updatePantryUI();
});

function bindEvents() {
  handleAreaClickSetup(areaList);
  handleRegionClickSetup(regionList);

  addIngredientBtn?.addEventListener("click", handleAddIngredient);
  searchBtn?.addEventListener("click", handlePantrySearch);
  randomBtn?.addEventListener("click", handleRandomRecipe);

  mobileMenuBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMobileMenu();
  });

  mobileMenuPanel?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeMobileMenu();
  });

  ingredientInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddIngredient();
    }
  });

  ingredientChips?.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-ingredient]");
    if (!removeBtn) return;

    const ingredient = removeBtn.dataset.removeIngredient;
    pantryIngredients = pantryIngredients.filter((item) => item !== ingredient);
    updatePantryUI();
  });

  handleCategoryClickSetup(categoryListPrimary);
  handleCategoryClickSetup(categoryListSecondary);

  resultsGrid?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    await fetchRecipeDetails(button.dataset.id);
  });

  browseAllBtn?.addEventListener("click", async () => {
    document.querySelectorAll(".chip").forEach((item) => {
      item.classList.remove("active");
    });
    await loadInitialRecipes(true);
  });

  favoritesBtn?.addEventListener("click", async () => {
    await showFavoritesView();
  });

  mobileFavoritesBtn?.addEventListener("click", async () => {
    closeMobileMenu();
    await showFavoritesView();
  });

  mobileRandomBtn?.addEventListener("click", async () => {
    closeMobileMenu();
    await handleRandomRecipe();
  });

  homeBrand?.addEventListener("click", async (event) => {
    event.preventDefault();
    document.querySelectorAll(".chip").forEach((item) => {
      item.classList.remove("active");
    });
    await loadInitialRecipes(true);
  });

  closeModalBtn?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (recipeModal && !recipeModal.classList.contains("hidden")) {
      closeModal();
    }

    if (authModal && !authModal.classList.contains("hidden")) {
      closeAuthModal();
    }

    closeMobileMenu();
  });
}

function openMobileMenu() {
  mobileMenuPanel?.classList.remove("hidden");
  mobileMenuBtn?.setAttribute("aria-expanded", "true");
}

function closeMobileMenu() {
  mobileMenuPanel?.classList.add("hidden");
  mobileMenuBtn?.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  if (!mobileMenuPanel) return;

  if (mobileMenuPanel.classList.contains("hidden")) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
}

function handleCategoryClickSetup(container) {
  container?.addEventListener("click", async (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;

    const isAlreadyActive = chip.classList.contains("active");

    document.querySelectorAll(".chip").forEach((item) => {
      item.classList.remove("active");
    });

    activeRegion = null;
    areaGroupWrap?.classList.add("hidden");
    if (areaList) areaList.innerHTML = "";
    if (areaGroupTitle) areaGroupTitle.textContent = "Countries";

    if (isAlreadyActive) {
      await loadInitialRecipes(true);
      return;
    }

    chip.classList.add("active");
    await fetchRecipesByCategory(chip.dataset.category);

    browseAllBtn?.addEventListener("click", async () => {
  document.querySelectorAll(".chip").forEach((item) => {
    item.classList.remove("active");
  });

  activeRegion = null;
  areaGroupWrap?.classList.add("hidden");
  if (areaList) areaList.innerHTML = "";
  if (areaGroupTitle) areaGroupTitle.textContent = "Countries";

  await loadInitialRecipes(true);
});

homeBrand?.addEventListener("click", async (event) => {
  event.preventDefault();
  document.querySelectorAll(".chip").forEach((item) => {
    item.classList.remove("active");
  });

  activeRegion = null;
  areaGroupWrap?.classList.add("hidden");
  if (areaList) areaList.innerHTML = "";
  if (areaGroupTitle) areaGroupTitle.textContent = "Countries";

  await loadInitialRecipes(true);
});
  });
}
function handleRegionClickSetup(container) {
  container?.addEventListener("click", async (event) => {
    const chip = event.target.closest("[data-region]");
    if (!chip) return;

    const region = chip.dataset.region;
    const isAlreadyActive = chip.classList.contains("active");

    document.querySelectorAll(".chip").forEach((item) => {
      item.classList.remove("active");
    });

    if (isAlreadyActive) {
      activeRegion = null;
      areaGroupWrap?.classList.add("hidden");
      if (areaList) areaList.innerHTML = "";
      if (areaGroupTitle) areaGroupTitle.textContent = "Countries";
      await loadInitialRecipes(true);
      return;
    }

    chip.classList.add("active");
    activeRegion = region;
    renderAreasForRegion(region);
  });
}

function handleAreaClickSetup(container) {
  container?.addEventListener("click", async (event) => {
    const chip = event.target.closest("[data-area]");
    if (!chip) return;

    const isAlreadyActive = chip.classList.contains("active");

    document.querySelectorAll("[data-area]").forEach((item) => {
      item.classList.remove("active");
    });

    if (isAlreadyActive) {
      await loadInitialRecipes(true);
      return;
    }

    chip.classList.add("active");
    await fetchRecipesByArea(chip.dataset.area);
  });
}

function normalizeIngredient(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatIngredientLabel(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function handleAddIngredient() {
  const raw = ingredientInput?.value || "";
  const ingredient = normalizeIngredient(raw);

  if (!ingredient) return;

  const exists = pantryIngredients.includes(ingredient);

  if (exists) {
    ingredientInput.value = "";
    showToast("Ingredient already added.", "info");
    return;
  }

  pantryIngredients.push(ingredient);
  ingredientInput.value = "";
  updatePantryUI();
}

function updatePantryUI() {
  if (ingredientChips) {
    ingredientChips.innerHTML = pantryIngredients
      .map(
        (ingredient) => `
          <div class="ingredient-chip">
            <span>${escapeHtml(formatIngredientLabel(ingredient))}</span>
            <button
              type="button"
              class="ingredient-chip-remove"
              data-remove-ingredient="${escapeHtml(ingredient)}"
              aria-label="Remove ${escapeHtml(formatIngredientLabel(ingredient))}"
            >
              ×
            </button>
          </div>
        `
      )
      .join("");
  }

  const hasIngredients = pantryIngredients.length > 0;

  if (searchBtn) {
    searchBtn.disabled = !hasIngredients;
  }

  if (ingredientHelperText) {
    ingredientHelperText.textContent = hasIngredients
      ? `${pantryIngredients.length} ingredient${pantryIngredients.length !== 1 ? "s" : ""} ready for search.`
      : "Add at least 1 ingredient to search recipes.";
  }
}

function openAuthModal(mode = "login") {
  setAuthTab(mode);
  clearAuthMessage();

  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (mode === "login") {
    loginEmail?.focus();
  } else {
    signupEmail?.focus();
  }
}

function closeAuthModal() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  loginForm?.reset();
  signupForm?.reset();
  clearAuthMessage();
}

function setAuthTab(mode) {
  const isLogin = mode === "login";

  loginForm?.classList.toggle("hidden", !isLogin);
  signupForm?.classList.toggle("hidden", isLogin);

  showLoginTabBtn?.classList.toggle("auth-tab--active", isLogin);
  showSignupTabBtn?.classList.toggle("auth-tab--active", !isLogin);
}

function showAuthMessage(message, type = "error") {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.classList.remove("hidden", "auth-message--error", "auth-message--success");
  authMessage.classList.add(type === "success" ? "auth-message--success" : "auth-message--error");
}

function clearAuthMessage() {
  if (!authMessage) return;
  authMessage.textContent = "";
  authMessage.classList.add("hidden");
  authMessage.classList.remove("auth-message--error", "auth-message--success");
}

function showToast(message, type = "info") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function bindAuthEvents() {
  loginBtn?.addEventListener("click", () => openAuthModal("login"));
  signupBtn?.addEventListener("click", () => openAuthModal("signup"));

  mobileLoginBtn?.addEventListener("click", () => {
    closeMobileMenu();
    openAuthModal("login");
  });

  mobileSignupBtn?.addEventListener("click", () => {
    closeMobileMenu();
    openAuthModal("signup");
  });

  closeAuthModalBtn?.addEventListener("click", closeAuthModal);
  authModalBackdrop?.addEventListener("click", closeAuthModal);

  showLoginTabBtn?.addEventListener("click", () => {
    setAuthTab("login");
    clearAuthMessage();
  });

  showSignupTabBtn?.addEventListener("click", () => {
    setAuthTab("signup");
    clearAuthMessage();
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAuthMessage();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showAuthMessage("Please enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAuthMessage("Logged in successfully.", "success");
      showToast("Logged in successfully.", "success");

      setTimeout(() => {
        closeAuthModal();
      }, 500);
    } catch (error) {
      showAuthMessage(error.message);
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAuthMessage();

    const email = signupEmail.value.trim();
    const password = signupPassword.value;

    if (!email || !password) {
      showAuthMessage("Please enter your email and password.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showAuthMessage("Account created successfully.", "success");
      showToast("Account created successfully.", "success");

      setTimeout(() => {
        closeAuthModal();
      }, 500);
    } catch (error) {
      showAuthMessage(error.message);
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      closeMobileMenu();
      showToast("Logged out successfully.", "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  mobileLogoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      closeMobileMenu();
      showToast("Logged out successfully.", "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginBtn?.classList.add("hidden");
      signupBtn?.classList.add("hidden");
      logoutBtn?.classList.remove("hidden");

      userBadge?.classList.remove("hidden");
      userBadge.textContent = user.email || "Logged in";

      mobileLoginBtn?.classList.add("hidden");
      mobileSignupBtn?.classList.add("hidden");
      mobileLogoutBtn?.classList.remove("hidden");

      mobileUserBadge?.classList.remove("hidden");
      mobileUserBadge.textContent = user.email || "Logged in";
    } else {
      loginBtn?.classList.remove("hidden");
      signupBtn?.classList.remove("hidden");
      logoutBtn?.classList.add("hidden");

      userBadge?.classList.add("hidden");
      userBadge.textContent = "";

      mobileLoginBtn?.classList.remove("hidden");
      mobileSignupBtn?.classList.remove("hidden");
      mobileLogoutBtn?.classList.add("hidden");

      mobileUserBadge?.classList.add("hidden");
      mobileUserBadge.textContent = "";
    }
  });
}

function scrollToRecipes() {
  if (!recipesSection) return;

  recipesSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function loadCustomRecipes() {
  try {
    const files = [
      "./custom-recipe/asia/chinese.json",
      "./custom-recipe/asia/indian.json",
      "./custom-recipe/asia/japanese.json",
      "./custom-recipe/asia/malaysian.json",
      "./custom-recipe/asia/philippines.json",
      "./custom-recipe/asia/thai.json",
      "./custom-recipe/asia/vietnamese.json",
    ];

    const responses = await Promise.all(
      files.map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to load ${path}`);
        }
        return response.json();
      })
    );

    customRecipes = responses.flat();
    console.log("Loaded custom recipes:", customRecipes);
    console.log("Custom recipe count:", customRecipes.length);
  } catch (error) {
    console.error("Custom recipe load error:", error);
    customRecipes = [];
  }
}

function dedupeMeals(meals) {
  const seen = new Set();
  return meals.filter((meal) => {
    if (!meal?.idMeal) return false;
    if (seen.has(meal.idMeal)) return false;
    seen.add(meal.idMeal);
    return true;
  });
}

function mealMatchesQuery(meal, query) {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const searchableParts = [
    meal.strMeal || "",
    meal.strCategory || "",
    meal.strArea || "",
    meal.strTags || "",
    meal.strInstructions || ""
  ];

  for (let i = 1; i <= 20; i++) {
    searchableParts.push(meal[`strIngredient${i}`] || "");
  }

  return searchableParts.join(" ").toLowerCase().includes(q);
}

function normalizeIngredientText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ingredientAliases(term) {
  const normalized = normalizeIngredientText(term);

  const aliasMap = {
    onion: ["onion", "onions", "red onion", "white onion", "yellow onion"],
    garlic: ["garlic", "garlic cloves", "clove garlic", "minced garlic", "garlic powder"],
    tomato: ["tomato", "tomatoes"],
    potato: ["potato", "potatoes"],
    carrot: ["carrot", "carrots"],
    shrimp: ["shrimp", "prawn", "prawns"],
    pork: ["pork", "pork belly", "ground pork", "pork shoulder", "pork butt"],
    chicken: ["chicken", "whole chicken", "chicken breast", "chicken thigh", "chicken thighs"],
    beef: ["beef", "ground beef", "beef shank", "beef ribs", "beef chuck", "oxtail"]
  };

  return aliasMap[normalized] || [normalized];
}

function mealMatchesIngredients(meal, ingredients) {
  const mealIngredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && ingredient.trim()) {
      mealIngredients.push(normalizeIngredientText(ingredient));
    }
  }

  return ingredients.every((ingredient) => {
    const aliases = ingredientAliases(ingredient);

    return aliases.some((alias) =>
      mealIngredients.some((mealIngredient) => mealIngredient.includes(alias))
    );
  });
}

function searchCustomRecipes(query) {
  return customRecipes.filter((meal) => mealMatchesQuery(meal, query));
}

function getCustomMealsByCategory(category) {
  return customRecipes.filter(
    (meal) => (meal.strCategory || "").toLowerCase() === category.toLowerCase()
  );
}

function getCustomMealsByIngredients(ingredients) {
  return customRecipes.filter((meal) => mealMatchesIngredients(meal, ingredients));
}

function getMealByIdFromCustom(id) {
  return customRecipes.find((meal) => meal.idMeal === id) || null;
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/list.php?c=list`);
    const data = await response.json();

    const apiCategories = data.meals ? data.meals.map((item) => item.strCategory) : [];
    const customCategories = customRecipes.map((item) => item.strCategory).filter(Boolean);

    const merged = [...new Set([...apiCategories, ...customCategories])];

    const primaryCategories = ["Beef", "Chicken", "Seafood", "Lamb", "Pork", "Goat"];
    const secondaryCategories = [
      "Breakfast",
      "Dessert",
      "Vegetarian",
      "Vegan",
      "Pasta",
      "Side",
      "Starter",
      "Miscellaneous"
    ];

    const primary = merged
      .filter((name) => primaryCategories.includes(name))
      .sort((a, b) => primaryCategories.indexOf(a) - primaryCategories.indexOf(b));

    const secondaryKnown = merged
      .filter((name) => secondaryCategories.includes(name))
      .sort((a, b) => secondaryCategories.indexOf(a) - secondaryCategories.indexOf(b));

    const remaining = merged
      .filter((name) => !primaryCategories.includes(name) && !secondaryCategories.includes(name))
      .sort((a, b) => a.localeCompare(b));

    const secondary = [...secondaryKnown, ...remaining];

    if (categoryListPrimary) {
      categoryListPrimary.innerHTML = primary
        .map((category) => {
          const emoji = CATEGORY_EMOJI[category] || "🍽️";
          return `
            <button class="chip" type="button" data-category="${escapeHtml(category)}">
              <span class="chip-emoji">${emoji}</span>
              <span>${escapeHtml(category)}</span>
            </button>
          `;
        })
        .join("");
    }

    if (categoryListSecondary) {
      categoryListSecondary.innerHTML = secondary
        .map((category) => {
          const emoji = CATEGORY_EMOJI[category] || "🍽️";
          return `
            <button class="chip" type="button" data-category="${escapeHtml(category)}">
              <span class="chip-emoji">${emoji}</span>
              <span>${escapeHtml(category)}</span>
            </button>
          `;
        })
        .join("");
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

async function loadAreas() {
  try {
    const response = await fetch(`${API_BASE}/list.php?a=list`);
    const data = await response.json();

    const apiAreas = data.meals ? data.meals.map((item) => item.strArea) : [];
    const customAreas = customRecipes.map((item) => item.strArea).filter(Boolean);

    const mergedAreas = [...new Set([...apiAreas, ...customAreas])].sort((a, b) =>
      a.localeCompare(b)
    );

    const regionSet = new Set(mergedAreas.map((area) => AREA_REGIONS[area] || "Other"));

    const regionOrder = [
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Africa",
      "Middle East",
      "Caribbean",
      "Oceania",
      "Other"
    ];

    const regions = [...regionSet].sort((a, b) => {
      const ai = regionOrder.indexOf(a);
      const bi = regionOrder.indexOf(b);

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    if (regionList) {
      regionList.innerHTML = regions
        .map(
          (region) => `
            <button class="chip" type="button" data-region="${escapeHtml(region)}">
              <span>${escapeHtml(region)}</span>
            </button>
          `
        )
        .join("");
    }

    window.__allAreas = mergedAreas;
  } catch (error) {
    console.error("Failed to load areas:", error);
  }
}

function renderAreasForRegion(region) {
  const allAreas = window.__allAreas || [];

  const areas = allAreas.filter((area) => (AREA_REGIONS[area] || "Other") === region);

  if (areaGroupTitle) {
    areaGroupTitle.textContent = `${region} Countries`;
  }

  areaGroupWrap?.classList.remove("hidden");

  if (areaList) {
    areaList.innerHTML = areas
      .map((area) => {
        const flag = AREA_FLAGS[area] || "🌍";

        return `
          <button class="chip" type="button" data-area="${escapeHtml(area)}">
            <span class="area-flag">${flag}</span>
            <span>${escapeHtml(area)}</span>
          </button>
        `;
      })
      .join("");
  }
}

async function loadInitialRecipes(shouldScroll = true) {
  try {
    const randomCustom = [...customRecipes]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const randomApiMeals = [];
    const seenIds = new Set(randomCustom.map((meal) => meal.idMeal));

    let attempts = 0;
    while (randomApiMeals.length < 6 && attempts < 18) {
      attempts++;

      const response = await fetch(`${API_BASE}/random.php`);
      const data = await response.json();
      const meal = data.meals?.[0];

      if (!meal?.idMeal) continue;
      if (seenIds.has(meal.idMeal)) continue;

      seenIds.add(meal.idMeal);
      randomApiMeals.push(meal);
    }

    const mergedMeals = dedupeMeals([...randomCustom, ...randomApiMeals]);

    renderRecipeCards(mergedMeals);
    resultsTitle.textContent = "Recipe Collection";
    resultsCount.textContent = `${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`;

    if (shouldScroll) scrollToRecipes();
  } catch (error) {
    console.error("Failed to load initial recipes:", error);
    showEmptyState();
    resultsTitle.textContent = "Recipe Collection";
    resultsCount.textContent = "0 recipes found";
    if (shouldScroll) scrollToRecipes();
  }
}

function findMatchingCategoryFromIngredient(ingredient) {
  const normalized = ingredient.toLowerCase().trim();

  const aliases = {
    beef: "Beef",
    cow: "Beef",

    chicken: "Chicken",
    "chicken breast": "Chicken",
    "chicken thigh": "Chicken",
    "chicken wings": "Chicken",

    seafood: "Seafood",
    fish: "Seafood",
    shrimp: "Seafood",
    prawn: "Seafood",
    tuna: "Seafood",
    salmon: "Seafood",
    sardines: "Seafood",
    crab: "Seafood",
    mussels: "Seafood",

    lamb: "Lamb",
    pork: "Pork",
    goat: "Goat",

    pasta: "Pasta",
    noodles: "Pasta",

    breakfast: "Breakfast",
    dessert: "Dessert",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    starter: "Starter",
    side: "Side"
  };

  return aliases[normalized] || null;
}

async function handlePantrySearch() {
  if (!pantryIngredients.length) {
    showToast("Add at least 1 ingredient first.", "error");
    return;
  }

  try {
    const customMatches = getCustomMealsByIngredients(pantryIngredients);

    const ingredientResponse = await fetch(
      `${API_BASE}/filter.php?i=${encodeURIComponent(pantryIngredients.join(","))}`
    );
    const ingredientData = await ingredientResponse.json();

    const apiIngredientMeals = (ingredientData.meals || []).map((meal) => ({
      ...meal,
      strCategory: meal.strCategory || "Meal"
    }));

    let categoryMeals = [];

    if (pantryIngredients.length === 1) {
      const singleIngredient = pantryIngredients[0].trim().toLowerCase();
      const matchedCategory = findMatchingCategoryFromIngredient(singleIngredient);

      if (matchedCategory) {
        const categoryResponse = await fetch(
          `${API_BASE}/filter.php?c=${encodeURIComponent(matchedCategory)}`
        );
        const categoryData = await categoryResponse.json();

        categoryMeals = (categoryData.meals || []).map((meal) => ({
          ...meal,
          strCategory: matchedCategory
        }));
      }
    }

    const mergedMeals = dedupeMeals([
      ...customMatches,
      ...apiIngredientMeals,
      ...categoryMeals
    ]);

    resultsTitle.textContent = "Pantry Search Results";
    resultsCount.textContent = `${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`;

    if (!mergedMeals.length) {
      showEmptyState("No recipes matched your ingredient list. Try adding fewer or different ingredients.");
      scrollToRecipes();
      return;
    }

    renderRecipeCards(mergedMeals);
    scrollToRecipes();
  } catch (error) {
    console.error("Pantry search failed:", error);
    resultsTitle.textContent = "Pantry Search Results";
    resultsCount.textContent = "0 recipes found";
    showEmptyState("Something went wrong while searching your pantry ingredients.");
    scrollToRecipes();
  }
}

async function handleRandomRecipe() {
  try {
    const response = await fetch(`${API_BASE}/random.php`);
    const data = await response.json();
    const meal = data.meals?.[0];
    if (!meal) return;
    await renderRecipeDetail(meal);
    openModal();
  } catch (error) {
    console.error("Random recipe failed:", error);
  }
}

async function fetchRecipesByCategory(category) {
  const requestId = ++activeCategoryRequestId;

  try {
    resultsTitle.textContent = `${category} Recipes`;
    resultsCount.textContent = "Loading recipes...";

    const [apiResponse, customCategoryMeals] = await Promise.all([
      fetch(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`),
      Promise.resolve(getCustomMealsByCategory(category))
    ]);

    const apiData = await apiResponse.json();
    const apiMeals = (apiData.meals || []).map((meal) => ({
      ...meal,
      strCategory: category
    }));

    if (requestId !== activeCategoryRequestId) return;

    const mergedMeals = dedupeMeals([...customCategoryMeals, ...apiMeals]);

    if (!mergedMeals.length) {
      resultsTitle.textContent = `${category} Recipes`;
      resultsCount.textContent = "0 recipes found";
      showEmptyState(`No recipes found for ${category}.`);
      scrollToRecipes();
      return;
    }

    renderRecipeCards(mergedMeals);
    resultsTitle.textContent = `${category} Recipes`;
    resultsCount.textContent = `${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`;
    scrollToRecipes();
  } catch (error) {
    if (requestId !== activeCategoryRequestId) return;

    console.error("Category fetch failed:", error);
    resultsTitle.textContent = `${category} Recipes`;
    resultsCount.textContent = "0 recipes found";
    showEmptyState(`Something went wrong while loading ${category} recipes.`);
    scrollToRecipes();
  }
}

async function fetchRecipesByArea(area) {
  try {
    resultsTitle.textContent = `${area} Recipes`;
    resultsCount.textContent = "Loading recipes...";

    const [apiResponse, customAreaMeals] = await Promise.all([
      fetch(`${API_BASE}/filter.php?a=${encodeURIComponent(area)}`),
      Promise.resolve(
        customRecipes.filter(
          (meal) => (meal.strArea || "").toLowerCase() === area.toLowerCase()
        )
      )
    ]);

    const apiData = await apiResponse.json();
    const apiMeals = (apiData.meals || []).map((meal) => ({
      ...meal,
      strArea: area
    }));

    const mergedMeals = dedupeMeals([...customAreaMeals, ...apiMeals]);

    if (!mergedMeals.length) {
      resultsTitle.textContent = `${area} Recipes`;
      resultsCount.textContent = "0 recipes found";
      showEmptyState(`No recipes found for ${area}.`);
      scrollToRecipes();
      return;
    }

    renderRecipeCards(mergedMeals);
    resultsTitle.textContent = `${area} Recipes`;
    resultsCount.textContent = `${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`;
    scrollToRecipes();
  } catch (error) {
    console.error("Area fetch failed:", error);
    resultsTitle.textContent = `${area} Recipes`;
    resultsCount.textContent = "0 recipes found";
    showEmptyState(`Something went wrong while loading ${area} recipes.`);
    scrollToRecipes();
  }
}

async function fetchRecipeDetails(id) {
  try {
    const customMeal = getMealByIdFromCustom(id);

    if (customMeal) {
      await renderRecipeDetail(customMeal);
      openModal();
      return;
    }

    const response = await fetch(`${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    const data = await response.json();
    const meal = data.meals?.[0];

    if (!meal) return;

    await renderRecipeDetail(meal);
    openModal();
  } catch (error) {
    console.error("Recipe detail fetch failed:", error);
  }
}

function renderRecipeCards(meals) {
  emptyState.classList.add("hidden");
  resultsGrid.classList.remove("hidden");

  resultsGrid.innerHTML = meals
    .map((meal) => {
      const category = meal.strCategory || "Meal";
      const topTag = category;

      return `
        <article class="recipe-card">
          <div class="recipe-card-image-wrap">
            <img
              class="recipe-card-image"
              src="${meal.strMealThumb}"
              alt="${escapeHtml(meal.strMeal)}"
              loading="lazy"
            />
            <span class="recipe-tag-top">${escapeHtml(topTag)}</span>
          </div>

          <div class="recipe-card-body">
            <h4 class="recipe-card-title">${escapeHtml(meal.strMeal)}</h4>

            <button class="recipe-card-button" type="button" data-id="${meal.idMeal}">
              View Recipe
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFavoritesCards(meals) {
  emptyState.classList.add("hidden");
  resultsGrid.classList.remove("hidden");

  resultsGrid.innerHTML = meals
    .map((meal) => `
      <article class="recipe-card">
        <div class="recipe-card-image-wrap">
          <img
            class="recipe-card-image"
            src="${meal.strMealThumb}"
            alt="${escapeHtml(meal.strMeal)}"
            loading="lazy"
          />
          <span class="recipe-tag-top">${escapeHtml(meal.strCategory || "Favorite")}</span>
        </div>

        <div class="recipe-card-body">
          <h4 class="recipe-card-title">${escapeHtml(meal.strMeal)}</h4>

          <button class="recipe-card-button" type="button" data-id="${meal.idMeal}">
            View Recipe
          </button>
        </div>
      </article>
    `)
    .join("");
}

function showEmptyState(message = null) {
  resultsGrid.innerHTML = "";
  resultsGrid.classList.add("hidden");
  emptyState.classList.remove("hidden");

  if (message) {
    const emptyParagraph = emptyState.querySelector("p");
    if (emptyParagraph) emptyParagraph.textContent = message;
  }
}

async function renderRecipeDetail(meal) {
  const ingredients = extractIngredients(meal);
  const isSaved = await isFavorite(meal.idMeal);

  const pills = [
    `Category: ${meal.strCategory || "N/A"}`,
    `Area: ${meal.strArea || "N/A"}`
  ];

  recipeDetailContainer.innerHTML = `
    <section class="recipe-detail">
      <img
        class="recipe-detail-hero-image"
        src="${meal.strMealThumb}"
        alt="${escapeHtml(meal.strMeal)}"
      />

      <div class="recipe-detail-body">
        <h2 id="recipeModalTitle" class="recipe-detail-title">
          ${escapeHtml(meal.strMeal)}
        </h2>

        <div class="recipe-detail-tags">
          ${pills
            .map(
              (pill) => `
                <span class="recipe-pill">${escapeHtml(pill)}</span>
              `
            )
            .join("")}
        </div>

        <div class="recipe-detail-grid">
          <div>
            <h3 class="recipe-section-title">Ingredients</h3>
            <ul class="ingredients-clean">
              ${ingredients
                .map((item) => {
                  const [name, measure] = item.split(" - ");
                  return `
                    <li>
                      <span class="ingredients-check">✓</span>
                      <span>
                        <span class="ingredients-name">${escapeHtml(name || "")}</span>
                        ${
                          measure
                            ? `<span class="ingredients-measure"> — ${escapeHtml(measure)}</span>`
                            : ""
                        }
                      </span>
                    </li>
                  `;
                })
                .join("")}
            </ul>
          </div>

          <div>
            <h3 class="recipe-section-title">Instructions</h3>
            <div class="instructions-clean">${escapeHtml(
              meal.strInstructions || "No instructions available."
            )}</div>
          </div>
        </div>

        <hr class="recipe-detail-divider" />

        <div class="recipe-detail-actions">
          ${
            meal.strYoutube
              ? `
                <a
                  class="detail-action-btn detail-action-btn--filled"
                  href="${meal.strYoutube}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="detail-action-icon">▣</span>
                  <span>Watch Video</span>
                </a>
              `
              : `
                <span class="detail-action-btn detail-action-btn--filled" style="opacity:.6; pointer-events:none;">
                  <span class="detail-action-icon">▣</span>
                  <span>Watch Video</span>
                </span>
              `
          }

          ${
            meal.strSource
              ? `
                <a
                  class="detail-action-btn detail-action-btn--outline"
                  href="${meal.strSource}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="detail-action-icon">↗</span>
                  <span>View Source</span>
                </a>
              `
              : `
                <span class="detail-action-btn detail-action-btn--outline" style="opacity:.6; pointer-events:none;">
                  <span class="detail-action-icon">↗</span>
                  <span>View Source</span>
                </span>
              `
          }

          <button
            class="detail-action-btn detail-action-btn--outline ${isSaved ? "favorite-btn-saved" : ""}"
            id="saveFavoriteBtn"
            type="button"
          >
            ${isSaved ? "♥ Saved" : "♡ Save Favorite"}
          </button>
        </div>
      </div>
    </section>
  `;

  const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
  saveFavoriteBtn?.addEventListener("click", async () => {
    await toggleFavorite(meal);
    await renderRecipeDetail(meal);
  });
}

function extractIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(measure ? `${ingredient} - ${measure}` : ingredient);
    }
  }

  return ingredients;
}

async function saveFavorite(meal) {
  const user = auth.currentUser;

  if (!user) {
    openAuthModal("login");
    showAuthMessage("Please log in first to save favorites.");
    return false;
  }

  try {
    await setDoc(doc(db, "users", user.uid, "favorites", meal.idMeal), {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: meal.strCategory || "",
      strArea: meal.strArea || "",
      strInstructions: meal.strInstructions || "",
      strYoutube: meal.strYoutube || "",
      strSource: meal.strSource || "",
      savedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Save favorite error:", error);
    showToast(error.message, "error");
    return false;
  }
}

async function loadFavorites() {
  const user = auth.currentUser;

  if (!user) {
    openAuthModal("login");
    showAuthMessage("Please log in first.");
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
    return snapshot.docs.map((docItem) => docItem.data());
  } catch (error) {
    console.error("Load favorites error:", error);
    showToast(error.message, "error");
    return [];
  }
}

async function removeFavorite(recipeId) {
  const user = auth.currentUser;

  if (!user) {
    openAuthModal("login");
    showAuthMessage("Please log in first.");
    return false;
  }

  try {
    await deleteDoc(doc(db, "users", user.uid, "favorites", recipeId));
    return true;
  } catch (error) {
    console.error("Remove favorite error:", error);
    showToast(error.message, "error");
    return false;
  }
}

async function isFavorite(recipeId) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const docRef = doc(db, "users", user.uid, "favorites", recipeId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Check favorite error:", error);
    return false;
  }
}

async function toggleFavorite(meal) {
  const user = auth.currentUser;

  if (!user) {
    openAuthModal("login");
    showAuthMessage("Please log in first to save favorites.");
    return;
  }

  const saved = await isFavorite(meal.idMeal);

  if (saved) {
    const removed = await removeFavorite(meal.idMeal);
    if (removed) showToast("Removed from favorites.", "info");
  } else {
    const added = await saveFavorite(meal);
    if (added) showToast("Recipe saved to favorites.", "success");
  }
}

async function showFavoritesView() {
  if (!auth.currentUser) {
    openAuthModal("login");
    showAuthMessage("Please log in first to view favorites.");
    return;
  }

  const meals = await loadFavorites();

  resultsTitle.textContent = "My Favorites";
  resultsCount.textContent = `${meals.length} favorite${meals.length !== 1 ? "s" : ""}`;

  if (!meals.length) {
    showEmptyState("You do not have any saved favorites yet.");
    scrollToRecipes();
    return;
  }

  renderFavoritesCards(meals);
  scrollToRecipes();
}

function openModal() {
  recipeModal.classList.remove("hidden");
  recipeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  recipeModal.classList.add("hidden");
  recipeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}