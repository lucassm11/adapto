'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PERFILES_DATA } from '@/app/data/perfiles';

const DIMENSIONES = [
  { key: 'atencion', label: 'Atención sostenida', desc: 'Mantener el foco durante toda la prueba. Con impacto alto, el rendimiento cae en los últimos bloques de preguntas aunque el contenido esté dominado.' },
  { key: 'memoria', label: 'Memoria de trabajo', desc: 'Retener enunciados, instrucciones y datos mientras se razona. Impacto alto: se olvidan pasos intermedios y se pierde la pregunta.' },
  { key: 'velocidad', label: 'Velocidad de procesamiento', desc: 'Ritmo al leer, comprender y responder. Impacto alto: no da tiempo a terminar aunque se sepa la respuesta.' },
  { key: 'autorregulacion', label: 'Impulsividad y autorregulación', desc: 'Frenar la respuesta antes de verificarla. Impacto alto: respuestas precipitadas, preguntas saltadas y errores evitables.' },
  { key: 'lectoescritura', label: 'Lectoescritura', desc: 'Descodificar enunciados y producir texto. Impacto alto: el esfuerzo lector consume los recursos necesarios para pensar la respuesta.' },
  { key: 'calculo', label: 'Cálculo y número', desc: 'Operar con cantidades y alinear procedimientos. Impacto alto: errores de cálculo que enmascaran la comprensión real del problema.' },
  { key: 'ansiedad', label: 'Ansiedad anticipatoria', desc: 'Bloqueo previo y durante la prueba por miedo al fallo. Impacto alto: mente en blanco y decisiones impulsivas de entrega.' },
  { key: 'fatiga', label: 'Fatiga cognitiva', desc: 'Agotamiento de recursos tras minutos de esfuerzo sostenido. Impacto alto: abandono de las últimas preguntas o respuestas al azar.' },
];

const MITIGA = {
  atencion: [0, 3],
  memoria: [1, 3],
  velocidad: [0, 2],
  autorregulacion: [1, 4],
  lectoescritura: [2, 3],
  calculo: [2, 3],
  ansiedad: [4, 1],
  fatiga: [0, 2],
};

const HEAT = {
  'tdah-atencion': [92, 78, 70, 55, 35, 30, 60, 88],
  'tdah-hiperactivo': [70, 55, 65, 92, 25, 30, 58, 66],
  'tdah-combinado': [85, 72, 72, 88, 32, 34, 68, 84],
  'dislexia': [48, 62, 45, 35, 94, 42, 66, 58],
  'disgrafia': [38, 50, 52, 30, 90, 28, 55, 48],
  'discalculia': [42, 68, 44, 32, 30, 95, 62, 52],
  'tdl': [55, 82, 60, 48, 72, 45, 58, 64],
  'dcd': [45, 52, 75, 50, 76, 58, 52, 60],
  'dificultades-aprendizaje': [58, 66, 55, 42, 68, 66, 60, 62],
  'memoria-trabajo': [72, 96, 58, 45, 55, 62, 58, 74],
  'retraso-madurativo': [62, 58, 55, 60, 52, 50, 45, 58],
  'altas-capacidades': [45, 70, 75, 50, 25, 15, 52, 40],
  'ansiedad': [68, 60, 50, 58, 35, 38, 95, 78],
  'tea': [75, 70, 65, 72, 55, 48, 82, 70],
  'barreras-sensoriales': [60, 55, 50, 42, 48, 42, 70, 60],
  'multidiscapacidad': [80, 75, 85, 65, 78, 72, 75, 88],
};

function heatColor(t) {
  const c1 = [16, 185, 129];
  const c2 = [245, 158, 11];
  const c3 = [239, 68, 68];
  const [a, b, k] = t < 0.5 ? [c1, c2, t * 2] : [c2, c3, (t - 0.5) * 2];
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

function nivelLabel(v) {
  if (v >= 75) return 'Impacto muy alto';
  if (v >= 50) return 'Impacto alto';
  if (v >= 25) return 'Impacto moderado';
  return 'Impacto bajo';
}

function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function CountUp({ target, start }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 700, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return <>{val}</>;
}

export default function PerfilHeatmap({ slug }) {
  const perfilData = PERFILES_DATA[slug];
  const valores = HEAT[slug] || HEAT['dificultades-aprendizaje'];
  const [seleccion, setSeleccion] = useState(null);
  const [rootRef, visible] = useVisible();

  if (!perfilData) return null;

  const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
  const colorPromedio = heatColor(promedio / 100);
  const CIRC = 2 * Math.PI * 34;

  const dimSel = seleccion != null ? DIMENSIONES[seleccion] : null;
  const valSel = seleccion != null ? valores[seleccion] : null;
  const mitigaciones = dimSel
    ? (MITIGA[dimSel.key] || [])
        .map((i) => perfilData.adaptationsWeSeek?.[i])
        .filter(Boolean)
        .slice(0, 2)
    : [];

  return (
    <div ref={rootRef} className={`mt-4 bg-white rounded-3xl border border-black/[0.04] shadow-xl shadow-black/[0.03] overflow-hidden hm-root ${visible ? 'hm-in' : ''}`}>
      <style jsx global>{`
        .hm-cell { transition: transform 160ms var(--ease-out), box-shadow 200ms var(--ease-out); }
        @media (hover: hover) and (pointer: fine) {
          .hm-cell:hover { transform: translateY(-3px); }
          .hm-tip { opacity: 0; transform: translateY(4px) scale(0.95); }
          .hm-cell:hover .hm-tip { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hm-root .hm-cell { opacity: 0; transform: translateY(14px) scale(0.96); transition: opacity 500ms var(--ease-out) var(--d, 0ms), transform 550ms var(--ease-spring) var(--d, 0ms); }
        .hm-in .hm-cell { opacity: 1; transform: translateY(0) scale(1); }
        .hm-head-ring circle.hm-prog { transition: stroke-dashoffset 900ms var(--ease-out) 300ms; }
        @media (prefers-reduced-motion: reduce) {
          .hm-root .hm-cell { transition: opacity 200ms ease var(--d, 0ms); transform: none; }
          .hm-in .hm-cell { transform: none; }
        }
      `}</style>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A32]/40 mb-1">Mapa de calor cognitivo</p>
          <h3 className="font-display text-lg text-[#1a1a1a] leading-snug">Perfil «{perfilData.name}»</h3>
          <p className="text-xs text-[#1a1a1a]/35 mt-1 leading-relaxed">Toca una dimensión para ver cómo afecta al examen y qué adaptaciones la mitigan.</p>
        </div>
        <div className="relative w-[84px] h-[84px] shrink-0 hm-head-ring">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#00000008" strokeWidth="7" />
            <circle
              className="hm-prog"
              cx="40" cy="40" r="34" fill="none"
              stroke={colorPromedio}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={visible ? CIRC * (1 - promedio / 100) : CIRC}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums font-mono-score text-[#1a1a1a] leading-none">
              {visible ? <CountUp target={promedio} start={visible} /> : 0}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#1a1a1a]/30 mt-0.5">afectación</span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {DIMENSIONES.map((dim, i) => {
          const v = valores[i];
          const c = heatColor(v / 100);
          const sel = seleccion === i;
          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => setSeleccion(sel ? null : i)}
              style={{ '--d': `${120 + i * 45}ms` }}
              aria-pressed={sel}
              className={`hm-cell relative text-left rounded-2xl p-3.5 cursor-pointer active:scale-[0.97] ${sel ? 'ring-2 ring-offset-2 ring-offset-white' : ''}`}
            >
              <span className={`absolute inset-0 rounded-2xl`} style={{ backgroundColor: `${c}14`, border: sel ? `1.5px solid ${c}` : `1px solid ${c}26` }} />
              {sel && <span className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: `0 0 0 2px #fff inset` }} />}
              {/* Tooltip */}
              <span className="hm-tip hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-44 px-3 py-2 rounded-xl bg-[#1a1a1a] text-white text-[10px] leading-snug shadow-xl pointer-events-none origin-bottom">
                {nivelLabel(v)} · {Math.round(v / 25) || 1}/4
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
              </span>
              <span className="relative block">
                <span className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xl font-bold tabular-nums font-mono-score leading-none" style={{ color: c }}>
                    <CountUp target={v} start={visible} />
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
                </span>
                <span className="block text-[10.5px] font-semibold text-[#1a1a1a]/60 leading-tight pr-1">{dim.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* LEYENDA */}
      <div className="px-6 pb-5 flex items-center gap-3">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a1a1a]/25">Impacto</span>
        <div className="flex-1 max-w-[220px] h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})` }} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#1a1a1a]/25">Alto</span>
        <span className="ml-auto text-[9px] text-[#1a1a1a]/25 tabular-nums hidden sm:block">{perfilData.prevalence}</span>
      </div>

      {/* PANEL DETALLE */}
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)] ${dimSel ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="mx-6 mb-6 rounded-2xl bg-[#faf8f5] border border-black/[0.04] p-5">
            {dimSel && (
              <>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-lg font-bold tabular-nums font-mono-score" style={{ color: heatColor(valSel / 100) }}>{valSel}</span>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">{dimSel.label}</h4>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ color: heatColor(valSel / 100), backgroundColor: `${heatColor(valSel / 100)}14` }}>
                    {nivelLabel(valSel)}
                  </span>
                </div>
                <p className="text-xs text-[#1a1a1a]/50 leading-relaxed mb-4">{dimSel.desc}</p>
                {mitigaciones.length > 0 && (
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#1B3A32]/40 mb-2">Lo mitiga</p>
                    <div className="space-y-1.5">
                      {mitigaciones.map((m, i) => (
                        <div key={i} className="flex items-start gap-2" style={{ opacity: 0, animation: `form-fade-in 0.35s var(--ease-out) ${i * 80}ms forwards` }}>
                          <svg className="w-3.5 h-3.5 text-[#1B3A32] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          <span className="text-xs text-[#1a1a1a]/60 leading-relaxed">{m}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Link href={`/perfil/${slug}`} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1B3A32] hover:gap-2.5 transition-all duration-200">
                  Ver perfil completo
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
