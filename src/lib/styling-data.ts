import heroBridal from "@/assets/hero-bridal.jpg";
import lookWaves from "@/assets/look-waves.jpg";
import lookBraid from "@/assets/look-braid.jpg";
import lookMen from "@/assets/look-men.jpg";

export const images = { heroBridal, lookWaves, lookBraid, lookMen };

export const OCCASIONS = [
  "Wedding", "Engagement", "Reception", "Mehendi", "Haldi", "Sangeet", "Cocktail Party",
  "Birthday", "Festival", "Casual Outing", "Photoshoot", "Graduation", "Professional Event", "Other",
];

export const PREFS = {
  aesthetic: { label: "Aesthetic", multi: true, options: ["Traditional", "Modern", "Elegant", "Minimal", "Romantic", "Glamorous", "Other"] },
  arrangement: { label: "Arrangement", multi: true, options: ["Open Hair", "Half-up", "Bun", "Braid", "Ponytail", "Updo", "Other"] },
  length: { label: "Length", multi: true, options: ["Short", "Medium", "Long", "Keep Current Length", "Other"] },
  texture: { label: "Texture", multi: true, options: ["Straight", "Wavy", "Curly", "Natural Texture", "Other"] },
} as const;
export type PrefKey = keyof typeof PREFS;

export const ACCESSORY_TYPES = [
  { id: "floral", name: "Floral accessories", note: "Gajra, roses, baby's breath", group: "Traditional" },
  { id: "traditional", name: "Traditional jewellery", note: "Maang tikka, matha patti, jhoomar", group: "Traditional" },
  { id: "kundan", name: "Kundan & pearl pins", note: "Scattered pins and studs", group: "Traditional" },
  { id: "clips", name: "Modern clips", note: "Sculpted metal and pearl clips", group: "Modern" },
  { id: "headband", name: "Embellished headband", note: "Crystal or pearl band", group: "Modern" },
  { id: "minimal", name: "Minimal accessories", note: "A single delicate accent", group: "Modern" },
  { id: "Other", name: "Other", note: "Describe your own", group: "Other" },
];
export const PLACEMENTS = ["Bun", "Braid", "Side", "Crown", "Front", "Other"];
export const INTENSITY = ["Subtle", "Moderate", "Heavy"] as const;

export const HAIRCUTS = ["Layered cut", "Butterfly cut", "Curtain bangs", "Classic bob", "Wolf cut", "Textured crop", "Taper fade", "Pixie"];

export type Look = {
  id: string;
  name: string;
  image: string;
  match: number;
  summary: string;
  why: string[];
  tags: string[];
  occasions?: string[];
  accessories?: string[];
  tips?: string[];
};

export const SAMPLE_LOOKS: Look[] = [
  {
    id: "gajra-bun", name: "Gajra Low Bun", image: heroBridal, match: 96,
    summary: "A polished low bun wrapped in jasmine with kundan accents.",
    why: ["Elongates an oval face", "Frames a heavy choker neckline", "Holds through long ceremonies"],
    tags: ["Traditional", "Bun", "Wedding"],
    occasions: ["Wedding", "Engagement", "Reception"], accessories: ["Fresh jasmine gajra", "Kundan pins"], tips: ["Prep with a light texturising spray", "Pin the gajra after the dupatta"],
  },
  {
    id: "rose-braid", name: "Rose Temple Braid", image: lookBraid, match: 91,
    summary: "A long braid threaded with roses and temple-gold pins.",
    why: ["Shows off a backless blouse", "Rich colour against silk", "Classic South Indian silhouette"],
    tags: ["Traditional", "Braid", "Reception"],
    occasions: ["Reception", "Mehendi", "Haldi"], accessories: ["Fresh roses", "Temple-gold pins"], tips: ["Braid slightly loose for volume", "Add flowers from the top down"],
  },
  {
    id: "pearl-waves", name: "Pearl Half-up Waves", image: lookWaves, match: 88,
    summary: "Soft romantic waves pinned back with a pearl clip cluster.",
    why: ["Softens strong jawlines", "Light and movement-friendly", "Ideal for Sangeet and Cocktail"],
    tags: ["Romantic", "Half-up", "Sangeet"],
    occasions: ["Sangeet", "Cocktail Party", "Engagement"], accessories: ["Pearl clip cluster"], tips: ["Curl away from the face", "Set waves with a flexible spray"],
  },
  {
    id: "sleek-pony", name: "Sleek Jewelled Ponytail", image: lookWaves, match: 85,
    summary: "A high, glossy ponytail wrapped at the base with a jewelled cuff.",
    why: ["Lifts and lengthens the profile", "Modern contrast to a traditional outfit", "Stays put while dancing"],
    tags: ["Modern", "Glamorous", "Ponytail", "Cocktail Party"],
    occasions: ["Cocktail Party", "Sangeet", "Birthday", "Festival"], accessories: ["Jewelled hair cuff"], tips: ["Smooth with a serum before tying", "Wrap a strand over the band"],
  },
  {
    id: "floral-updo", name: "Romantic Floral Updo", image: heroBridal, match: 83,
    summary: "A soft, textured updo with baby's breath tucked through the twists.",
    why: ["Shows off statement earrings", "Graceful under a veil or dupatta", "Photographs beautifully from every side"],
    tags: ["Romantic", "Elegant", "Updo", "Photoshoot"],
    occasions: ["Engagement", "Photoshoot", "Reception", "Graduation"], accessories: ["Baby's breath", "Pearl pins"], tips: ["Leave face-framing tendrils", "Secure each twist with two pins"],
  },
];

export const HAIRCUT_LOOKS: Look[] = [
  {
    id: "textured-quiff", name: "Textured Quiff Taper", image: lookMen, match: 94,
    summary: "Soft taper on the sides with lifted, piece-y texture on top.",
    why: ["Adds height to a square face", "Low daily maintenance", "Works with a full beard"],
    tags: ["Modern", "Short", "Everyday"],
  },
  {
    id: "long-layers", name: "Long Face-framing Layers", image: lookWaves, match: 90,
    summary: "Long layers starting at the cheekbone for movement.",
    why: ["Keeps length for occasions", "Easy to curl or wave", "Frames the eyes"],
    tags: ["Long", "Wavy", "Everyday"],
  },
];
