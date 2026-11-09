// Shared state (useState) survives a page change, and also a change of user.
// So when the user changes (logout, or a guest logging in to another account),
// we empty it, or the next user on this device could see the old data.
// One function for both places, so a new piece of state only needs adding here.
export function useClearUserData() {
  const { ingredients } = usePantry();
  const { recipe, selectedCuisine, errorMessage: recipeError } = useRecipe();
  const { favorites } = useFavorites();
  const { resetScan } = useImageScan();

  function clearUserData() {
    // Read the cookie here, not when the page loads. A copy made at page load
    // can be out of date (the guest folded the banner after that), and then
    // setting false looks like "no change" and nothing is written.
    useGuestBannerHidden().value = false;
    ingredients.value = [];
    recipe.value = null;
    selectedCuisine.value = "";
    recipeError.value = "";
    favorites.value = [];
    resetScan();
  }

  return { clearUserData };
}
