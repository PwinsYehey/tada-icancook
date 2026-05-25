import { formatIngredientLabel } from "../utils/recipeHelpers";

function HeroSearch({
  searchMode,
  setSearchMode,
  searchInput,
  setSearchInput,
  pantryIngredients,
  onAddIngredient,
  onRemoveIngredient,
  onSearch,
  onClear,
  isLoading,
}) {
  const isIngredientMode = searchMode === "ingredients";
  const isRecipeMode = searchMode === "recipe";
  const hasIngredients = pantryIngredients.length > 0;
  const hasRecipeQuery = searchInput.trim().length > 0;
  const hasSelectedSearchMode = searchMode === "ingredients" || searchMode === "recipe";

  return (
    <section className="hero">
      <div className="container hero-inner">
        <h2 className="hero-title">
          Discover Your Next
          <span>Delicious Meal</span>
        </h2>

        <p className="hero-subtitle">
          Search thousands of recipes, explore categories, and discover meals that match your
          taste. From quick weeknight dinners to gourmet desserts.
        </p>

        <div className="pantry-search-card">
          <div className="search-mode-tabs">
            <span className="search-mode-label">Search by</span>

            <button
              type="button"
              className={`search-mode-tab ${isIngredientMode ? "active" : ""}`}
              disabled={isLoading}
              onClick={() => {
                setSearchMode("ingredients");
                setSearchInput("");
              }}
            >
              Ingredients
            </button>

            <button
              type="button"
              className={`search-mode-tab ${isRecipeMode ? "active" : ""}`}
              disabled={isLoading}
              onClick={() => {
                setSearchMode("recipe");
                setSearchInput("");
              }}
            >
              Recipe
            </button>
          </div>

          <div className="pantry-search-top">
            <div className="search-box pantry-input-wrap">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                value={searchInput}
                disabled={!hasSelectedSearchMode || isLoading}
                placeholder={
                  !hasSelectedSearchMode
                    ? "Choose a search type first..."
                    : isIngredientMode
                    ? "Add an ingredient like egg, garlic, rice..."
                    : "Search a recipe like adobo, biryani, pasta..."
                }
                aria-label={isIngredientMode ? "Add ingredient" : "Search recipe name"}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (isIngredientMode) {
                      onAddIngredient();
                    } else if (isRecipeMode) {
                      onSearch();
                    }
                  }
                }}
              />
            </div>

            {isIngredientMode && (
              <button
                className="btn btn-outline search-btn search-btn-secondary"
                type="button"
                disabled={isLoading}
                onClick={onAddIngredient}
              >
                Add
              </button>
            )}

            <button
              className="btn btn-primary search-btn search-btn-main"
              type="button"
              disabled={
                isLoading ||
                !hasSelectedSearchMode ||
                (isIngredientMode ? !hasIngredients : !hasRecipeQuery)
              }
              onClick={onSearch}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>

            <button
              className="btn btn-outline search-btn search-btn-clear"
              type="button"
              disabled={isLoading}
              onClick={onClear}
            >
              Clear
            </button>
          </div>

          <div className="pantry-helper">
            {!hasSelectedSearchMode
              ? "Choose whether you want to search by ingredients or by recipe name."
              : isIngredientMode
              ? hasIngredients
                ? `${pantryIngredients.length} ingredient${
                    pantryIngredients.length !== 1 ? "s" : ""
                  } ready for search.`
                : "Add at least 1 ingredient to search recipes."
              : "Search directly by recipe name or keyword."}
          </div>

          {isIngredientMode && (
            <div className="ingredient-chip-list">
              {pantryIngredients.map((ingredient) => (
                <div className="ingredient-chip" key={ingredient}>
                  <span>{formatIngredientLabel(ingredient)}</span>

                  <button
                    type="button"
                    className="ingredient-chip-remove"
                    disabled={isLoading}
                    aria-label={`Remove ${formatIngredientLabel(ingredient)}`}
                    onClick={() => onRemoveIngredient(ingredient)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSearch;