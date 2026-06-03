import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, ScanLine, Check, X, Loader2 } from "lucide-react";
import { analyzeClothing } from "../../lib/claude";
import { newId } from "../../lib/utils";
import { CATEGORY_LABEL } from "../../lib/constants";
import type { ClothingItem, ClothingCategory, Season } from "../../types";

interface StagedItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  season: Season;
  material?: ClothingItem["material"];
  brand?: string;
  model?: string;
  formality?: ClothingItem["formality"];
  imageUrl: string;
  confirmed: boolean;
}

interface Props {
  onSave: (item: Omit<ClothingItem, "id" | "createdAt" | "source">) => void;
  onDone: (count: number) => void;
  onCancel: () => void;
}

function hexDist(a: string, b: string): number {
  const p = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

export default function VideoScan({ onSave, onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzingRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [staged, setStaged] = useState<StagedItem[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1280 } } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => setCameraError("לא הצלחנו לגשת למצלמה — אשרי הרשאה"));

    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.82);
  }, []);

  const scanNow = useCallback(async () => {
    if (analyzingRef.current) return;
    const frame = captureFrame();
    if (!frame) return;

    analyzingRef.current = true;
    setScanning(true);
    try {
      const result = await analyzeClothing({ mode: "image", imageBase64: frame });
      const isDuplicate = staged.some(
        (s) => s.category === result.category && hexDist(s.colorHex, result.colorHex) < 40
      );
      if (!isDuplicate) {
        setStaged((prev) => [
          {
            id: newId("scan"),
            name: result.name,
            category: result.category,
            color: result.color,
            colorHex: result.colorHex,
            season: result.season,
            material: result.material,
            brand: result.brand,
            model: result.model,
            formality: result.formality,
            imageUrl: frame,
            confirmed: true,
          },
          ...prev,
        ]);
      }
    } catch {
      // Frame had no clear garment — silently skip
    } finally {
      analyzingRef.current = false;
      setScanning(false);
    }
  }, [captureFrame, staged]);

  useEffect(() => {
    const id = setInterval(scanNow, 5000);
    return () => clearInterval(id);
  }, [scanNow]);

  const remove = (id: string) => setStaged((p) => p.filter((s) => s.id !== id));

  const saveAll = () => {
    const confirmed = staged.filter((s) => s.confirmed);
    confirmed.forEach((item) =>
      onSave({
        name: item.name,
        category: item.category,
        color: item.color,
        colorHex: item.colorHex,
        season: item.season,
        material: item.material,
        brand: item.brand,
        model: item.model,
        formality: item.formality,
        imageUrl: item.imageUrl,
      })
    );
    onDone(confirmed.length);
  };

  if (cameraError) {
    return (
      <div className="py-12 text-center" dir="rtl">
        <Video className="h-10 w-10 mx-auto mb-3 text-walnut-300" />
        <p className="font-display text-base text-ebony mb-1">אין גישה למצלמה</p>
        <p className="text-sm text-walnut-400">{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-ebony">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2/3 h-2/3 border-2 border-brass/60 rounded-md relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brass rounded-tr" />
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brass rounded-tl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brass rounded-br" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brass rounded-bl" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          {scanning ? (
            <div className="frost-dark rounded-full px-3 py-1.5 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brass" />
              <span className="text-parchment text-xs">מזהה…</span>
            </div>
          ) : (
            <div className="frost-dark rounded-full px-3 py-1.5 flex items-center gap-2">
              <ScanLine className="h-3.5 w-3.5 text-brass animate-pulse" />
              <span className="text-parchment text-xs">סורקת</span>
            </div>
          )}
        </div>
        {staged.length > 0 && (
          <div className="absolute top-3 right-3 bg-brass text-ebony rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold">
            {staged.length}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={scanNow}
        disabled={scanning}
        className="brass-plate rounded-sm py-3 flex items-center justify-center gap-2 text-sm font-medium w-full"
      >
        {scanning ? (
          <><Loader2 className="h-4 w-4 animate-spin" />מזהה…</>
        ) : (
          <><ScanLine className="h-4 w-4" />סרקי פריט עכשיו</>
        )}
      </button>
      <AnimatePresence>
        {staged.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-xs tracking-widest uppercase text-walnut-400 px-1">
              פריטים שזוהו — {staged.length}
            </p>
            {staged.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 bg-parchment-light border border-brass/20 rounded-sm p-3"
              >
                <div className="w-10 h-10 rounded-sm flex-shrink-0 overflow-hidden border border-black/10">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ebony truncate">{item.name}</p>
                  <p className="text-xs text-ebony-muted tracking-widest uppercase mt-0.5">
                    {CATEGORY_LABEL[item.category]}
                    {item.brand ? ` · ${item.brand}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="p-1.5 text-walnut-400 hover:text-ebony transition flex-shrink-0"
                  aria-label="הסירי"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
            <button
              type="button"
              onClick={saveAll}
              className="brass-plate rounded-sm py-3.5 w-full flex items-center justify-center gap-2 font-medium text-sm mt-2"
            >
              <Check className="h-4 w-4" />
              הוסיפי {staged.length} פריטים לארון
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {staged.length === 0 && !scanning && (
        <p className="text-center font-editorial italic text-sm text-walnut-400 py-2" dir="rtl">
          כווני את המצלמה לפריט בגד — יזוהה אוטומטית כל 5 שניות
        </p>
      )}
    </div>
  );
}
