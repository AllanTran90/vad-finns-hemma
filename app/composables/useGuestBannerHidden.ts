// Whether the guest has folded the guest banner into one line.
// A cookie (like the theme) so the server already knows the choice and the
// big banner does not flash on reload. In its own file, so GuestBanner.vue and
// clearUserData use the same cookie: the next guest on this device must see the
// full banner with the warning again.
export function useGuestBannerHidden() {
  return useCookie<boolean>("guest-banner-hidden", {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
