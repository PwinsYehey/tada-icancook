import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./services/firebase";
import { loadCustomRecipes } from "./services/customRecipes";
import WeeklyPlannerModal from "./components/WeeklyPlannerModal";
import AddMealPlanModal from "./components/AddMealPlanModal";

import {
  loadMealPlan,
  removeMealPlanSlot,
  saveMealPlanSlot,
} from "./services/mealPlanService";

import {
  getAreaList,
  getCategoryList,
  getMealById,
  getMealsByArea,
  getMealsByCategory,
  getMealsByIngredient,
  getRandomMeal,
  searchMealsByName,
} from "./services/mealdbApi";

import {
  loadFavorites,
  removeFavorite,
  saveFavorite,
  isFavorite,
} from "./services/favoritesService";

import {
  AREA_REGIONS,
  AREA_FLAGS,
  AREA_ALIASES,
  CATEGORY_EMOJI,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  REGION_ORDER,
} from "./utils/constants";

import {
  dedupeMeals,
  findMatchingCategoryFromIngredient,
  mealMatchesIngredients,
  mealMatchesSearchQuery,
  normalizeIngredient,
} from "./utils/recipeHelpers";

import Header from "./components/Header";
import HeroSearch from "./components/HeroSearch";
import RecipeGrid from "./components/RecipeGrid";
import RecipeModal from "./components/RecipeModal";
import AuthModal from "./components/AuthModal";
import ToastContainer from "./components/ToastContainer";

function App() {
  const recipesSectionRef = useRef(null);

  const [user, setUser] = useState(null);
  const [customRecipes, setCustomRecipes] = useState([]);

  const [meals, setMeals] = useState([]);
  const [resultsTitle, setResultsTitle] = useState("Recipe Collection");
  const [resultsSubtitle, setResultsSubtitle] = useState("Browse delicious meals");
  const [emptyMessage, setEmptyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [searchMode, setSearchMode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pantryIngredients, setPantryIngredients] = useState([]);

  const [categories, setCategories] = useState({
    primary: [],
    secondary: [],
  });

  const [regions, setRegions] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeChip, setActiveChip] = useState(null);
  const [isFavoritesView, setIsFavoritesView] = useState(false);

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isWeeklyPlannerOpen, setIsWeeklyPlannerOpen] = useState(false);
  const [mealPlanItems, setMealPlanItems] = useState([]);
  const [mealToPlan, setMealToPlan] = useState(null);
  const [isAddMealPlanOpen, setIsAddMealPlanOpen] = useState(false);


  function scrollToRecipes() {
    recipesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function showToast(message, type = "info") {
    const id = crypto.randomUUID();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function boot() {
      try {
        setIsLoading(true);

        const loadedCustomRecipes = await loadCustomRecipes();
        setCustomRecipes(loadedCustomRecipes);

        await Promise.all([
          loadCategoriesData(loadedCustomRecipes),
          loadAreasData(loadedCustomRecipes),
        ]);

        await loadInitialRecipes(loadedCustomRecipes, false);
      } finally {
        setIsLoading(false);
      }
    }

    boot();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      setSelectedMeal(null);
      setAuthModalMode(null);
      setIsMobileMenuOpen(false);
      setIsWeeklyPlannerOpen(false);
      setMealToPlan(null);
      setIsAddMealPlanOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function loadCategoriesData(currentCustomRecipes) {
    try {
      const apiCategoryItems = await getCategoryList();
      const apiCategories = apiCategoryItems.map((item) => item.strCategory);

      const customCategories = currentCustomRecipes
        .map((item) => item.strCategory)
        .filter(Boolean);

      const merged = [...new Set([...apiCategories, ...customCategories])];

      const primary = merged
        .filter((name) => PRIMARY_CATEGORIES.includes(name))
        .sort((a, b) => PRIMARY_CATEGORIES.indexOf(a) - PRIMARY_CATEGORIES.indexOf(b));

      const secondaryKnown = merged
        .filter((name) => SECONDARY_CATEGORIES.includes(name))
        .sort((a, b) => SECONDARY_CATEGORIES.indexOf(a) - SECONDARY_CATEGORIES.indexOf(b));

      const remaining = merged
        .filter(
          (name) =>
            !PRIMARY_CATEGORIES.includes(name) && !SECONDARY_CATEGORIES.includes(name)
        )
        .sort((a, b) => a.localeCompare(b));

      setCategories({
        primary,
        secondary: [...secondaryKnown, ...remaining],
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
      showToast("Failed to load categories.", "error");
    }
  }

  async function loadAreasData(currentCustomRecipes) {
    try {
      const apiAreaItems = await getAreaList();
      const apiAreas = apiAreaItems.map((item) => item.strArea);

      const customAreas = currentCustomRecipes.map((item) => item.strArea).filter(Boolean);

      const mergedAreas = [...new Set([...apiAreas, ...customAreas])].sort((a, b) =>
        a.localeCompare(b)
      );

      const regionSet = new Set(mergedAreas.map((area) => AREA_REGIONS[area] || "Other"));

      const sortedRegions = [...regionSet].sort((a, b) => {
        const ai = REGION_ORDER.indexOf(a);
        const bi = REGION_ORDER.indexOf(b);

        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

      setAllAreas(mergedAreas);
      setRegions(sortedRegions);
    } catch (error) {
      console.error("Failed to load areas:", error);
      showToast("Failed to load regions.", "error");
    }
  }

  async function loadInitialRecipes(currentCustomRecipes = customRecipes, shouldScroll = true) {
    try {
      setIsLoading(true);
      setIsFavoritesView(false);

      const randomCustom = [...currentCustomRecipes]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);

      const randomApiMeals = [];
      const seenIds = new Set(randomCustom.map((meal) => meal.idMeal));

      let attempts = 0;

      while (randomApiMeals.length < 6 && attempts < 18) {
        attempts++;

        const meal = await getRandomMeal();

        if (!meal?.idMeal) continue;
        if (seenIds.has(meal.idMeal)) continue;

        seenIds.add(meal.idMeal);
        randomApiMeals.push(meal);
      }

      const mergedMeals = dedupeMeals([...randomCustom, ...randomApiMeals]);

      setMeals(mergedMeals);
      setResultsTitle("Recipe Collection");
      setResultsSubtitle(`${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`);
      setEmptyMessage("");

      if (shouldScroll) scrollToRecipes();
    } catch (error) {
      console.error("Failed to load initial recipes:", error);
      setMeals([]);
      setResultsTitle("Recipe Collection");
      setResultsSubtitle("0 recipes found");
      setEmptyMessage("Something went wrong while loading recipes.");

      if (shouldScroll) scrollToRecipes();
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddIngredient() {
    const ingredient = normalizeIngredient(searchInput);

    if (!ingredient) return;

    if (pantryIngredients.includes(ingredient)) {
      setSearchInput("");
      showToast("Ingredient already added.", "info");
      return;
    }

    setPantryIngredients((current) => [...current, ingredient]);
    setSearchInput("");
  }

  function handleRemoveIngredient(ingredient) {
    setPantryIngredients((current) => current.filter((item) => item !== ingredient));
  }

  function getCustomMealsByIngredients(ingredients) {
    return customRecipes.filter((meal) => mealMatchesIngredients(meal, ingredients));
  }

  async function handlePantrySearch() {
    if (!pantryIngredients.length) {
      showToast("Add at least 1 ingredient first.", "error");
      return;
    }

    try {
      setIsLoading(true);
      setIsFavoritesView(false);
      setActiveChip(null);
      setActiveRegion(null);
      setResultsTitle("Pantry Search Results");
      setResultsSubtitle("Loading recipes...");

      const customMatches = getCustomMealsByIngredients(pantryIngredients);

      const apiIngredientMeals = await getMealsByIngredient(pantryIngredients.join(","));

      let categoryMeals = [];

      if (pantryIngredients.length === 1) {
        const matchedCategory = findMatchingCategoryFromIngredient(pantryIngredients[0]);

        if (matchedCategory) {
          const apiCategoryMeals = await getMealsByCategory(matchedCategory);

          categoryMeals = apiCategoryMeals.map((meal) => ({
            ...meal,
            strCategory: matchedCategory,
          }));
        }
      }

      const mergedMeals = dedupeMeals([
        ...customMatches,
        ...apiIngredientMeals,
        ...categoryMeals,
      ]);

      setMeals(mergedMeals);
      setResultsTitle("Pantry Search Results");
      setResultsSubtitle(`${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`);
      setEmptyMessage(
        "No recipes matched your ingredient list. Try adding fewer or different ingredients."
      );

      scrollToRecipes();
    } catch (error) {
      console.error("Pantry search failed:", error);
      setMeals([]);
      setResultsTitle("Pantry Search Results");
      setResultsSubtitle("0 recipes found");
      setEmptyMessage("Something went wrong while searching your pantry ingredients.");
      scrollToRecipes();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecipeNameSearch() {
    const query = searchInput.trim();

    if (!query) {
      showToast("Enter a recipe name to search.", "error");
      return;
    }

    try {
      setIsLoading(true);
      setIsFavoritesView(false);
      setActiveChip(null);
      setActiveRegion(null);
      setResultsTitle(`Search Results for "${query}"`);
      setResultsSubtitle("Loading recipes...");

      const customMatches = customRecipes.filter((meal) =>
        mealMatchesSearchQuery(meal, query)
      );

      const apiMatches = await searchMealsByName(query);

      const mergedMeals = dedupeMeals([...customMatches, ...apiMatches]);

      setMeals(mergedMeals);
      setResultsTitle(`Search Results for "${query}"`);
      setResultsSubtitle(`${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`);
      setEmptyMessage(`No recipes found for "${query}". Try another recipe name.`);

      scrollToRecipes();
    } catch (error) {
      console.error("Recipe name search failed:", error);
      setMeals([]);
      setResultsTitle(`Search Results for "${query}"`);
      setResultsSubtitle("0 recipes found");
      setEmptyMessage("Something went wrong while searching recipes.");
      scrollToRecipes();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch() {
    if (searchMode === "ingredients") {
      await handlePantrySearch();
      return;
    }

    await handleRecipeNameSearch();
  }

  async function handleClearSearch() {
    setSearchInput("");
    setPantryIngredients([]);
    setActiveChip(null);
    setActiveRegion(null);
    setIsFavoritesView(false);
    await loadInitialRecipes(customRecipes, true);
  }

  async function fetchRecipesByCategory(category) {
    const activeKey = `category:${category}`;

    if (activeChip === activeKey) {
      setActiveChip(null);
      await loadInitialRecipes(customRecipes, true);
      return;
    }

    try {
      setIsLoading(true);
      setIsFavoritesView(false);
      setActiveChip(activeKey);
      setActiveRegion(null);

      setResultsTitle(`${category} Recipes`);
      setResultsSubtitle("Loading recipes...");

      const customCategoryMeals = customRecipes.filter(
        (meal) => (meal.strCategory || "").toLowerCase() === category.toLowerCase()
      );

      const apiMealsRaw = await getMealsByCategory(category);

      const apiMeals = apiMealsRaw.map((meal) => ({
        ...meal,
        strCategory: category,
      }));

      const mergedMeals = dedupeMeals([...customCategoryMeals, ...apiMeals]);

      setMeals(mergedMeals);
      setResultsTitle(`${category} Recipes`);
      setResultsSubtitle(`${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`);
      setEmptyMessage(`No recipes found for ${category}.`);

      scrollToRecipes();
    } catch (error) {
      console.error("Category fetch failed:", error);
      setMeals([]);
      setResultsTitle(`${category} Recipes`);
      setResultsSubtitle("0 recipes found");
      setEmptyMessage(`Something went wrong while loading ${category} recipes.`);
      scrollToRecipes();
    } finally {
      setIsLoading(false);
    }
  }

  function getAreaAliases(area) {
    return AREA_ALIASES[area] || [area];
  }

  function mealMatchesArea(meal, area) {
    const aliases = getAreaAliases(area).map((item) => item.toLowerCase());
    const mealArea = (meal.strArea || "").toLowerCase();

    return aliases.includes(mealArea);
  }

async function fetchRecipesByArea(area) {
  const activeKey = `area:${area}`;

  if (activeChip === activeKey) {
    setActiveChip(null);
    await loadInitialRecipes(customRecipes, true);
    return;
  }

  try {
    setIsLoading(true);
    setIsFavoritesView(false);
    setActiveChip(activeKey);

    setResultsTitle(`${area} Recipes`);
    setResultsSubtitle("Loading recipes...");

    const areaAliases = getAreaAliases(area);

    const customAreaMeals = customRecipes.filter((meal) =>
      mealMatchesArea(meal, area)
    );

    const apiResults = await Promise.all(
      areaAliases.map(async (alias) => {
        try {
          const meals = await getMealsByArea(alias);

          return meals.map((meal) => ({
            ...meal,
            strArea: area,
          }));
        } catch (error) {
          console.warn(`No API meals found for area alias: ${alias}`);
          return [];
        }
      })
    );

    const apiMeals = apiResults.flat();

    const mergedMeals = dedupeMeals([...customAreaMeals, ...apiMeals]);

    setMeals(mergedMeals);
    setResultsTitle(`${area} Recipes`);
    setResultsSubtitle(
      `${mergedMeals.length} recipe${mergedMeals.length !== 1 ? "s" : ""} found`
    );
    setEmptyMessage(`No recipes found for ${area}.`);

    scrollToRecipes();
  } catch (error) {
    console.error("Area fetch failed:", error);
    setMeals([]);
    setResultsTitle(`${area} Recipes`);
    setResultsSubtitle("0 recipes found");
    setEmptyMessage(`Something went wrong while loading ${area} recipes.`);
    scrollToRecipes();
  } finally {
    setIsLoading(false);
  }
}

  async function getFullMealDetails(mealOrId) {
    const id = typeof mealOrId === "string" ? mealOrId : mealOrId?.idMeal;

    if (!id) return null;

    const customMeal = customRecipes.find((meal) => meal.idMeal === id);

    if (customMeal) {
      return customMeal;
    }

    const visibleMeal = meals.find((meal) => meal.idMeal === id);
    const existingMeal = typeof mealOrId === "object" ? mealOrId : visibleMeal;

    const alreadyHasFullDetails =
      existingMeal?.strInstructions &&
      Array.from({ length: 20 }, (_, index) => {
        const number = index + 1;
        return existingMeal[`strIngredient${number}`];
      }).some(Boolean);

    if (alreadyHasFullDetails) {
      return existingMeal;
    }

    const apiFullMeal = await getMealById(id);
    return apiFullMeal;
  }

  async function fetchRecipeDetails(id) {
    try {
      const fullMeal = await getFullMealDetails(id);

      if (!fullMeal) {
        showToast("Recipe details could not be loaded.", "error");
        return;
      }

      setSelectedMeal(fullMeal);
    } catch (error) {
      console.error("Recipe detail fetch failed:", error);
      showToast("Something went wrong while loading recipe details.", "error");
    }
  }

  async function handleWeeklyPlanner() {
    if (!auth.currentUser) {
      setAuthModalMode("login");
      showToast("Please log in first to use the weekly planner.", "error");
      return;
    }

    try {
      setIsLoading(true);

      const items = await loadMealPlan();

      setMealPlanItems(items);
      setIsWeeklyPlannerOpen(true);
    } catch (error) {
      console.error("Load weekly planner failed:", error);
      showToast("Something went wrong while loading your weekly planner.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOpenAddToMealPlan(meal) {
  if (!auth.currentUser) {
    setAuthModalMode("login");
    showToast("Please log in first to use the weekly planner.", "error");
    return;
  }

  try {
    const fullMeal = await getFullMealDetails(meal);

    if (!fullMeal) {
      showToast("Recipe details could not be loaded.", "error");
      return;
    }

    setMealToPlan(fullMeal);
    setIsAddMealPlanOpen(true);
  } catch (error) {
    console.error("Open add to meal plan failed:", error);
    showToast("Something went wrong while preparing the meal planner.", "error");
  }
}

async function handleSaveMealPlanSlot({ day, mealTime, meal }) {
  if (!auth.currentUser) {
    setAuthModalMode("login");
    showToast("Please log in first to use the weekly planner.", "error");
    return;
  }

  try {
    const fullMeal = await getFullMealDetails(meal);

    if (!fullMeal) {
      showToast("Recipe details could not be saved to planner.", "error");
      return;
    }

    await saveMealPlanSlot({
      day,
      mealTime,
      meal: fullMeal,
    });

    const updatedMealPlan = await loadMealPlan();
    setMealPlanItems(updatedMealPlan);

    setIsAddMealPlanOpen(false);
    setMealToPlan(null);

    showToast(`${fullMeal.strMeal} added to ${day} ${mealTime}.`, "success");
  } catch (error) {
    console.error("Save meal plan slot failed:", error);
    showToast("Something went wrong while saving to the meal planner.", "error");
  }
}

  async function handleRemoveMealPlanSlot(slotId) {
    try {
      await removeMealPlanSlot(slotId);

      setMealPlanItems((current) =>
        current.filter((item) => item.slotId !== slotId)
      );

      showToast("Meal removed from planner.", "info");
    } catch (error) {
      console.error("Remove meal plan slot failed:", error);
      showToast("Something went wrong while removing the meal.", "error");
    }
  }

  async function handleViewPlannedRecipe(id) {
    setIsWeeklyPlannerOpen(false);
    await fetchRecipeDetails(id);
  }

  async function handleFavoritesView() {
    if (!auth.currentUser) {
      setAuthModalMode("login");
      showToast("Please log in first to view favorites.", "error");
      return;
    }

    try {
      setIsLoading(true);

      const favoriteMeals = await loadFavorites();

      setIsFavoritesView(true);
      setActiveChip(null);
      setActiveRegion(null);
      setMeals(favoriteMeals);
      setResultsTitle("My Favorites");
      setResultsSubtitle(`${favoriteMeals.length} favorite${favoriteMeals.length !== 1 ? "s" : ""}`);
      setEmptyMessage("You do not have any saved favorites yet.");

      scrollToRecipes();
    } catch (error) {
      console.error("Load favorites failed:", error);
      showToast("Something went wrong while loading favorites.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFavorite(meal) {
    if (!auth.currentUser) {
      setAuthModalMode("login");
      showToast("Please log in first to save favorites.", "error");
      return false;
    }

    try {
      const saved = await isFavorite(meal.idMeal);

      if (saved) {
        await removeFavorite(meal.idMeal);

        if (isFavoritesView) {
          setMeals((current) => {
            const updated = current.filter((item) => item.idMeal !== meal.idMeal);

            setResultsSubtitle(
              `${updated.length} favorite${updated.length !== 1 ? "s" : ""}`
            );

            return updated;
          });

          setSelectedMeal(null);
        }

        showToast("Removed from favorites.", "info");
        return false;
      }

      const fullMeal = await getFullMealDetails(meal);

      if (!fullMeal) {
        showToast("Recipe details could not be saved.", "error");
        return false;
      }

      await saveFavorite(fullMeal);
      showToast("Recipe saved to favorites.", "success");
      return true;
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      showToast("Something went wrong while updating favorites.", "error");
      return false;
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);

      setIsMobileMenuOpen(false);
      setIsFavoritesView(false);
      setSelectedMeal(null);
      setAuthModalMode(null);

      showToast("Logged out successfully.", "info");

      await loadInitialRecipes(customRecipes, true);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleHome() {
    setIsFavoritesView(false);
    setActiveChip(null);
    setActiveRegion(null);
    setSearchInput("");
    setPantryIngredients([]);
    await loadInitialRecipes(customRecipes, true);
  }

  const areasForActiveRegion = useMemo(() => {
    if (!activeRegion) return [];

    return allAreas.filter((area) => (AREA_REGIONS[area] || "Other") === activeRegion);
  }, [activeRegion, allAreas]);

  return (
    <>
      <Header
        user={user}
        onHome={handleHome}
        onFavorites={handleFavoritesView}
        onWeeklyPlanner={handleWeeklyPlanner}
        onLogin={() => setAuthModalMode("login")}
        onSignup={() => setAuthModalMode("signup")}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((current) => !current)}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <main>
        <HeroSearch
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          pantryIngredients={pantryIngredients}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isLoading={isLoading}
        />

        <section className="categories-section">
          <div className="container">
            <h3 className="section-title">Browse Categories</h3>

            <div className="category-groups">
              <div className="category-group">
                <h4 className="category-group-title">Main Ingredients</h4>

                <div className="chip-list">
                  {categories.primary.map((category) => (
                    <button
                      key={category}
                      className={`chip ${activeChip === `category:${category}` ? "active" : ""}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => fetchRecipesByCategory(category)}
                    >
                      <span className="chip-emoji">{CATEGORY_EMOJI[category] || "🍽️"}</span>
                      <span>{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="category-group">
                <h4 className="category-group-title">Meal Types</h4>

                <div className="chip-list">
                  {categories.secondary.map((category) => (
                    <button
                      key={category}
                      className={`chip ${activeChip === `category:${category}` ? "active" : ""}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => fetchRecipesByCategory(category)}
                    >
                      <span className="chip-emoji">{CATEGORY_EMOJI[category] || "🍽️"}</span>
                      <span>{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="areas-section">
          <div className="container">
            <h3 className="section-title">Browse by Region</h3>

            <div className="chip-list">
              {regions.map((region) => (
                <button
                  key={region}
                  className={`chip ${activeRegion === region ? "active" : ""}`}
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    setActiveChip(null);

                    if (activeRegion === region) {
                      setActiveRegion(null);
                      await loadInitialRecipes(customRecipes, true);
                      return;
                    }

                    setActiveRegion(region);
                  }}
                >
                  <span>{region}</span>
                </button>
              ))}
            </div>

            {activeRegion && (
              <div className="area-group-wrap">
                <h4 className="category-group-title">{activeRegion} Countries</h4>

                <div className="chip-list">
                  {areasForActiveRegion.map((area) => (
                    <button
                      key={area}
                      className={`chip ${activeChip === `area:${area}` ? "active" : ""}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => fetchRecipesByArea(area)}
                    >
                      <span className="area-flag">{AREA_FLAGS[area] || "🌍"}</span>
                      <span>{area}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div ref={recipesSectionRef}>
          <RecipeGrid
            meals={meals}
            title={resultsTitle}
            subtitle={resultsSubtitle}
            emptyMessage={emptyMessage}
            onViewRecipe={fetchRecipeDetails}
            onBrowseAll={handleHome}
            isLoading={isLoading}
          />
        </div>
      </main>

      <RecipeModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onToggleFavorite={handleToggleFavorite}
        onAddToMealPlan={handleOpenAddToMealPlan}
      />

      <AuthModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onSuccess={showToast}
      />

      <WeeklyPlannerModal
        isOpen={isWeeklyPlannerOpen}
        mealPlanItems={mealPlanItems}
        onClose={() => setIsWeeklyPlannerOpen(false)}
        onRemoveSlot={handleRemoveMealPlanSlot}
        onViewRecipe={handleViewPlannedRecipe}
      />

      <AddMealPlanModal
        meal={mealToPlan}
        isOpen={isAddMealPlanOpen}
        onClose={() => {
          setIsAddMealPlanOpen(false);
          setMealToPlan(null);
        }}
        onSave={handleSaveMealPlanSlot}
      />

      <ToastContainer toasts={toasts} />

      <footer className="site-footer">
        <div className="container">
          <p>© 2026 TaDa! I Can Cook! — Discover recipes, explore flavors, cook with confidence.</p>
        </div>
      </footer>
    </>
  );
}

export default App;