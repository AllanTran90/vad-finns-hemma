import { translate, type Lang, type MessageKey } from "#shared/i18n";

export function useLang() {
  const cookie = useCookie<Lang | null>("lang", {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // useState is shared by every component that calls useLang(), so they all
  // switch language at the same time. The cookie only remembers the choice.
  const lang = useState<Lang>("lang", () =>
    cookie.value === "sv" ? "sv" : "en",
  );

  // Reading lang.value inside t() makes templates redraw when the language changes.
  function t(key: MessageKey, params?: Record<string, string | number>) {
    return translate(lang.value, key, params);
  }

  function setLang(next: Lang) {
    lang.value = next;
    cookie.value = next;
  }

  return { lang, t, setLang };
}
