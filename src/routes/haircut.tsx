import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HAIRCUTS, images, type Look } from "@/lib/styling-data";
import { recommendHaircuts } from "@/lib/stylist-service";
import { saveLook } from "@/lib/saved-looks";
import { Analyzing, BeforeAfter, Chip, ImageUpload, PageHero } from "@/components/style/controls";

export const Route = createFileRoute("/haircut")({
  head: () => ({
    meta: [
      { title: "Haircut Studio — StyleMirror AI" },
      { name: "description", content: "Preview a new haircut on your own photo and discover alternatives that suit your face." },
      { property: "og:title", content: "Haircut Studio — StyleMirror AI" },
      { property: "og:description", content: "Try haircuts on your photo before visiting the salon." },
    ],
  }),
  component: HaircutStudio,
});

function HaircutStudio() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [cut, setCut] = useState<string>("");
  const [phase, setPhase] = useState<"input" | "loading" | "results">("input");
  const [results, setResults] = useState<Look[]>([]);
  const [active, setActive] = useState(0);

  const run = async () => {
    setPhase("loading");
    window.__lovableEvents?.track?.("project.hairstyles_generated", { flow: "haircut", regenerate: false });
    setResults(await recommendHaircuts({ photo, reference: ref, name: cut }));
    setActive(0); setPhase("results");
  };

  return (
    <>
      <PageHero eyebrow="Haircut Studio" title={<>Try the cut. <em className="text-rose">Then</em> book the salon.</>}>
        For men and women, everyday or occasion. Upload a photo with a reference, or simply name the haircut.
      </PageHero>
      <div className="mx-auto max-w-6xl px-5">
        {phase === "input" && (
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <ImageUpload label="Your photograph" hint="Front-facing, hair pulled back from face" value={photo} onChange={setPhoto} sample={images.lookMen} />
            <div className="space-y-6">
              <Tabs defaultValue="name">
                <TabsList className="rounded-full bg-muted">
                  <TabsTrigger value="name" className="rounded-full">Choose a haircut</TabsTrigger>
                  <TabsTrigger value="ref" className="rounded-full">Upload reference</TabsTrigger>
                </TabsList>
                <TabsContent value="name" className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {HAIRCUTS.map((h) => <Chip key={h} active={cut === h} onClick={() => setCut(cut === h ? "" : h)}>{h}</Chip>)}
                  </div>
                </TabsContent>
                <TabsContent value="ref" className="max-w-[14rem] pt-4">
                  <ImageUpload label="Haircut reference" value={ref} onChange={setRef} sample={images.lookWaves} />
                </TabsContent>
              </Tabs>
              <Button variant="rose" size="lg" disabled={!photo || (!cut && !ref)} onClick={run}><Sparkles /> Preview haircut</Button>
              {!photo && <p className="text-sm text-muted-foreground">Add your photo (or a sample) to begin.</p>}
            </div>
          </div>
        )}
        {phase === "loading" && <Analyzing title="Mapping your haircut" steps={["Detecting face shape", "Reading hair density", `Applying ${cut || "your reference"}`, "Finding alternatives"]} />}
        {phase === "results" && results[active] && (
          <div className="space-y-10">
            <div className="grid gap-8 md:grid-cols-2">
              <BeforeAfter before={photo ?? images.lookMen} after={results[active].image} />
              <div className="space-y-4">
                <p className="eyebrow">{results[active].match}% match{cut && active === 0 ? ` · based on ${cut}` : ""}</p>
                <h2 className="text-4xl md:text-5xl">{results[active].name}</h2>
                <p className="text-muted-foreground">{results[active].summary}</p>
                <ul className="space-y-1">{results[active].why.map((w) => <li key={w}>· {w}</li>)}</ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="rose" onClick={() => { window.__lovableEvents?.track?.("project.look_saved", { flow: "haircut" }); const r = results[active]!; saveLook({ id: `${r.id}-${Date.now()}`, name: r.name, image: r.image, accessories: [] }); toast.success("Haircut saved"); }}><Heart /> Save</Button>
                  <Button variant="soft" onClick={() => setPhase("input")}><RotateCcw /> Try another</Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl">Alternative recommendations</h3>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {results.map((r, i) => (
                  <button key={r.id} onClick={() => setActive(i)} className={`overflow-hidden rounded-2xl border text-left ${i === active ? "border-rose" : "border-border"}`}>
                    <img src={r.image} alt={r.name} loading="lazy" className="aspect-square w-full object-cover" />
                    <p className="p-3 font-serif text-lg">{r.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
