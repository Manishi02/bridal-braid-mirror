import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, Heart, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_INSTRUCTIONS, stepError } from "@/lib/bridal-validation";
import { cn } from "@/lib/utils";
import { images, OCCASIONS, PREFS, type Look, type PrefKey } from "@/lib/styling-data";
import { recommendHairstyles } from "@/lib/stylist-service";
import { saveLook } from "@/lib/saved-looks";
import { Analyzing, BeforeAfter, ChipGroup, ImageUpload } from "@/components/style/controls";
import { AccessoryPanel, AccessorizedPreview, accessoryLabels, emptyAccessories, type AccessoryState } from "@/components/style/AccessoryPanel";

export const Route = createFileRoute("/occasion")({
  validateSearch: (s: Record<string, unknown>): { sample?: boolean | undefined } => ({
    sample: s["sample"] === true || s["sample"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bridal Styling Studio — StyleMirror AI" },
      { name: "description", content: "Guided bridal and occasion hairstyle recommendations based on your face, outfit and ceremony." },
      { property: "og:title", content: "Bridal Styling Studio — StyleMirror AI" },
      { property: "og:description", content: "Upload your face and outfit, pick your occasions, and preview your hairstyle." },
    ],
  }),
  component: OccasionStylist,
});

const STEPS = ["Photos", "Occasion", "Hairstyle", "Accessories", "Review"];
type Prefs = Record<PrefKey, string[]>;
type AccMode = "ai" | "specific" | "none";
const ACC_MODES: { id: AccMode; label: string; note: string }[] = [
  { id: "ai", label: "Let AI Recommend", note: "We'll suggest accessories per look" },
  { id: "specific", label: "I Have Specific Accessories", note: "Choose types, placement and intensity" },
  { id: "none", label: "No Accessories", note: "Keep the hairstyle clean" },
];

function OccasionStylist() {
  const { sample } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "results">("form");
  const [face, setFace] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionOther, setOccasionOther] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ aesthetic: [], arrangement: [], length: [], texture: [] });
  const [prefOther, setPrefOther] = useState<Record<PrefKey, string>>({ aesthetic: "", arrangement: "", length: "", texture: "" });
  const [accMode, setAccMode] = useState<AccMode>("ai");
  const [accPrefs, setAccPrefs] = useState<AccessoryState>(emptyAccessories);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [accByLook, setAccByLook] = useState<Record<string, AccessoryState>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [customizeId, setCustomizeId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    if (sample) {
      setFace(images.lookWaves); setOutfit(images.lookBraid);
      setOccasions(["Wedding", "Reception"]);
      setPrefs({ aesthetic: ["Traditional", "Elegant"], arrangement: ["Bun", "Braid"], length: ["Long"], texture: ["Wavy"] });
      setAccMode("specific");
      setAccPrefs({ ...emptyAccessories, types: ["floral", "kundan"] });
    }
  }, [sample]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step, phase]);

  const occasionList = occasions.map((o) => (o === "Other" ? occasionOther : o));
  const effectiveAcc: AccessoryState = accMode === "none" ? { ...emptyAccessories, none: true } : accMode === "specific" ? accPrefs : emptyAccessories;
  const accFor = (id: string) => accByLook[id] ?? effectiveAcc;
  const prefText = (k: PrefKey) => prefs[k].map((v) => (v === "Other" ? prefOther[k] : v));

  const next = () => {
    const err = stepError(step, { face, occasions, occasionOther, prefs, prefOther, instructions });
    setError(err);
    if (!err) setStep(step + 1);
  };
  const skip = () => {
    if (step === 2) { setPrefs({ aesthetic: [], arrangement: [], length: [], texture: [] }); }
    if (step === 3) { setAccMode("ai"); setAccPrefs(emptyAccessories); }
    setError(null); setStep(step + 1);
  };
  const generate = async () => {
    const err = stepError(4, { face, occasions, occasionOther, prefs, prefOther, instructions });
    setError(err); if (err) return;
    setPhase("results"); setGenerating(true); setLooks(null); setCompare([]); setPreviewId(null); setCustomizeId(null);
    const r = await recommendHairstyles({ faceImage: face, outfitImage: outfit, occasions: occasionList, prefs, accessories: effectiveAcc.types, instructions });
    setLooks(r.slice(0, 5)); setGenerating(false);
  };
  const save = (l: Look) => {
    const a = accFor(l.id);
    const accs = accMode === "ai" && !accByLook[l.id] ? (l.accessories ?? []) : accessoryLabels(a);
    saveLook({ id: `${l.id}-${Date.now()}`, name: l.name, image: l.image, accessories: accs, intensity: a.none || accs.length === 0 ? undefined : a.intensity, occasions: occasionList });
    toast.success(`${l.name} saved to your looks`);
  };

  if (phase === "results") {
    const preview = looks?.find((l) => l.id === previewId);
    const custom = looks?.find((l) => l.id === customizeId);
    const compared = (looks ?? []).filter((l) => compare.includes(l.id));
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <button onClick={() => setPhase("form")} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Edit my choices</button>
        {generating || !looks ? (
          <Analyzing steps={["Reading face shape", outfit ? "Matching outfit neckline" : "Considering your look", `Considering ${occasionList.join(", ")}`, "Curating hairstyles"]} />
        ) : (
          <Section title="Your hairstyle recommendations" body={`Styled for ${occasionList.join(", ")}.`}>
            <p role="note" className="mb-6 rounded-2xl bg-secondary p-4 text-sm">
              <strong>Simulated results.</strong> These are sample hairstyles and example photos, matched to your choices. They are not yet generated from your own photos.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {looks.map((l) => {
                const inCompare = compare.includes(l.id);
                return (
                  <div key={l.id} className={cn("overflow-hidden rounded-3xl border bg-card", inCompare ? "border-rose shadow-soft" : "border-border")}>
                    <div className="relative">
                      <img src={l.image} alt={l.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold">{l.match}% match · sample</span>
                    </div>
                    <div className="space-y-3 p-5">
                      <h3 className="text-2xl">{l.name}</h3>
                      <p className="text-sm text-muted-foreground">{l.summary}</p>
                      <div><p className="eyebrow">Suits</p><div className="mt-1 flex flex-wrap gap-1.5">{(l.occasions ?? l.tags).map((o) => <span key={o} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{o}</span>)}</div></div>
                      <div><p className="eyebrow">Suggested accessories</p><p className="mt-1 text-sm">{(accMode === "ai" && !accByLook[l.id] ? l.accessories ?? [] : accessoryLabels(accFor(l.id))).join(", ") || "None"}</p></div>
                      <div><p className="eyebrow">Styling tips</p><ul className="mt-1 space-y-1 text-sm">{(l.tips ?? l.why).map((t) => <li key={t}>· {t}</li>)}</ul></div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button size="sm" variant="soft" onClick={() => { setPreviewId(l.id); setCustomizeId(null); }}><Eye /> Preview</Button>
                        <Button size="sm" variant="soft" onClick={() => { setCustomizeId(l.id); setPreviewId(null); }}><Wand2 /> Customize</Button>
                        <Button size="sm" variant="rose" onClick={() => save(l)}><Heart /> Save</Button>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox checked={inCompare} onCheckedChange={(c) => {
                          if (c && compare.length >= 3) { toast.error("Compare up to 3 looks at a time"); return; }
                          setCompare(c ? [...compare, l.id] : compare.filter((x) => x !== l.id));
                        }} /> Add to compare
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {preview && (
              <Panel title={`Preview · ${preview.name}`} onClose={() => setPreviewId(null)}>
                <div className="grid gap-8 md:grid-cols-2">
                  <BeforeAfter before={face ?? images.lookWaves} after={preview.image} />
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Drag the slider to compare your photo with the sample look.</p>
                    <AccessorizedPreview image={preview.image} name={preview.name} acc={accFor(preview.id)} />
                  </div>
                </div>
              </Panel>
            )}
            {custom && (
              <Panel title={`Customize · ${custom.name}`} onClose={() => setCustomizeId(null)}>
                <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
                  <div className="md:sticky md:top-24 md:self-start"><AccessorizedPreview image={custom.image} name={custom.name} acc={accFor(custom.id)} /></div>
                  <div className="space-y-6">
                    <AccessoryPanel lookName={custom.name} showReference={false} value={accFor(custom.id)} onChange={(v) => setAccByLook({ ...accByLook, [custom.id]: v })} />
                    <Button variant="rose" onClick={() => save(custom)}><Heart /> Save customised look</Button>
                  </div>
                </div>
              </Panel>
            )}
            {compared.length > 0 && (
              <Panel title={`Compare (${compared.length})`} onClose={() => setCompare([])} closeLabel="Clear">
                {compared.length < 2 && <p className="mb-4 text-sm text-muted-foreground">Add one more look to compare side by side.</p>}
                <div className={cn("grid gap-6", compared.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "max-w-sm")}>
                  {compared.map((l) => (
                    <div key={l.id} className="space-y-3">
                      <AccessorizedPreview image={l.image} name={l.name} acc={accFor(l.id)} />
                      <p className="text-sm">{l.match}% match · {(l.occasions ?? []).slice(0, 3).join(", ")}</p>
                      <Button variant="rose" className="w-full" onClick={() => save(l)}><Heart /> Save this look</Button>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="soft" onClick={generate}><Sparkles className="text-rose" /> Regenerate</Button>
              <Button asChild variant="rose"><Link to="/saved">View saved looks <ArrowRight /></Link></Button>
            </div>
          </Section>
        )}
      </div>
    );
  }

  const optional = step === 2 || step === 3;
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">Bridal Styling Studio · Step {step + 1} of {STEPS.length}</p>
          <p className="hidden text-sm text-muted-foreground sm:block">{STEPS[step]}{optional && " · Optional"}</p>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-1 bg-muted [&>div]:bg-rose" />
        <div className="mt-4 hidden gap-1 md:flex">
          {STEPS.map((s, i) => (
            <button key={s} disabled={i > step} onClick={() => { setError(null); setStep(i); }}
              className={cn("flex-1 truncate rounded-full px-2 py-1 text-[11px] transition", i === step ? "bg-secondary text-secondary-foreground" : i < step ? "text-foreground hover:bg-muted" : "text-muted-foreground/60")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[28rem] animate-in fade-in" key={step}>
        {step === 0 && (
          <Section title="Begin with your photos" body="A face photo is required. Your outfit and a hairstyle reference are optional but help guide the look.">
            <div className="grid gap-6 sm:grid-cols-3">
              <ImageUpload label="Face photo" hint="Front-facing, hair visible · Required" value={face} onChange={(v) => { setFace(v); if (v) setError(null); }} sample={images.lookWaves} />
              <ImageUpload label="Outfit photo" hint="Lehenga, saree or gown" optional value={outfit} onChange={setOutfit} sample={images.lookBraid} />
              <ImageUpload label="Hairstyle reference" hint="A look you love" optional value={reference} onChange={setReference} sample={images.heroBridal} />
            </div>
          </Section>
        )}
        {step === 1 && (
          <Section title="Which occasions are you styling for?" body="Select every ceremony — we'll tailor looks for each.">
            <ChipGroup options={OCCASIONS} value={occasions} onChange={setOccasions} other={occasionOther} onOther={setOccasionOther} label="Occasions" />
          </Section>
        )}
        {step === 2 && (
          <Section title="Your hairstyle preferences" body="Choose as many as you like in each group, or skip and our stylist will decide.">
            <div className="grid gap-10 md:grid-cols-2">
              {(Object.keys(PREFS) as PrefKey[]).map((k) => (
                <ChipGroup key={k} label={PREFS[k].label} multi={PREFS[k].multi} options={PREFS[k].options}
                  value={prefs[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })}
                  other={prefOther[k]} onOther={(v) => setPrefOther({ ...prefOther, [k]: v })} />
              ))}
            </div>
          </Section>
        )}
        {step === 3 && (
          <Section title="Accessory preferences" body="Optional — you can fine-tune accessories for each look later.">
            <div className="mb-8 grid gap-2 sm:grid-cols-3">
              {ACC_MODES.map((m) => (
                <button key={m.id} type="button" aria-pressed={accMode === m.id} onClick={() => setAccMode(m.id)}
                  className={cn("rounded-2xl border p-4 text-left transition", accMode === m.id ? "border-rose bg-secondary" : "border-border bg-card hover:border-rose/60")}>
                  <p className="font-serif text-xl">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                </button>
              ))}
            </div>
            {accMode === "specific" && <AccessoryPanel hideNone value={accPrefs} onChange={(v) => setAccPrefs({ ...v, none: false })} />}
          </Section>
        )}
        {step === 4 && (
          <Section title="Instructions & review" body="Anything else your stylist should know? Then check your choices.">
            <Textarea value={instructions} maxLength={MAX_INSTRUCTIONS} onChange={(e) => setInstructions(e.target.value.slice(0, MAX_INSTRUCTIONS))} rows={5}
              placeholder="e.g. I'll wear a heavy dupatta on my head for the pheras, and I want my hair to last 10 hours."
              className="rounded-3xl bg-card p-5 text-base" />
            <p className="mt-2 text-right text-xs text-muted-foreground">{instructions.length}/{MAX_INSTRUCTIONS}</p>
            <div className="mt-8 grid gap-4 rounded-3xl bg-blush-gradient p-6 md:grid-cols-2">
              <Summary label="Photos" value={[face && "Face", outfit && "Outfit", reference && "Reference"].filter(Boolean).join(", ")} onEdit={() => setStep(0)} />
              <Summary label="Occasions" value={occasionList.join(", ")} onEdit={() => setStep(1)} />
              {(Object.keys(PREFS) as PrefKey[]).map((k) => <Summary key={k} label={PREFS[k].label} value={prefText(k).join(", ") || "Stylist decides"} onEdit={() => setStep(2)} />)}
              <Summary label="Accessories" value={accMode === "ai" ? "Let AI recommend" : accMode === "none" ? "No accessories" : [...accessoryLabels(accPrefs), accPrefs.intensity].join(", ")} onEdit={() => setStep(3)} />
            </div>
          </Section>
        )}
      </div>

      {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
      <div className="sticky bottom-0 -mx-5 mt-10 flex items-center justify-between gap-2 border-t border-border bg-background/90 px-5 py-4 backdrop-blur">
        <Button variant="ghost" disabled={step === 0} onClick={() => { setError(null); setStep(step - 1); }}><ArrowLeft /> Back</Button>
        <div className="flex gap-2">
          {optional && <Button variant="ghost" onClick={skip}>Skip</Button>}
          {step < STEPS.length - 1 ? (
            <Button variant="rose" onClick={next}>Continue <ArrowRight /></Button>
          ) : (
            <Button variant="rose" onClick={generate}><Sparkles /> Generate My Hairstyles</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div><p className="eyebrow">{label}</p><p className="mt-1 text-sm">{value || "—"}</p></div>
      <button type="button" onClick={onEdit} className="text-xs text-rose underline">Edit</button>
    </div>
  );
}
function Panel({ title, onClose, closeLabel = "Close", children }: { title: string; onClose: () => void; closeLabel?: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 rounded-3xl border border-border bg-card p-6 animate-in fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-3xl">{title}</h3>
        <Button size="sm" variant="ghost" onClick={onClose}><X /> {closeLabel}</Button>
      </div>
      {children}
    </div>
  );
}

function Split({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div><h2 className="text-4xl md:text-6xl">{title}</h2><p className="mt-4 max-w-md text-muted-foreground">{body}</p></div>
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </div>
  );
}
function Section({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl">{title}</h2>
      <p className="mb-8 mt-3 text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}
