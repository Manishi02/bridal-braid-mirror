// Simulated AI layer. Replace these functions with real image-generation / LLM calls later;
// the UI only depends on these signatures.
import { HAIRCUT_LOOKS, SAMPLE_LOOKS, type Look } from "./styling-data";

export type StyleBrief = {
  faceImage?: string | null;
  outfitImage?: string | null;
  occasions: string[];
  prefs: Record<string, string[]>;
  accessories: string[];
  instructions?: string;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function recommendHairstyles(brief: StyleBrief): Promise<Look[]> {
  await wait(2200);
  const wanted = Object.values(brief.prefs).flat().concat(brief.occasions);
  return [...SAMPLE_LOOKS].sort(
    (a, b) => b.tags.filter((t) => wanted.includes(t)).length - a.tags.filter((t) => wanted.includes(t)).length,
  );
}

export async function recommendHaircuts(_: { photo?: string | null; reference?: string | null; name?: string }) {
  await wait(2000);
  return HAIRCUT_LOOKS;
}

export async function suggestAccessories(lookName: string) {
  await wait(1200);
  return { types: ["floral", "kundan"], placement: "Bun", intensity: "Moderate", note: `Jasmine strands with kundan pins balance the ${lookName}.` };
}

const REPLIES = [
  "For a Wedding with a heavy lehenga, I'd anchor the look with a low bun so the dupatta sits cleanly. Add fresh gajra for fragrance and photos.",
  "Your outfit has a deep neckline — a half-up style with soft waves would keep the shoulders open while still feeling occasion-ready.",
  "For Mehendi and Haldi, choose a braid: it's practical, stays out of the way, and looks beautiful with floral accents.",
  "If you prefer minimal accessories, try a single kundan pin on the side of the bun — elegant without competing with your jewellery.",
];
export async function stylistReply(message: string, turn: number): Promise<string> {
  await wait(1100);
  const m = message.toLowerCase();
  if (m.includes("men") || m.includes("short")) return "For shorter hair, a textured crop or taper keeps it sharp. Ask the Haircut Studio for side-by-side previews.";
  if (m.includes("accessor")) return REPLIES[3]!;
  if (m.includes("mehendi") || m.includes("haldi")) return REPLIES[2]!;
  return REPLIES[turn % REPLIES.length]!;
}
