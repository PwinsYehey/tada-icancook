export function dedupeMeals(meals) {
  const seen = new Set();

  return meals.filter((meal) => {
    if (!meal?.idMeal) return false;
    if (seen.has(meal.idMeal)) return false;

    seen.add(meal.idMeal);
    return true;
  });
}

export function extractIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push({
        name: ingredient,
        measure: measure || "",
      });
    }
  }

  return ingredients;
}

export function normalizeIngredient(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function formatIngredientLabel(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeIngredientText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ingredientAliases(term) {
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
    beef: ["beef", "ground beef", "beef shank", "beef ribs", "beef chuck", "oxtail"],
  };

  return aliasMap[normalized] || [normalized];
}

export function mealMatchesIngredients(meal, ingredients) {
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

export function findMatchingCategoryFromIngredient(ingredient) {
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
    side: "Side",
  };

  return aliases[normalized] || null;
}

export function mealMatchesSearchQuery(meal, query) {
  const q = query.toLowerCase().trim();

  if (!q) return true;

  const searchableParts = [
    meal.strMeal || "",
    meal.strCategory || "",
    meal.strArea || "",
    meal.strTags || "",
    meal.strInstructions || "",
    ...(meal.searchAliases || []),
  ];

  for (let i = 1; i <= 20; i++) {
    searchableParts.push(meal[`strIngredient${i}`] || "");
  }

  return searchableParts.join(" ").toLowerCase().includes(q);
}