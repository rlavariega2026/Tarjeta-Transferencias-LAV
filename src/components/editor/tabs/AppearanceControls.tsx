import type { CardEffects, DesignShadow, LogoAppearance } from '../../../types/paymentCard';

const groupClass = 'space-y-3 rounded-xl border border-slate-700 bg-slate-950/40 p-4';
const inputClass = 'w-full accent-violet-400';

function Range({ label, value, min, max, suffix = '', step = 1, onChange }: {
  label: string; value: number; min: number; max: number; suffix?: string; step?: number; onChange: (value: number) => void;
}) {
  return <label className="block text-xs text-slate-200">
    <span className="flex justify-between gap-2">{label}<output className="tabular-nums text-violet-300">{value}{suffix}</output></span>
    <input className={inputClass} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
  </label>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex items-center gap-2 text-xs text-slate-200">
    <input type="color" className="h-8 w-10 cursor-pointer rounded bg-transparent" value={value} onChange={e => onChange(e.target.value)} />{label}
  </label>;
}

function ShadowControls({ label, value, onChange }: { label: string; value: DesignShadow; onChange: (value: DesignShadow) => void }) {
  const update = (patch: Partial<DesignShadow>) => onChange({ ...value, ...patch });
  return <fieldset className={groupClass}>
    <label className="flex items-center gap-2 text-sm text-slate-100">
      <input type="checkbox" checked={value.enabled} onChange={e => update({ enabled: e.target.checked })} />{label}
    </label>
    {value.enabled && <div className="grid gap-3 sm:grid-cols-2">
      <Color label="Color de sombra" value={value.color} onChange={color => update({ color })} />
      <Range label="Intensidad de sombra" value={value.opacity} min={0} max={100} suffix="%" onChange={opacity => update({ opacity })} />
      <Range label="Desenfoque" value={value.blur} min={0} max={64} suffix=" px" onChange={blur => update({ blur })} />
      <Range label="Desplazamiento horizontal" value={value.x} min={-24} max={24} suffix=" px" onChange={x => update({ x })} />
      <Range label="Desplazamiento vertical" value={value.y} min={-24} max={32} suffix=" px" onChange={y => update({ y })} />
    </div>}
  </fieldset>;
}

export function LogoAppearanceControls({ value, onChange }: { value: LogoAppearance; onChange: (value: LogoAppearance) => void }) {
  const update = (patch: Partial<LogoAppearance>) => onChange({ ...value, ...patch });
  return <section className="space-y-3">
    <div className={groupClass}>
      <h4 className="text-sm font-semibold text-white">Tamaño y encuadre del logotipo</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <Range label="Ancho" value={value.width} min={56} max={290} suffix=" px" onChange={width => update({ width })} />
        <Range label="Alto" value={value.height} min={40} max={200} suffix=" px" onChange={height => update({ height })} />
        <label className="text-xs text-slate-200">Encuadre
          <select className="mt-1 block w-full rounded-lg bg-slate-800 p-2" value={value.fit} onChange={e => update({ fit: e.target.value as LogoAppearance['fit'] })}>
            <option value="contain">Completo</option>
            <option value="cover">Recorte ajustable</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-100">
          <input type="checkbox" checked={value.background} onChange={e => update({ background: e.target.checked })} />Base blanca
        </label>
        {value.fit === 'cover' && <>
          <Range label="Acercamiento de la imagen" value={value.zoom} min={1} max={4} step={0.1} suffix="×" onChange={zoom => update({ zoom })} />
          <Range label="Posición horizontal" value={value.x} min={0} max={100} suffix="%" onChange={x => update({ x })} />
          <Range label="Posición vertical" value={value.y} min={0} max={100} suffix="%" onChange={y => update({ y })} />
        </>}
      </div>
    </div>
    <ShadowControls label="Sombra del logotipo" value={value.shadow} onChange={shadow => update({ shadow })} />
  </section>;
}

export function CardEffectControls({ value, onChange }: { value: CardEffects; onChange: (value: CardEffects) => void }) {
  const border = (patch: Partial<CardEffects['border']>) => onChange({ ...value, border: { ...value.border, ...patch } });
  const beam = (patch: Partial<CardEffects['beam']>) => onChange({ ...value, beam: { ...value.beam, ...patch } });
  return <section className="space-y-3">
    <div className={groupClass}>
      <h4 className="text-sm font-semibold text-white">Contorno de la tarjeta</h4>
      <label className="text-xs text-slate-200">Acabado del contorno
        <select className="mt-1 block w-full rounded-lg bg-slate-800 p-2" value={value.border.style} onChange={e => border({ style: e.target.value as CardEffects['border']['style'] })}>
          <option value="template">De la plantilla</option>
          <option value="solid">Sólido</option>
          <option value="gradient">Degradado</option>
          <option value="metallic">Metálico</option>
        </select>
      </label>
      {value.border.style !== 'template' && <div className="grid gap-3 sm:grid-cols-2">
        <Range label="Grosor del contorno" value={value.border.width} min={1} max={8} suffix=" px" onChange={width => border({ width })} />
        <Range label="Radio de las esquinas" value={value.border.radius} min={0} max={44} suffix=" px" onChange={radius => border({ radius })} />
        <Color label="Color de contorno" value={value.border.color} onChange={color => border({ color })} />
        {value.border.style !== 'solid' && <Color label="Segundo color" value={value.border.accent} onChange={accent => border({ accent })} />}
      </div>}
    </div>
    <ShadowControls label="Sombra personalizada de la tarjeta" value={value.shadow} onChange={shadow => onChange({ ...value, shadow })} />
    <fieldset className={groupClass}>
      <label className="flex items-center gap-2 text-sm text-slate-100">
        <input type="checkbox" checked={value.beam.enabled} onChange={e => beam({ enabled: e.target.checked })} />Destello en el perímetro (Beam)
      </label>
      {value.beam.enabled && <div className="grid gap-3 sm:grid-cols-2">
        <Color label="Color del destello" value={value.beam.color} onChange={color => beam({ color })} />
        <Range label="Intensidad del destello" value={value.beam.intensity} min={10} max={100} suffix="%" onChange={intensity => beam({ intensity })} />
        <Range label="Segundos por vuelta" value={value.beam.seconds} min={2} max={20} suffix=" s" onChange={seconds => beam({ seconds })} />
      </div>}
    </fieldset>
  </section>;
}
