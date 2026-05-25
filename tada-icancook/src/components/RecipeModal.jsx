import { useEffect, useState } from "react";
import { extractIngredients } from "../utils/recipeHelpers";
import { isFavorite } from "../services/favoritesService";

function RecipeModal({ meal, onClose, onToggleFavorite, onAddToMealPlan }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function checkSaved() {
      if (!meal?.idMeal) return;
      const result = await isFavorite(meal.idMeal);
      setSaved(result);
    }

    checkSaved();
  }, [meal]);

  useEffect(() => {
    if (!meal) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [meal]);

  if (!meal) return null;

  const ingredients = extractIngredients(meal);

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal-backdrop" onClick={onClose}></div>

      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipeModalTitle"
      >
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <section className="recipe-detail">
          <img
            className="recipe-detail-hero-image"
            src={meal.strMealThumb || "/placeholder-recipe.jpg"}
            alt={meal.strMeal}
          />

          <div className="recipe-detail-body">
            <h2 id="recipeModalTitle" className="recipe-detail-title">
              {meal.strMeal}
            </h2>

            <div className="recipe-detail-tags">
              <span className="recipe-pill">Category: {meal.strCategory || "N/A"}</span>
              <span className="recipe-pill">Area: {meal.strArea || "N/A"}</span>
            </div>

            <div className="recipe-detail-grid">
              <div>
                <h3 className="recipe-section-title">Ingredients</h3>

                <ul className="ingredients-clean">
                  {ingredients.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <span className="ingredients-check">✓</span>
                      <span>
                        <span className="ingredients-name">{item.name}</span>
                        {item.measure && (
                          <span className="ingredients-measure"> — {item.measure}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="recipe-section-title">Instructions</h3>
                <div className="instructions-clean">
                  {meal.strInstructions || "No instructions available."}
                </div>
              </div>
            </div>

            <hr className="recipe-detail-divider" />

            <div className="recipe-detail-actions">
              {meal.strYoutube ? (
                <a
                  className="detail-action-btn detail-action-btn--filled"
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="detail-action-icon">▣</span>
                  <span>Watch Video</span>
                </a>
              ) : (
                <span
                  className="detail-action-btn detail-action-btn--filled"
                  style={{ opacity: 0.6, pointerEvents: "none" }}
                >
                  <span className="detail-action-icon">▣</span>
                  <span>Watch Video</span>
                </span>
              )}

              {meal.strSource ? (
                <a
                  className="detail-action-btn detail-action-btn--primary-plan"
                  href={meal.strSource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="detail-action-icon">↗</span>
                  <span>View Source</span>
                </a>
              ) : (
                <span
                  className="detail-action-btn detail-action-btn--outline"
                  style={{ opacity: 0.6, pointerEvents: "none" }}
                >
                  <span className="detail-action-icon">↗</span>
                  <span>View Source</span>
                </span>
              )}

              <button
                className="detail-action-btn detail-action-btn--outline"
                type="button"
                onClick={() => onAddToMealPlan(meal)}
              >
                <span className="detail-action-icon">＋</span>
                <span>Add to Meal Plan</span>
              </button>

              <button
                className={`detail-action-btn detail-action-btn--outline ${
                  saved ? "favorite-btn-saved" : ""
                }`}
                id="saveFavoriteBtn"
                type="button"
                onClick={async () => {
                  const nextSaved = await onToggleFavorite(meal);
                  setSaved(nextSaved);
                }}
              >
                {saved ? "♥ Saved" : "♡ Save Favorite"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecipeModal;