// First-run style profile + onboarding flag (localStorage).
// Feeds outfit suggestions and the Avatar; captured once in the onboarding game.

const KEY_ONBOARDED = "ww2.onboarded.v1";
const KEY_PROFILE = "ww2.style.profile.v1";

export interface StyleProfile {
  styles: string[];     // vibe tags, e.g. "classic", "sporty"
  occasions: string[];  // typical week, e.g. "work", "evening"
  createdAt: number;
}

export function isOnboarded(): boolean {
  return localStorage.getItem(KEY_ONBOARDED) === "1";
}

export function setOnboarded(): void {
  localStorage.setItem(KEY_ONBOARDED, "1");
}

export function loadProfile(): StyleProfile | null {
  try {
    const raw = localStorage.getItem(KEY_PROFILE);
    return raw ? (JSON.parse(raw) as StyleProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StyleProfile): void {
  try {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}
