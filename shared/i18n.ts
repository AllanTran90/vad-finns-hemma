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
  "pantry.errorAddMany": "Could not save the ingredients. Please try again.",
  "pantry.errorDelete": "Could not delete ingredient. Please try again.",

  // Photo scan
  "scan.title": "Or scan a photo",
  "scan.tip1": "Take the photo in good light.",
  "scan.tip2": "Spread the items out so none hide behind others.",
  "scan.tip3": "Get close enough that labels and shapes are clear.",
  "scan.choose": "Take or choose a photo",
  "scan.reading": "Reading photo...",
  "scan.error": "Could not read the photo. Please try again.",
  "scan.review": "Check the list",
  "scan.nothing": "Nothing was found. Add items below or try another photo.",
  "scan.summary": "{newCount} new, {oldCount} already in your pantry.",
  "scan.ingredientN": "Ingredient {n}",
  "scan.remove": "Remove",
  "scan.known": "Already in your pantry",
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
  "recipe.kidFriendly": "Kid friendly",
  "recipe.contains": "Contains",
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
  "pantry.errorAddMany": "Kunde inte spara ingredienserna. Försök igen.",
  "pantry.errorDelete": "Kunde inte ta bort ingrediensen. Försök igen.",

  "scan.title": "Eller skanna ett foto",
  "scan.tip1": "Ta fotot i bra ljus.",
  "scan.tip2": "Lägg ut sakerna så att inget göms bakom något annat.",
  "scan.tip3": "Gå nära nog så att etiketter och former syns tydligt.",
  "scan.choose": "Ta eller välj ett foto",
  "scan.reading": "Läser fotot...",
  "scan.error": "Kunde inte läsa fotot. Försök igen.",
  "scan.review": "Kontrollera listan",
  "scan.nothing":
    "Hittade ingenting. Lägg till själv nedan eller prova ett annat foto.",
  "scan.summary": "{newCount} nya, {oldCount} finns redan hemma.",
  "scan.ingredientN": "Ingrediens {n}",
  "scan.remove": "Ta bort",
  "scan.known": "Finns redan i dina ingredienser",
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
  "recipe.kidFriendly": "Barnvänligt",
  "recipe.contains": "Innehåller",
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
