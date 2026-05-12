import { tool } from "ai";
import { z } from "zod";

/**
 * Generates a tight, production-ready image-generation prompt.
 * The design agent uses this when the user asks for visuals.
 * (Pluggable: replace `execute` with a call to your image model of choice.)
 */
export const imagePrompt = tool({
  description:
    "Compose a precise prompt for an image generation model. Use when the user asks for an image, illustration, mockup, or hero visual.",
  parameters: z.object({
    subject: z.string().min(2),
    composition: z.string().optional(),
    lighting: z.string().optional(),
    style: z.string().optional(),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:2"]).optional(),
    negative: z.string().optional(),
  }),
  async execute(args) {
    const parts = [
      args.subject,
      args.composition && `composition: ${args.composition}`,
      args.lighting && `lighting: ${args.lighting}`,
      args.style && `style: ${args.style}`,
      args.aspect_ratio && `aspect ratio: ${args.aspect_ratio}`,
      args.negative && `avoid: ${args.negative}`,
    ].filter(Boolean);
    return {
      ok: true,
      prompt: parts.join(", "),
      hint: "Paste into Midjourney, Flux, Imagen, or any image model.",
    };
  },
});
