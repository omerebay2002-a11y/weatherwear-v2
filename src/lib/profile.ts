import type { UserProfile } from "../types";

const KEY_PROFILE = "ww2.profile.v1";
const KEY_ONBOARDED = "ww2.onboarded.v1";

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY_PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export function isOnboarded(): boolean {
  return localStorage.getItem(KEY_ONBOARDED) === "1";
}

export function markOnboarded(): void {
  localStorage.setItem(KEY_ONBOARDED, "1");
}
