function RecipeGrid({
  meals,
  title,
  subtitle,
  emptyMessage,
  onViewRecipe,
  onBrowseAll,
  isLoading,
}) {
  const hasMeals = meals.length > 0;

  return (
    <section className="recipes-section">
      <div className="container">
        <div className="recipes-head">
          <h3 className="section-title">{title}</h3>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {isLoading && (
          <div className="recipe-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article className="recipe-card recipe-card-skeleton" key={index}>
                <div className="recipe-card-image-wrap skeleton-block"></div>

                <div className="recipe-card-body">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-button"></div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && hasMeals && (
          <div className="recipe-grid">
            {meals.map((meal) => {
              const category = meal.strCategory || "Meal";

              return (
                <article className="recipe-card" key={meal.idMeal}>
                  <div className="recipe-card-image-wrap">
                    <img
                      className="recipe-card-image"
                      src={meal.strMealThumb || "/placeholder-recipe.jpg"}
                      alt={meal.strMeal || "Recipe image"}
                      loading="lazy"
                    />
                    <span className="recipe-tag-top">{category}</span>
                  </div>

                  <div className="recipe-card-body">
                    <h4 className="recipe-card-title">{meal.strMeal}</h4>

                    <button
                      className="recipe-card-button"
                      type="button"
                      onClick={() => onViewRecipe(meal.idMeal)}
                    >
                      View Recipe
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !hasMeals && (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No Recipes Found</h3>
            <p>
              {emptyMessage ||
                "We couldn't find any recipes matching your search. Try adjusting your keywords or explore our categories to discover something delicious."}
            </p>

            <button className="btn btn-primary" type="button" onClick={onBrowseAll}>
              Browse All Recipes
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecipeGrid;