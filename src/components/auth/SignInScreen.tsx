import { motion } from "framer-motion";
import { Shirt } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function SignInScreen() {
  const { signInWithGoogle, configured } = useAuth();

  if (!configured) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-parchment px-6" dir="rtl">
        <div className="text-center space-y-3 max-w-xs">
          <Shirt className="h-10 w-10 mx-auto text-walnut-300" strokeWidth={1.4} />
          <p className="font-display text-lg text-ebony">Supabase לא מוגדר</p>
          <p className="text-sm text-walnut-400 leading-relaxed">
            הוסיפי את משתני הסביבה{" "}
            <code className="text-brass text-xs">VITE_SUPABASE_*</code>{" "}
            ב-Vercel ובקובץ <code className="text-brass text-xs">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-parchment px-6"
      dir="rtl"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mb-12 text-center"
      >
        <div className="w-16 h-16 rounded-md bg-ebony flex items-center justify-center mx-auto mb-5">
          <Shirt className="h-8 w-8 text-brass" strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-3xl text-ebony mb-2">WeatherWear</h1>
        <p className="font-editorial italic text-walnut-400 text-base">
          הסטייליסטית שמכירה את מזג האוויר שלך
        </p>
      </motion.div>

      {/* Sign in card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-xs space-y-4"
      >
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-ebony text-parchment rounded-sm py-4 text-sm font-medium transition active:scale-[0.98]"
        >
          {/* Google logo SVG */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          כניסה עם Google
        </button>

        <p className="text-center text-xs text-walnut-400 leading-relaxed">
          הארון שלך יהיה נגיש מכל מכשיר
        </p>
      </motion.div>
    </motion.div>
  );
}
