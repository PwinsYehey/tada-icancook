import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function saveFavorite(meal) {
  const user = auth.currentUser;

  if (!user) {
    return {
      success: false,
      reason: "auth",
      message: "Please log in first to save favorites.",
    };
  }

  const favoriteData = {
    idMeal: meal.idMeal,
    isCustom: meal.isCustom || false,
    region: meal.region || "",
    countryCode: meal.countryCode || "",
    countryName: meal.countryName || "",
    strMeal: meal.strMeal || "",
    strCategory: meal.strCategory || "",
    strArea: meal.strArea || "",
    strInstructions: meal.strInstructions || "",
    strMealThumb: meal.strMealThumb || "",
    strYoutube: meal.strYoutube || "",
    strSource: meal.strSource || "",
    strTags: meal.strTags || "",
    difficulty: meal.difficulty || "",
    prepTime: meal.prepTime || "",
    cookTime: meal.cookTime || "",
    servings: meal.servings || "",
    searchAliases: meal.searchAliases || [],
    savedAt: serverTimestamp(),
  };

  for (let i = 1; i <= 20; i++) {
    favoriteData[`strIngredient${i}`] = meal[`strIngredient${i}`] || "";
    favoriteData[`strMeasure${i}`] = meal[`strMeasure${i}`] || "";
  }

  await setDoc(doc(db, "users", user.uid, "favorites", meal.idMeal), favoriteData);

  return {
    success: true,
  };
}

export async function loadFavorites() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));

  return snapshot.docs.map((docItem) => docItem.data());
}

export async function removeFavorite(recipeId) {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await deleteDoc(doc(db, "users", user.uid, "favorites", recipeId));
  return true;
}

export async function isFavorite(recipeId) {
  const user = auth.currentUser;
  if (!user) return false;

  const docRef = doc(db, "users", user.uid, "favorites", recipeId);
  const snapshot = await getDoc(docRef);

  return snapshot.exists();
}