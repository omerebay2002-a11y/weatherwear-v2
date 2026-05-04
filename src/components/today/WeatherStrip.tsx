import type { WeatherSnapshot } from "../../types";
import { WEATHER_LABEL, WEATHER_EMOJI } from "../../lib/weather";

interface Props {
  weather: WeatherSnapshot | null;
  loading?: boolean;
}

export default function WeatherStrip({ weather, loading }: Props) {
  if (loading || !weather) {
    return (
      <div className="px-5 pt-6 pb-4 text-right" dir="rtl">
        <div className="h-10 w-44 bg-walnut-100/50 rounded animate-pulse mb-2" />
        <div className="h-5 w-28 bg-walnut-100/40 rounded animate-pulse" />
      </div>
    );
  }

  // Limit hourly to next 12 hours from "now"
  const now = new Date();
  const nextHours = weather.hourly
    .filter((h) => new Date(h.hour) >= new Date(now.getTime() - 60 * 60_000))
    .slice(0, 12);

  return (
    <div className="pt-5 pb-3" dir="rtl">
      <div className="px-5 mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-xs label-tracked text-walnut-400 mb-1">{weather.city}</p>
          <p className="font-display text-4xl text-ebony leading-none">
            {weather.current.tempC}°
            <span className="text-base text-walnut-500 mr-2 font-sans">
              {WEATHER_EMOJI[weather.current.code]} {WEATHER_LABEL[weather.current.code]}
            </span>
          </p>
        </div>
        {weather.current.feelsLikeC !== undefined &&
          weather.current.feelsLikeC !== weather.current.tempC && (
            <p className="font-editorial italic text-sm text-walnut-400">
              מורגש כמו {weather.current.feelsLikeC}°
            </p>
          )}
      </div>

      {/* 12h horizontal scroll */}
      {nextHours.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 pb-1 min-w-fit">
            {nextHours.map((h, i) => {
              const d = new Date(h.hour);
              const hr = d.getHours();
              return (
                <div
                  key={h.hour}
                  className="card flex-shrink-0 flex flex-col items-center px-3 py-2 min-w-[58px]"
                >
                  <span className="text-[10px] text-walnut-400 mb-0.5">
                    {i === 0 ? "עכשיו" : `${hr}:00`}
                  </span>
                  <span className="text-base">{WEATHER_EMOJI[h.code]}</span>
                  <span className="font-display text-sm text-ebony">{h.tempC}°</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
