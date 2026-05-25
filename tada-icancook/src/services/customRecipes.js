const customRecipeFiles = [
  "/custom-recipe/asia/chinese.json",
  "/custom-recipe/asia/indian.json",
  "/custom-recipe/asia/japanese.json",
  "/custom-recipe/asia/malaysian.json",
  "/custom-recipe/asia/philippines.json",
  "/custom-recipe/asia/thai.json",
  "/custom-recipe/asia/vietnamese.json",

  "/custom-recipe/north-america/american.json",
  "/custom-recipe/north-america/canadian.json",
  "/custom-recipe/north-america/mexican.json",

  "/custom-recipe/south-america/argentine.json",
  "/custom-recipe/south-america/brazilian.json",

];

export async function loadCustomRecipes() {
  try {
    const responses = await Promise.all(
      customRecipeFiles.map(async (path) => {
        const response = await fetch(path);

        if (!response.ok) {
          console.warn(`Custom recipe file not found or failed: ${path}`);
          return [];
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.warn(`Invalid JSON format in ${path}. Expected an array.`);
          return [];
        }

        return data;
      })
    );

    const recipes = responses.flat();

    console.log("Loaded custom recipe count:", recipes.length);
    console.log(
      "Filipino recipes:",
      recipes.filter((recipe) => recipe.countryName === "Philippines").length
    );
    console.log(
      "Indian recipes:",
      recipes.filter((recipe) => recipe.countryName === "India").length
    );

    return recipes;
  } catch (error) {
    console.error("Custom recipe load error:", error);
    return [];
  }
}