// Rules for the Bridal Styling Studio flow.
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT = /\.(jpe?g|png|webp)$/i;
export const MAX_INSTRUCTIONS = 500;

export function validateImageFile(f: { name: string; type: string }): string | null {
  if (ACCEPTED_IMAGE_TYPES.includes(f.type) || (!f.type && EXT.test(f.name))) return null;
  return "Please upload a JPG, JPEG, PNG or WEBP image.";
}

export type StudioDraft = {
  face: string | null;
  occasions: string[];
  occasionOther: string;
  prefs: Record<string, string[]>;
  prefOther: Record<string, string>;
  instructions: string;
};

const otherFilled = (sel: string[], text: string) => !sel.includes("Other") || text.trim().length > 0;

/** Returns an error message for the given step (0-4) or null when the user may continue. */
export function stepError(step: number, d: StudioDraft): string | null {
  if (step === 0 && !d.face) return "Add a face photo to continue.";
  if (step === 1) {
    if (d.occasions.length === 0) return "Choose at least one occasion.";
    if (!otherFilled(d.occasions, d.occasionOther)) return "Describe your other occasion.";
  }
  if (step === 2) {
    for (const k of Object.keys(d.prefs)) if (!otherFilled(d.prefs[k] ?? [], d.prefOther[k] ?? "")) return `Describe your other ${k} choice.`;
  }
  if (step === 4 && d.instructions.length > MAX_INSTRUCTIONS) return `Instructions must be ${MAX_INSTRUCTIONS} characters or fewer.`;
  return null;
}
