import { useMemo, useState } from "react";
import { MEAL_PLAN_DAYS, MEAL_PLAN_TIMES } from "../services/mealPlanService";
import { extractIngredients } from "../utils/recipeHelpers";

function normalizeShoppingIngredient(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatIngredientName(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildShoppingList(mealPlanItems) {
  const ingredientMap = new Map();

  mealPlanItems.forEach((meal) => {
    const ingredients = extractIngredients(meal);

    ingredients.forEach((item) => {
      const key = normalizeShoppingIngredient(item.name);

      if (!key) return;

      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, {
          name: formatIngredientName(item.name),
          measures: [],
          recipes: [],
        });
      }

      const current = ingredientMap.get(key);

      if (item.measure && !current.measures.includes(item.measure)) {
        current.measures.push(item.measure);
      }

      if (meal.strMeal && !current.recipes.includes(meal.strMeal)) {
        current.recipes.push(meal.strMeal);
      }
    });
  });

  return Array.from(ingredientMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function WeeklyPlannerModal({
  isOpen,
  mealPlanItems,
  onClose,
  onRemoveSlot,
  onViewRecipe,
}) {
  const [showShoppingList, setShowShoppingList] = useState(false);

  const shoppingList = useMemo(() => {
    return buildShoppingList(mealPlanItems);
  }, [mealPlanItems]);

  if (!isOpen) return null;

  function getMealForSlot(day, mealTime) {
    return (
      mealPlanItems.find(
        (item) => item.day === day && item.mealTime === mealTime
      ) || null
    );
  }

  const hasPlannedMeals = mealPlanItems.length > 0;

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal-backdrop" onClick={onClose}></div>

      <div
        className="weekly-planner-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weeklyPlannerTitle"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="weekly-planner-body">
          <div className="weekly-planner-head">
            <div>
              <h2 id="weeklyPlannerTitle" className="weekly-planner-title">
                Weekly Meal Planner
              </h2>
              <p className="weekly-planner-subtitle">
                Plan your breakfast, lunch, and dinner for the whole week.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary weekly-shopping-btn"
              disabled={!hasPlannedMeals}
              onClick={() => setShowShoppingList((current) => !current)}
            >
              {showShoppingList ? "Hide Shopping List" : "Generate Shopping List"}
            </button>
          </div>

          <div className="weekly-planner-table-wrap">
            <div className="weekly-planner-grid">
              <div className="planner-cell planner-corner">Meal</div>

              {MEAL_PLAN_DAYS.map((day) => (
                <div className="planner-cell planner-day" key={day}>
                  {day}
                </div>
              ))}

              {MEAL_PLAN_TIMES.map((mealTime) => (
                <div className="planner-row-group" key={mealTime}>
                  <div className="planner-cell planner-meal-time">
                    {mealTime}
                  </div>

                  {MEAL_PLAN_DAYS.map((day) => {
                    const plannedMeal = getMealForSlot(day, mealTime);

                    return (
                      <div
                        className="planner-cell planner-slot"
                        key={`${day}-${mealTime}`}
                      >
                        {plannedMeal ? (
                          <div className="planned-meal-card">
                            <img
                              src={
                                plannedMeal.strMealThumb ||
                                "/placeholder-recipe.jpg"
                              }
                              alt={plannedMeal.strMeal}
                              className="planned-meal-image"
                            />

                            <div className="planned-meal-content">
                              <h3>{plannedMeal.strMeal}</h3>
                              <p>
                                {plannedMeal.strCategory || "Meal"}
                                {plannedMeal.strArea
                                  ? ` • ${plannedMeal.strArea}`
                                  : ""}
                              </p>

                              <div className="planned-meal-actions">
                                <button
                                  type="button"
                                  className="planned-meal-link"
                                  onClick={() =>
                                    onViewRecipe(plannedMeal.idMeal)
                                  }
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="planned-meal-remove"
                                  onClick={() =>
                                    onRemoveSlot(plannedMeal.slotId)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="planner-empty-slot">
                            <span>Add from recipe</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {showShoppingList && (
            <section className="shopping-list-panel">
              <div className="shopping-list-head">
                <div>
                  <h3>Shopping List</h3>
                  <p>
                    Based on {mealPlanItems.length} planned meal
                    {mealPlanItems.length !== 1 ? "s" : ""}.
                  </p>
                </div>

                <span className="shopping-list-count">
                  {shoppingList.length} item
                  {shoppingList.length !== 1 ? "s" : ""}
                </span>
              </div>

              {shoppingList.length > 0 ? (
                <div className="shopping-list-grid">
                  {shoppingList.map((item) => (
                    <div className="shopping-list-item" key={item.name}>
                      <div className="shopping-list-check">□</div>

                      <div className="shopping-list-content">
                        <h4>{item.name}</h4>

                        {item.measures.length > 0 && (
                          <p className="shopping-list-measures">
                            {item.measures.join(" / ")}
                          </p>
                        )}

                        {item.recipes.length > 0 && (
                          <p className="shopping-list-recipes">
                            Used in: {item.recipes.slice(0, 3).join(", ")}
                            {item.recipes.length > 3 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="shopping-list-empty">
                  Add meals to your planner first to generate a shopping list.
                </div>
              )}
            </section>
          )}

          <div className="weekly-planner-note">
            Open any recipe and click <strong>Add to Meal Plan</strong> to fill a slot.
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyPlannerModal;