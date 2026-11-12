import { describe, expect, it } from "vitest";
import { stepError, validateImageFile, type StudioDraft } from "@/lib/bridal-validation";

const base: StudioDraft = { face: "x", occasions: ["Wedding"], occasionOther: "", prefs: { aesthetic: [] }, prefOther: { aesthetic: "" }, instructions: "" };

describe("Bridal studio rules", () => {
  it("requires a face photo", () => expect(stepError(0, { ...base, face: null })).not.toBeNull());
  it("accepts jpg, png, webp and rejects gif", () => {
    expect(validateImageFile({ name: "a.jpeg", type: "image/jpeg" })).toBeNull();
    expect(validateImageFile({ name: "a.webp", type: "image/webp" })).toBeNull();
    expect(validateImageFile({ name: "a.gif", type: "image/gif" })).not.toBeNull();
  });
  it("needs text when Other occasion is chosen", () => expect(stepError(1, { ...base, occasions: ["Other"] })).not.toBeNull());
  it("caps instructions at 500 characters", () => {
    expect(stepError(4, { ...base, instructions: "a".repeat(500) })).toBeNull();
    expect(stepError(4, { ...base, instructions: "a".repeat(501) })).not.toBeNull();
  });
});
