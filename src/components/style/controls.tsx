import { useRef, useState, useEffect } from "react";
import { Check, ImagePlus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/bridal-validation";

export function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all",
        active ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card hover:border-rose hover:text-rose",
      )}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function ChipGroup({
  options, value, onChange, multi = true, other, onOther, label,
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
  other?: string;
  onOther?: (v: string) => void;
  label?: string;
}) {
  const toggle = (o: string) => {
    if (!multi) return onChange(value.includes(o) ? [] : [o]);
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  };
  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-baseline justify-between">
          <h4 className="text-xl">{label}</h4>
          <span className="text-xs text-muted-foreground">{multi ? "Choose any" : "Choose one"}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>
        ))}
      </div>
      {value.includes("Other") && onOther && (
        <Input
          autoFocus
          value={other ?? ""}
          onChange={(e) => onOther(e.target.value)}
          placeholder={`Describe your ${label?.toLowerCase() ?? "choice"}…`}
          className="h-11 rounded-full bg-card px-5 animate-in fade-in slide-in-from-top-1"
        />
      )}
    </div>
  );
}

export function ImageUpload({
  label, hint, value, onChange, sample, optional,
}: { label: string; hint?: string; value: string | null; onChange: (v: string | null) => void; sample?: string; optional?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-rose/50 bg-blush-gradient text-center transition hover:border-rose",
          value && "border-solid",
        )}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => { onChange(null); setError(null); }}
              className="absolute right-3 top-3 rounded-full bg-card/90 p-2 shadow-soft"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-4 py-1.5 text-xs shadow-soft"
            >
              Replace photo
            </button>
          </>
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex flex-col items-center gap-3 p-6">
            <span className="rounded-full bg-card p-4 shadow-soft"><ImagePlus className="h-6 w-6 text-rose" /></span>
            <span className="font-serif text-2xl">{label}</span>
            {hint && <span className="max-w-[16rem] text-sm text-muted-foreground">{hint}</span>}
            <span className="text-xs text-muted-foreground">JPG, PNG or WEBP{optional ? " · Optional" : ""}</span>
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const err = validateImageFile(f);
            setError(err);
            if (err) return;
            const u = URL.createObjectURL(f);
            setUrl(u);
            onChange(u);
          }}
        />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {sample && !value && (
        <button type="button" onClick={() => onChange(sample)} className="flex items-center gap-1.5 text-sm text-rose hover:underline">
          <Sparkles className="h-3.5 w-3.5" /> Use a sample photo instead
        </button>
      )}
    </div>
  );
}

export function Analyzing({ title = "Analysing your features", steps }: { title?: string; steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 600);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="relative mb-8 h-24 w-24">
        <div className="absolute inset-0 animate-ping rounded-full bg-blush" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-gradient shadow-soft">
          <Sparkles className="h-9 w-9 text-accent-foreground" />
        </div>
      </div>
      <h3 className="text-3xl">{title}</h3>
      <ul className="mt-6 space-y-2 text-sm">
        {steps.map((s, idx) => (
          <li key={s} className={cn("flex items-center gap-2 transition-opacity", idx <= i ? "opacity-100" : "opacity-30")}>
            <Check className={cn("h-4 w-4", idx < i ? "text-rose" : "text-muted-foreground")} /> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-3xl shadow-soft">
      <img src={after} alt="After" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Before" className="h-full w-full object-cover grayscale-[60%] sepia-[20%]" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-card" style={{ left: `${pos}%` }} />
      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs">Before</span>
      <span className="absolute right-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs">After</span>
      <input
        type="range" min={0} max={100} value={pos} aria-label="Compare before and after"
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-x-6 bottom-4 accent-[var(--rose)]"
      />
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 md:pt-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] md:text-7xl">{title}</h1>
      {children && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{children}</p>}
    </section>
  );
}
