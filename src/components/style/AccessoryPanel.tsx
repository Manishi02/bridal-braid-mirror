import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ACCESSORY_TYPES, INTENSITY, PLACEMENTS } from "@/lib/styling-data";
import { suggestAccessories } from "@/lib/stylist-service";
import { Chip, ImageUpload } from "./controls";

export type AccessoryState = {
  none: boolean;
  types: string[];
  other: string;
  placement: string[];
  intensity: (typeof INTENSITY)[number];
  reference: string | null;
  placementOther?: string;
};

export const emptyAccessories: AccessoryState = { none: false, types: [], other: "", placement: [], intensity: "Moderate", reference: null };

export function accessoryLabels(a: AccessoryState) {
  if (a.none) return ["No accessories"];
  return a.types.map((t) => (t === "Other" ? a.other || "Custom" : ACCESSORY_TYPES.find((x) => x.id === t)?.name ?? t));
}

export function AccessoryPanel({ value, onChange, lookName = "selected look", showReference = true }: {
  value: AccessoryState; onChange: (v: AccessoryState) => void; lookName?: string; showReference?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const set = (p: Partial<AccessoryState>) => onChange({ ...value, ...p });
  const toggle = (k: "types" | "placement", v: string) =>
    set({ [k]: value[k].includes(v) ? value[k].filter((x) => x !== v) : [...value[k], v] } as Partial<AccessoryState>);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="font-medium">No accessories</p>
          <p className="text-sm text-muted-foreground">Keep the hairstyle clean</p>
        </div>
        <Switch checked={value.none} onCheckedChange={(none) => set({ none })} aria-label="No accessories" />
      </div>

      <div className={cn("space-y-7 transition", value.none && "pointer-events-none opacity-40")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {ACCESSORY_TYPES.map((a) => {
            const on = value.types.includes(a.id);
            return (
              <button key={a.id} type="button" onClick={() => toggle("types", a.id)} aria-pressed={on}
                className={cn("rounded-2xl border p-4 text-left transition", on ? "border-rose bg-secondary" : "border-border bg-card hover:border-rose/60")}>
                <p className="font-serif text-xl">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.group !== "Other" && `${a.group} · `}{a.note}</p>
              </button>
            );
          })}
        </div>
        {value.types.includes("Other") && (
          <Input value={value.other} onChange={(e) => set({ other: e.target.value })} placeholder="Describe your accessory…" className="h-11 rounded-full bg-card px-5" />
        )}

        <div className="space-y-3">
          <h4 className="text-xl">Placement</h4>
          <div className="flex flex-wrap gap-2">
            {PLACEMENTS.map((p) => <Chip key={p} active={value.placement.includes(p)} onClick={() => toggle("placement", p)}>{p}</Chip>)}
          </div>
          {value.placement.includes("Other") && (
            <Input value={value.placementOther ?? ""} onChange={(e) => set({ placementOther: e.target.value })} placeholder="Describe the placement…" className="h-11 rounded-full bg-card px-5" />
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-xl">Styling intensity</h4>
          <div className="grid grid-cols-3 rounded-full border border-border bg-card p-1">
            {INTENSITY.map((i) => (
              <button key={i} type="button" onClick={() => set({ intensity: i })}
                className={cn("rounded-full py-2 text-sm transition", value.intensity === i ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {i}
              </button>
            ))}
          </div>
        </div>

        {showReference && (
          <div className="max-w-[14rem]">
            <ImageUpload label="Accessory reference" hint="Optional inspiration photo" value={value.reference} onChange={(reference) => set({ reference })} />
          </div>
        )}

        <div className="space-y-3">
          <Button variant="soft" disabled={loading} onClick={async () => {
            setLoading(true);
            const r = await suggestAccessories(lookName);
            onChange({ ...value, none: false, types: r.types, placement: [r.placement], intensity: r.intensity as AccessoryState["intensity"] });
            setNote(r.note); setLoading(false);
          }}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-rose" />} Recommend accessories for me
          </Button>
          {note && <p className="rounded-2xl bg-secondary p-4 text-sm">{note}</p>}
        </div>
      </div>
    </div>
  );
}

export function AccessorizedPreview({ image, acc, name }: { image: string; acc: AccessoryState; name: string }) {
  const intensityFilter = acc.none ? "" : acc.intensity === "Subtle" ? "saturate-[0.9]" : acc.intensity === "Heavy" ? "saturate-[1.25] contrast-[1.05]" : "";
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
      <img src={image} alt={name} className={cn("h-full w-full object-cover transition duration-700", intensityFilter)} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-20">
        <p className="font-serif text-2xl text-primary-foreground">{name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {accessoryLabels(acc).map((l) => <span key={l} className="rounded-full bg-card/90 px-2.5 py-0.5 text-xs">{l}</span>)}
          {!acc.none && acc.types.length > 0 && <span className="rounded-full bg-rose px-2.5 py-0.5 text-xs text-accent-foreground">{acc.intensity}</span>}
          {acc.placement.map((p) => (p === "Other" ? acc.placementOther || "Custom placement" : p)).map((p) => <span key={p} className="rounded-full border border-card/60 px-2.5 py-0.5 text-xs text-primary-foreground">{p}</span>)}
        </div>
      </div>
    </div>
  );
}
