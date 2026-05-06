import type { WeatherSnapshot } from "../../types";
import { WEATHER_LABEL, WEATHER_EMOJI } from "../../lib/weather";

interface Props {
  weather: WeatherSnapshot | null;
  loading?: boolean;
}

export default function WeatherStrip({ weather, loading }: Props) {
  if (loading || !weather) {
    return (
      <div className="bg-ebony-soft h-[72px] flex items-center px-5" dir="rtl">
        <div className="flex-1 space-y-2">
          <div className="h-8 w-20 bg-walnut-700/40 rounded animate-pulse" />
          <div className="h-3 w-32 bg-walnut-700/30 rounded animate-pulse" />
        </div>
        <div className="w-8 h-8 bg-walnut-700/30 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-ebony-soft h-[72px] flex items-center justify-between px-5" dir="rtl">
      <div className="flex items-baseline gap-3">
        <span className="text-[2rem] font-light text-parchment leading-none">
          {weather.current.tempC}°
        </span>
        <div>
          <p className="text-parchment-dark text-[0.7rem] leading-none">{weather.city}</p>
          <p className="text-brass-light text-[0.7rem] mt-0.5">
            {WEATHER_LABEL[weather.current.code]}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[1.6rem] leading-none">{WEATHER_EMOJI[weather.current.code]}</span>
        {weather.current.feelsLikeC !== undefined &&
          weather.current.feelsLikeC !== weather.current.tempC && (
            <span className="text-[0.65rem] text-brass-deep">
              מרגיש {weather.current.feelsLikeC}°
            </span>
          )}
      </div>
    </div>
  );
}
