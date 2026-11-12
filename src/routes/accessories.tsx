import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SAMPLE_LOOKS } from "@/lib/styling-data";
import { saveLook } from "@/lib/saved-looks";
import { PageHero } from "@/components/style/controls";
import { AccessoryPanel, AccessorizedPreview, accessoryLabels, emptyAccessories, type AccessoryState } from "@/components/style/AccessoryPanel";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessory Studio — StyleMirror AI" },
      { name: "description", content: "Experiment with gajra, kundan pins, pearls, traditional jewellery and modern clips on your hairstyle." },
      { property: "og:title", content: "Accessory Studio — StyleMirror AI" },
      { property: "og:description", content: "Layer and compare hair accessory combinations." },
    ],
  }),
  component: AccessoryStudio,
});

type Combo = { id: string; lookId: string; acc: AccessoryState };

function AccessoryStudio() {
  const [lookId, setLookId] = useState(SAMPLE_LOOKS[0]!.id);
  const [acc, setAcc] = useState<AccessoryState>({ ...emptyAccessories, types: ["floral"], placement: ["Bun"] });
  const [combos, setCombos] = useState<Combo[]>([]);
  const look = SAMPLE_LOOKS.find((l) => l.id === lookId)!;

  return (
    <>
      <PageHero eyebrow="Accessory Studio" title={<>Jasmine, kundan, <em className="text-rose">or nothing at all.</em></>}>
        Pick a hairstyle, layer accessories, and save combinations side by side.
      </PageHero>
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-6 flex flex-wrap gap-2">
          {SAMPLE_LOOKS.map((l) => (
            <button key={l.id} onClick={() => setLookId(l.id)} className={cn("flex items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm", l.id === lookId ? "border-rose bg-secondary" : "border-border bg-card")}>
              <img src={l.image} alt="" className="h-8 w-8 rounded-full object-cover" /> {l.name}
            </button>
          ))}
        </div>
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3 md:sticky md:top-24 md:self-start">
            <AccessorizedPreview image={look.image} name={look.name} acc={acc} />
            <Button variant="soft" className="w-full" onClick={() => setCombos([...combos, { id: crypto.randomUUID(), lookId, acc }])}>
              <Plus /> Add to comparison
            </Button>
          </div>
          <AccessoryPanel value={acc} onChange={setAcc} lookName={look.name} />
        </div>

        {combos.length > 0 && (
          <section className="mt-16">
            <h2 className="text-4xl">Your combinations</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {combos.map((c) => {
                const l = SAMPLE_LOOKS.find((x) => x.id === c.lookId)!;
                return (
                  <div key={c.id} className="relative space-y-2">
                    <button aria-label="Remove" onClick={() => setCombos(combos.filter((x) => x.id !== c.id))} className="absolute right-2 top-2 z-10 rounded-full bg-card/90 p-1.5"><X className="h-3.5 w-3.5" /></button>
                    <AccessorizedPreview image={l.image} name={l.name} acc={c.acc} />
                    <Button size="sm" variant="rose" className="w-full" onClick={() => { saveLook({ id: c.id, name: l.name, image: l.image, accessories: accessoryLabels(c.acc), intensity: c.acc.none ? undefined : c.acc.intensity }); toast.success("Combination saved"); }}>
                      <Heart /> Save
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
