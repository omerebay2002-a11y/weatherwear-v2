import type { WeatherCode, WeatherSnapshot } from "../types";

const SESSION_KEY = "ww2.weather.cache.v1";
const TTL_MS = 30 * 60 * 1000; // 30 min

const TEL_AVIV = { lat: 32.0853, lon: 34.7818, city: "תל אביב" };

function codeFromOM(c: number): WeatherCode {
  if (c === 0) return "clear";
  if (c <= 2) return "partly-cloudy";
  if (c === 3) return "cloudy";
  if (c >= 45 && c <= 48) return "fog";
  if (c >= 51 && c <= 57) return "drizzle";
  if (c >= 61 && c <= 67) return "rain";
  if (c >= 71 && c <= 77) return "snow";
  if (c >= 80 && c <= 86) return "rain";
  if (c >= 95) return "thunderstorm";
  return "cloudy";
}

export async function geolocate(): Promise<{ lat: number; lon: number; city: string }> {
  // Try browser geolocation first; fall back to Tel Aviv
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 60_000 * 30,
        });
      });
      // Reverse-geocode to a city name (Open-Meteo's free reverse API)
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=he&count=1`
        );
        const j = await r.json();
        const city: string = j?.results?.[0]?.name ?? "המיקום שלך";
        return { lat, lon, city };
      } catch {
        return { lat, lon, city: "המיקום שלך" };
      }
    } catch {
      // permission denied / timeout — fall back
    }
  }
  return TEL_AVIV;
}

export async function fetchWeather(): Promise<WeatherSnapshot> {
  // Cache
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed: WeatherSnapshot = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt < TTL_MS) return parsed;
    }
  } catch {
    /* ignore */
  }

  const loc = await geolocate();
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(loc.lat));
  url.searchParams.set("longitude", String(loc.lon));
  url.searchParams.set("current", "temperature_2m,weather_code,apparent_temperature");
  url.searchParams.set("hourly", "temperature_2m,weather_code");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", "auto");

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Weather fetch failed: ${r.status}`);
  const j = await r.json();

  const current = j.current ?? {};
  const hourly = j.hourly ?? {};
  const daily = j.daily ?? {};

  const snapshot: WeatherSnapshot = {
    city: loc.city,
    lat: loc.lat,
    lon: loc.lon,
    current: {
      tempC: Math.round(current.temperature_2m ?? 22),
      code: codeFromOM(current.weather_code ?? 0),
      feelsLikeC: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 22),
    },
    hourly: (hourly.time ?? []).slice(0, 24).map((t: string, i: number) => ({
      hour: t,
      tempC: Math.round(hourly.temperature_2m?.[i] ?? 0),
      code: codeFromOM(hourly.weather_code?.[i] ?? 0),
    })),
    daily: (daily.time ?? []).slice(0, 3).map((d: string, i: number) => ({
      date: d,
      minC: Math.round(daily.temperature_2m_min?.[i] ?? 0),
      maxC: Math.round(daily.temperature_2m_max?.[i] ?? 0),
      code: codeFromOM(daily.weather_code?.[i] ?? 0),
    })),
    fetchedAt: Date.now(),
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota — ignore */
  }
  return snapshot;
}

export const WEATHER_LABEL: Record<WeatherCode, string> = {
  clear: "בהיר",
  "partly-cloudy": "מעונן חלקית",
  cloudy: "מעונן",
  fog: "ערפילי",
  drizzle: "טפטוף",
  rain: "גשם",
  snow: "שלג",
  thunderstorm: "סופת רעמים",
};

export const WEATHER_EMOJI: Record<WeatherCode, string> = {
  clear: "☀️",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  fog: "🌫️",
  drizzle: "🌦️",
  rain: "🌧️",
  snow: "❄️",
  thunderstorm: "⛈️",
};
