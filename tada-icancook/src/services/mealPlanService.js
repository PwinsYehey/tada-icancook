import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export const MEAL_PLAN_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MEAL_PLAN_TIMES = ["Breakfast", "Lunch", "Dinner"];

export function createMealPlanSlotId(day, mealTime) {
  return `${day.toLowerCase()}-${mealTime.toLowerCase()}`;
}

export async function loadMealPlan() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const snapshot = await getDocs(collection(db, "users", user.uid, "mealPlan"));

  return snapshot.docs.map((docItem) => docItem.data());
}

export async function saveMealPlanSlot({ day, mealTime, meal }) {
  const user = auth.currentUser;

  if (!user) {
    return {
      success: false,
      reason: "auth",
      message: "Please log in first to use the weekly planner.",
    };
  }

  const slotId = createMealPlanSlotId(day, mealTime);

  const mealPlanData = {
    slotId,
    day,
    mealTime,
    idMeal: meal.idMeal,
    isCustom: meal.isCustom || false,
    strMeal: meal.strMeal || "",
    strMealThumb: meal.strMealThumb || "",
    strCategory: meal.strCategory || "",
    strArea: meal.strArea || "",
    strInstructions: meal.strInstructions || "",
    strYoutube: meal.strYoutube || "",
    strSource: meal.strSource || "",
    savedAt: serverTimestamp(),
  };

  for (let i = 1; i <= 20; i++) {
    mealPlanData[`strIngredient${i}`] = meal[`strIngredient${i}`] || "";
    mealPlanData[`strMeasure${i}`] = meal[`strMeasure${i}`] || "";
  }

  await setDoc(doc(db, "users", user.uid, "mealPlan", slotId), mealPlanData);

  return {
    success: true,
  };
}

export async function removeMealPlanSlot(slotId) {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await deleteDoc(doc(db, "users", user.uid, "mealPlan", slotId));
  return true;
}