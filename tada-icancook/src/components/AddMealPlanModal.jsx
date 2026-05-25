import { useState } from "react";
import { MEAL_PLAN_DAYS, MEAL_PLAN_TIMES } from "../services/mealPlanService";

function AddMealPlanModal({ meal, isOpen, onClose, onSave }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedMealTime, setSelectedMealTime] = useState("Lunch");

  if (!isOpen || !meal) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    await onSave({
      day: selectedDay,
      mealTime: selectedMealTime,
      meal,
    });
  }

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal-backdrop" onClick={onClose}></div>

      <div
        className="meal-plan-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addMealPlanTitle"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="meal-plan-add-body">
          <h2 id="addMealPlanTitle" className="meal-plan-add-title">
            Add to Meal Plan
          </h2>

          <p className="meal-plan-add-subtitle">
            Choose when you want to cook this recipe.
          </p>

          <div className="meal-plan-preview-card">
            <img
              src={meal.strMealThumb || "/placeholder-recipe.jpg"}
              alt={meal.strMeal}
              className="meal-plan-preview-image"
            />

            <div>
              <h3>{meal.strMeal}</h3>
              <p>
                {meal.strCategory || "Meal"}
                {meal.strArea ? ` • ${meal.strArea}` : ""}
              </p>
            </div>
          </div>

          <form className="meal-plan-add-form" onSubmit={handleSubmit}>
            <label className="meal-plan-add-label" htmlFor="mealPlanDay">
              Day
            </label>

            <select
              id="mealPlanDay"
              className="meal-plan-add-select"
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
            >
              {MEAL_PLAN_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <label className="meal-plan-add-label" htmlFor="mealPlanTime">
              Meal Time
            </label>

            <select
              id="mealPlanTime"
              className="meal-plan-add-select"
              value={selectedMealTime}
              onChange={(event) => setSelectedMealTime(event.target.value)}
            >
              {MEAL_PLAN_TIMES.map((mealTime) => (
                <option key={mealTime} value={mealTime}>
                  {mealTime}
                </option>
              ))}
            </select>

            <button className="btn btn-primary meal-plan-add-submit" type="submit">
              Add to Planner
            </button>
          </form>

          <p className="meal-plan-add-note">
            If the selected slot already has a recipe, it will be replaced.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddMealPlanModal;