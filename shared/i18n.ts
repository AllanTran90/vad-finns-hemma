export const LANGS = ["en", "sv"] as const;
export type Lang = (typeof LANGS)[number];

const en = {
  // Start page
  "app.tagline": "Add what you have, then pick a cuisine.",

  // Pantry
  "pantry.title": "Your ingredients",
  "pantry.placeholder": "Ingredient",
  "pantry.add": "Add",
  "pantry.delete": "Delete",
  "pantry.empty": "No ingredients yet. Add what you have at home.",
  "pantry.errorLoad": "Could not load ingredients. Please try again.",
  "pantry.errorEmpty": "Please enter an ingredient.",
  "pantry.errorAdd": "Could not add ingredient. Please try again.",
  "pantry.errorDuplicate": "That ingredient is already in your pantry.",
  "pantry.errorAddMany": "Could not save the ingredients. Please try again.",
  "pantry.errorDelete": "Could not delete ingredient. Please try again.",

  // Allergies
  "prefs.allergies": "Allergies",
  "prefs.hint": "Recipes will avoid the ones you choose.",
  "prefs.errorLoad": "Could not load your preferences. Please try again.",
  "prefs.errorSave": "Could not save your preferences. Please try again.",

  // Diets (the keys match the values in shared/diets.ts)
  "diet.title": "Diet",
  "diet.none": "No restrictions",
  "diet.pescatarian": "Pescatarian (fish, no meat)",
  "diet.lacto_ovo_vegetarian": "Vegetarian (dairy and eggs)",
  "diet.lacto_vegetarian": "Lacto-vegetarian (dairy, no eggs)",
  "diet.ovo_vegetarian": "Ovo-vegetarian (eggs, no dairy)",
  "diet.vegan": "Vegan",

  // Photo scan
  "scan.title": "Or scan a photo",
  "scan.tip1": "Take the photo in good light.",
  "scan.tip2": "Spread the items out so none hide behind others.",
  "scan.tip3": "Get close enough that labels and shapes are clear.",
  "scan.camera": "Take a photo",
  "scan.gallery": "Choose from gallery",
  "scan.reading": "Reading photo...",
  "scan.error": "Could not read the photo. Please try again.",
  "scan.review": "Check the list",
  "scan.nothing": "Nothing was found. Add items below or try another photo.",
  "scan.nothingNew": "Everything in the photo is already in your pantry.",
  "scan.newTitle": "New ({count})",
  "scan.knownTitle": "Already in your pantry ({count})",
  "scan.ingredientN": "Ingredient {n}",
  "scan.remove": "Remove",
  "scan.addPlaceholder": "Add a missing item",
  "scan.add": "Add",
  "scan.confirm": "Add {count} to my ingredients",
  "scan.discard": "Discard",

  // Cuisines (the keys match the values in shared/cuisines.ts)
  "cuisine.title": "Pick a cuisine",
  "cuisine.Swedish": "Swedish",
  "cuisine.Chinese": "Chinese",
  "cuisine.Vietnamese": "Vietnamese",
  "cuisine.Japanese": "Japanese",
  "cuisine.French": "French",
  "cuisine.Spanish": "Spanish",
  "cuisine.Korean": "Korean",
  "cuisine.Italian": "Italian",
  "cuisine.Surprise me": "Surprise me",

  // Recipe
  "recipe.get": "Get recipe",
  "recipe.getting": "Getting recipe...",
  "recipe.error": "Could not get a recipe. Please try again.",

  // Favorites
  "favorites.title": "Saved recipes",
  "favorites.empty": "No saved recipes yet. Tap the heart on a recipe to save it.",
  "favorites.save": "Save recipe",
  "favorites.remove": "Remove from saved",
  "favorites.errorLoad": "Could not load your saved recipes. Please try again.",
  "favorites.errorSave": "Could not save the recipe. Please try again.",
  "favorites.errorDelete": "Could not remove the recipe. Please try again.",
  "recipe.kidFriendly": "Kid friendly",
  "recipe.contains": "Contains",
  "recipe.allergyWarning":
    "Warning: this recipe contains {allergens}, which you marked as an allergy.",
  "recipe.ingredients": "Ingredients",
  "recipe.instructions": "Instructions",
  "recipe.disclaimer":
    "AI can make mistakes. If you have allergies, always check the ingredients yourself.",

  // Allergens (the keys match the values in shared/allergens.ts)
  "allergen.crustaceans": "crustaceans",
  "allergen.gluten": "gluten",
  "allergen.eggs": "eggs",
  "allergen.fish": "fish",
  "allergen.peanuts": "peanuts",
  "allergen.soybeans": "soybeans",
  "allergen.milk": "milk",
  "allergen.hazelnuts": "hazelnuts",
  "allergen.walnuts": "walnuts",
  "allergen.almonds": "almonds",
  "allergen.cashews": "cashews",
  "allergen.pistachios": "pistachios",
  "allergen.celery": "celery",
  "allergen.mustard": "mustard",
  "allergen.sesame": "sesame",
  "allergen.sulphites": "sulphites",
  "allergen.lupin": "lupin",
  "allergen.molluscs": "molluscs",
  "allergen.apples": "apples",
  "allergen.citrus": "citrus",
  "allergen.pecans": "pecans",
  "allergen.brazil_nuts": "brazil nuts",
  "allergen.macadamias": "macadamias",

  // Login and signup
  "auth.tagline": "Turn what's in your fridge into dinner.",
  "auth.logIn": "Log in",
  "auth.createAccount": "Create account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.showPassword": "Show password",
  "auth.hidePassword": "Hide password",
  "auth.noAccount": "No account yet?",
  "auth.haveAccount": "Already have an account?",
  "auth.loginError": "Wrong email or password. Please try again.",
  "auth.signupError":
    "Could not create account. Please check your email and password.",
  "auth.logOut": "Log out",
  "auth.logOutError": "Could not log out. Please try again.",
  "auth.checkEmail": "Check your email and click the link to confirm your account. Then you can log in.",
  "auth.rateLimit": "Too many attempts right now. Please wait a while and try again.",
  "auth.guest": "Continue as guest",
  "auth.guestError": "Could not start a guest session. Please try again.",

  // Guest account
  "guest.title": "You are using a guest account",
  "guest.text": "Create an account to keep your ingredients and saved recipes.",
  "guest.checkEmail": "Check your email and click the link to finish creating your account.",

  // Errors that can happen in any call to our server
  "error.offline": "No internet connection. Check your connection and try again.",
  "error.sessionExpired": "Your login has expired. Please log in again.",
  "error.limit": "You have reached today's limit. Please try again tomorrow.",

  // Toggles
  "theme.toLight": "Switch to light mode",
  "theme.toDark": "Switch to dark mode",
  "lang.switchTo": "Switch to Swedish",
};

export type MessageKey = keyof typeof en;

// Record<MessageKey, string> makes TypeScript complain if a key is missing here.
const sv: Record<MessageKey, string> = {
  "app.tagline": "Lägg till vad du har hemma och välj sedan ett kök.",

  "pantry.title": "Dina ingredienser",
  "pantry.placeholder": "Ingrediens",
  "pantry.add": "Lägg till",
  "pantry.delete": "Ta bort",
  "pantry.empty": "Inga ingredienser än. Lägg till det du har hemma.",
  "pantry.errorLoad": "Kunde inte hämta ingredienserna. Försök igen.",
  "pantry.errorEmpty": "Skriv in en ingrediens.",
  "pantry.errorAdd": "Kunde inte lägga till ingrediensen. Försök igen.",
  "pantry.errorDuplicate": "Den ingrediensen finns redan i ditt skafferi.",
  "pantry.errorAddMany": "Kunde inte spara ingredienserna. Försök igen.",
  "pantry.errorDelete": "Kunde inte ta bort ingrediensen. Försök igen.",

  "prefs.allergies": "Allergier",
  "prefs.hint": "Recepten undviker det du väljer.",
  "prefs.errorLoad": "Kunde inte hämta dina val. Försök igen.",
  "prefs.errorSave": "Kunde inte spara dina val. Försök igen.",

  "diet.title": "Kost",
  "diet.none": "Inga begränsningar",
  "diet.pescatarian": "Pescetarian (fisk, inget kött)",
  "diet.lacto_ovo_vegetarian": "Vegetarian (mejeri och ägg)",
  "diet.lacto_vegetarian": "Lakto-vegetarian (mejeri, inga ägg)",
  "diet.ovo_vegetarian": "Ovo-vegetarian (ägg, inget mejeri)",
  "diet.vegan": "Vegan",

  "scan.title": "Eller skanna ett foto",
  "scan.tip1": "Ta fotot i bra ljus.",
  "scan.tip2": "Lägg ut sakerna så att inget göms bakom något annat.",
  "scan.tip3": "Gå nära nog så att etiketter och former syns tydligt.",
  "scan.camera": "Ta ett foto",
  "scan.gallery": "Välj från galleriet",
  "scan.reading": "Läser fotot...",
  "scan.error": "Kunde inte läsa fotot. Försök igen.",
  "scan.review": "Kontrollera listan",
  "scan.nothing":
    "Hittade ingenting. Lägg till själv nedan eller prova ett annat foto.",
  "scan.nothingNew": "Allt på fotot finns redan hemma.",
  "scan.newTitle": "Nya ({count})",
  "scan.knownTitle": "Finns redan hemma ({count})",
  "scan.ingredientN": "Ingrediens {n}",
  "scan.remove": "Ta bort",
  "scan.addPlaceholder": "Lägg till något som saknas",
  "scan.add": "Lägg till",
  "scan.confirm": "Lägg till {count} i mina ingredienser",
  "scan.discard": "Kasta bort",

  "cuisine.title": "Välj ett kök",
  "cuisine.Swedish": "Svenskt",
  "cuisine.Chinese": "Kinesiskt",
  "cuisine.Vietnamese": "Vietnamesiskt",
  "cuisine.Japanese": "Japanskt",
  "cuisine.French": "Franskt",
  "cuisine.Spanish": "Spanskt",
  "cuisine.Korean": "Koreanskt",
  "cuisine.Italian": "Italienskt",
  "cuisine.Surprise me": "Överraska mig",

  "recipe.get": "Få recept",
  "recipe.getting": "Hämtar recept...",
  "recipe.error": "Kunde inte hämta ett recept. Försök igen.",

  // Favorites
  "favorites.title": "Sparade recept",
  "favorites.empty": "Inga sparade recept än. Tryck på hjärtat på ett recept för att spara det.",
  "favorites.save": "Spara receptet",
  "favorites.remove": "Ta bort från sparade",
  "favorites.errorLoad": "Kunde inte hämta dina sparade recept. Försök igen.",
  "favorites.errorSave": "Kunde inte spara receptet. Försök igen.",
  "favorites.errorDelete": "Kunde inte ta bort receptet. Försök igen.",
  "recipe.kidFriendly": "Barnvänligt",
  "recipe.contains": "Innehåller",
  "recipe.allergyWarning":
    "Varning: receptet innehåller {allergens}, som du markerat som allergi.",
  "recipe.ingredients": "Ingredienser",
  "recipe.instructions": "Gör så här",
  "recipe.disclaimer":
    "AI kan göra misstag. Har du allergier, kontrollera alltid ingredienserna själv.",

  "allergen.crustaceans": "kräftdjur",
  "allergen.gluten": "gluten",
  "allergen.eggs": "ägg",
  "allergen.fish": "fisk",
  "allergen.peanuts": "jordnötter",
  "allergen.soybeans": "soja",
  "allergen.milk": "mjölk",
  "allergen.hazelnuts": "hasselnötter",
  "allergen.walnuts": "valnötter",
  "allergen.almonds": "mandel",
  "allergen.cashews": "cashewnötter",
  "allergen.pistachios": "pistagenötter",
  "allergen.celery": "selleri",
  "allergen.mustard": "senap",
  "allergen.sesame": "sesamfrön",
  "allergen.sulphites": "sulfiter",
  "allergen.lupin": "lupin",
  "allergen.molluscs": "blötdjur",
  "allergen.apples": "äpplen",
  "allergen.citrus": "citrus",
  "allergen.pecans": "pekannötter",
  "allergen.brazil_nuts": "paranötter",
  "allergen.macadamias": "macadamianötter",

  "auth.tagline": "Gör om det som finns i kylen till middag.",
  "auth.logIn": "Logga in",
  "auth.createAccount": "Skapa konto",
  "auth.email": "E-post",
  "auth.password": "Lösenord",
  "auth.showPassword": "Visa lösenord",
  "auth.hidePassword": "Dölj lösenord",
  "auth.noAccount": "Har du inget konto än?",
  "auth.haveAccount": "Har du redan ett konto?",
  "auth.loginError": "Fel e-post eller lösenord. Försök igen.",
  "auth.signupError": "Kunde inte skapa kontot. Kontrollera e-post och lösenord.",
  "auth.logOut": "Logga ut",
  "auth.logOutError": "Kunde inte logga ut. Försök igen.",
  "auth.checkEmail": "Kolla din e-post och klicka på länken för att bekräfta kontot. Sedan kan du logga in.",
  "auth.rateLimit": "För många försök just nu. Vänta en stund och försök igen.",
  "auth.guest": "Fortsätt som gäst",
  "auth.guestError": "Kunde inte starta gästläget. Försök igen.",

  // Guest account
  "guest.title": "Du använder ett gästkonto",
  "guest.text": "Skapa ett konto för att behålla dina ingredienser och sparade recept.",
  "guest.checkEmail": "Kolla din e-post och klicka på länken för att slutföra kontot.",

  // Errors that can happen in any call to our server
  "error.offline": "Ingen internetanslutning. Kontrollera anslutningen och försök igen.",
  "error.sessionExpired": "Din inloggning har gått ut. Logga in igen.",
  "error.limit": "Du har nått dagens gräns. Försök igen i morgon.",

  "theme.toLight": "Byt till ljust läge",
  "theme.toDark": "Byt till mörkt läge",
  "lang.switchTo": "Byt till engelska",
};

const messages: Record<Lang, Record<MessageKey, string>> = { en, sv };

// Looks up a text and fills in {placeholders}, e.g. "Add {count} items".
export function translate(
  lang: Lang,
  key: MessageKey,
  params: Record<string, string | number> = {},
) {
  let text = messages[lang][key];

  for (const [name, value] of Object.entries(params)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }

  return text;
}
