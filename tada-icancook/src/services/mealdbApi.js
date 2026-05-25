const API_KEY = import.meta.env.VITE_MEALDB_API_KEY;
const API_BASE = `https://www.themealdb.com/api/json/v2/${API_KEY}`;

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function searchMealsByName(query) {
  const data = await fetchJson(
    `${API_BASE}/search.php?s=${encodeURIComponent(query)}`
  );

  return data.meals || [];
}

export async function getCategoryList() {
  const data = await fetchJson(`${API_BASE}/list.php?c=list`);
  return data.meals || [];
}

export async function getAreaList() {
  const data = await fetchJson(`${API_BASE}/list.php?a=list`);
  return data.meals || [];
}

export async function getRandomMeal() {
  const data = await fetchJson(`${API_BASE}/random.php`);
  return data.meals?.[0] || null;
}

export async function getMealsByCategory(category) {
  const data = await fetchJson(
    `${API_BASE}/filter.php?c=${encodeURIComponent(category)}`
  );

  return data.meals || [];
}

export async function getMealsByArea(area) {
  const data = await fetchJson(
    `${API_BASE}/filter.php?a=${encodeURIComponent(area)}`
  );

  return data.meals || [];
}

export async function getMealsByIngredient(ingredientQuery) {
  const data = await fetchJson(
    `${API_BASE}/filter.php?i=${encodeURIComponent(ingredientQuery)}`
  );

  return data.meals || [];
}

export async function getMealById(id) {
  const data = await fetchJson(
    `${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`
  );

  return data.meals?.[0] || null;
}