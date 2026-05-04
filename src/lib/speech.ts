// Web Speech API wrapper — Hebrew (he-IL)
// Works in Chrome/Edge desktop & Android. Safari iOS = not supported.

type SpeechRec = typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : typeof window extends { SpeechRecognition: infer T2 }
  ? T2
  : unknown;

interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface RecognitionEvent extends Event {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
  resultIndex: number;
}

type Listener = (r: RecognitionResult) => void;

interface RecorderHandle {
  stop: () => void;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startSpeechRecognition(
  onPartial: Listener,
  onFinal: Listener,
  onError?: (err: string) => void
): RecorderHandle | null {
  if (!isSpeechSupported()) {
    onError?.("דפדפן לא תומך בהכרת דיבור — נסי Chrome / Edge");
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec: SpeechRec & {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (e: RecognitionEvent) => void;
    onerror: (e: { error: string }) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  } = new Ctor();

  rec.lang = "he-IL";
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e: RecognitionEvent) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      const text = res[0].transcript;
      if (res.isFinal) final += text;
      else interim += text;
    }
    if (interim) onPartial({ transcript: interim, isFinal: false });
    if (final) onFinal({ transcript: final, isFinal: true });
  };

  rec.onerror = (e: { error: string }) => {
    onError?.(`שגיאת הקלטה: ${e.error}`);
  };

  try {
    rec.start();
  } catch (err) {
    onError?.("נכשל להתחיל הקלטה — בדקי הרשאות מיקרופון");
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}
