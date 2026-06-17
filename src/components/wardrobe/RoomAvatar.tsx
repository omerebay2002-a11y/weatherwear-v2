import { useMemo } from "react";
import { motion } from "framer-motion";
import { loadProfile } from "../../lib/profile";

// The avatar is part of the wardrobe interface — a faceless boutique mannequin
// standing in the clean lane to the RIGHT of the wardrobe, in the same room.
// It is a flat cutout LAYER over the room photo (not baked in), so it can be
// swapped: male/female by the onboarding profile now, and a realistic "you"
// (selfie → render) later. NOT a separate page.

const MANNEQUIN: Record<"woman" | "man" | "mixed", string> = {
  woman: "/avatar-female.png",
  man: "/avatar-male.png",
  mixed: "/avatar-female.png",
};

export default function RoomAvatar() {
  const src = useMemo(() => {
    const forWhom = loadProfile()?.wardrobeFor ?? "woman";
    return MANNEQUIN[forWhom];
  }, []);

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ right: "1%", bottom: "3%", width: "46%", height: "66%" }}
    >
      {/* soft contact shadow on the rug */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "1.5%",
          width: "42%",
          height: "3%",
          background: "rgba(40,26,14,0.28)",
          filter: "blur(7px)",
          borderRadius: "50%",
        }}
      />
      <motion.img
        src={src}
        alt="הבובה שלך"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full h-full object-contain object-bottom select-none"
        draggable={false}
      />
    </div>
  );
}
