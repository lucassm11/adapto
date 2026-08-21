'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const BENEFICIOS = [
  { titulo: 'Adaptaciones ilimitadas', desc: 'Audita tantos exámenes como necesites, sin contador mensual.', icono: 'M4.5 12.75l6 6 9-13.5' },
  { titulo: 'Los 16 perfiles NEAE completos', desc: 'TDAH, dislexia, TEA, discalculia, altas capacidades y todos los demás.', icono: 'M4.5 12.75l6 6 9-13.5' },
  { titulo: 'PDF completo sin marca de agua', desc: 'Descarga el informe listo para entregar o archivar.', icono: 'M4.5 12.75l6 6 9-13.5' },
  { titulo: 'Diagnosticador IA', desc: 'Sube un examen respondido y detecta patrones NEAE ocultos.', icono: 'M4.5 12.75l6 6 9-13.5' },
  { titulo: 'AdapBot con contexto total', desc: 'Tu asistente conoce el perfil, el curso y el resultado de cada auditoría.', icono: 'M4.5 12.75l6 6 9-13.5' },
];

const FAQ = [
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Cancelas desde tu cuenta de Stripe en un clic y conservas Pro hasta el final del periodo facturado.' },
  { q: '¿Cómo se activa Pro después del pago?', a: 'La activación es automática al terminar el pago. Si vuelves a la web y no lo ves activo, recarga la página.' },
  { q: '¿Qué pasa con mis adaptaciones gratis?', a: 'Nada: tus informes anteriores se mantienen y a partir de ahora generas ilimitadas sin marca de agua.' },
];

export default function PreciosPage() {
  const { user, plan, loading: authLoading, refreshPlan } = useAuth();
  const router = useRouter();
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [cancelado, setCancelado] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);
  const rootRef = useRef(null);

  useEffect(() => {
    rootRef.current?.classList.add('sr-in');
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelado')) setCancelado(true);
    const sessionId = params.get('session_id');
    if (params.get('exito') && sessionId) {
      setVerificando(true);
      fetch(`/api/verificar-sesion?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.activo) {
            setPagoConfirmado(true);
            refreshPlan();
          }
        })
        .catch(() => {})
        .finally(() => setVerificando(false));
    }
  }, []);

  const pasarAPro = async () => {
    setErrorPago(null);
    if (!user) {
      router.push('/login');
      return;
    }
    if (plan === 'pro') {
      router.push('/auditor-dua');
      return;
    }
    setPagando(true);
    try {
      const res = await fetch('/api/crear-sesion-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorPago(data.error || 'No se pudo iniciar el pago.');
        setPagando(false);
      }
    } catch {
      setErrorPago('Error de conexion. Intenta de nuevo.');
      setPagando(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-[3px] border-[#1B3A32]/15 border-t-[#1B3A32] rounded-full animate-spin" />
          <p className="text-sm text-[#1a1a1a]/40">Confirmando tu pago...</p>
        </div>
      </div>
    );
  }

  if (pagoConfirmado) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 overflow-hidden relative">
        <style jsx global>{`
          @keyframes ring-expand { from { transform: scale(0.6); opacity: 0.5; } to { transform: scale(2.2); opacity: 0; } }
          @keyframes check-pop { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
          @keyframes confetti-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        `}</style>
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-sm pointer-events-none"
            style={{
              left: `${6 + i * 6.7}%`,
              top: 0,
              backgroundColor: i % 3 === 0 ? '#e3a23c' : i % 3 === 1 ? '#1B3A32' : '#c43e3e',
              animation: `confetti-fall ${2.4 + (i % 5) * 0.5}s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.18}s forwards`,
              opacity: 0,
            }}
          />
        ))}
        <div className="relative text-center max-w-md">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <span className="absolute inset-0 rounded-full bg-emerald-400/20" style={{ animation: 'ring-expand 1.4s var(--ease-out) 0.3s forwards', opacity: 0 }} />
            <span className="absolute inset-0 rounded-full bg-emerald-400/20" style={{ animation: 'ring-expand 1.4s var(--ease-out) 0.7s forwards', opacity: 0 }} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30" style={{ animation: 'check-pop 0.7s var(--ease-spring) 0.2s both' }}>
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.75l6 6 9-13.5" strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'check-draw 0.6s var(--ease-out) 0.6s forwards' }} /></svg>
            </div>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-[#1a1a1a] mb-3">Ya eres Pro</h1>
          <p className="text-[#1a1a1a]/45 mb-8 leading-relaxed">Tu pago se ha procesado correctamente. Disfruta de adaptaciones ilimitadas, los 16 perfiles NEAE y PDFs sin marca de agua.</p>
          <Link href="/auditor-dua" className="inline-flex items-center gap-2 bg-[#1B3A32] text-white font-semibold rounded-full px-8 py-3.5 hover:bg-[#24493f] hover:-translate-y-0.5 transition-all duration-300 text-sm shadow-lg shadow-[#1B3A32]/20">
            Ir al auditor
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    );
  }

  const esPro = plan === 'pro';

  return (
    <div ref={rootRef} className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] relative overflow-hidden">
      <style jsx global>{`
        @keyframes aurora-a { 0% { transform: translate(-12%, -8%) scale(1); } 50% { transform: translate(10%, 6%) scale(1.25); } 100% { transform: translate(-6%, 10%) scale(0.95); } }
        @keyframes aurora-b { 0% { transform: translate(10%, 12%) scale(1.1); } 50% { transform: translate(-14%, -4%) scale(0.9); } 100% { transform: translate(6%, -12%) scale(1.2); } }
        @keyframes card-shine { 0% { left: -60%; } 100% { left: 130%; } }
        @keyframes price-pop { 0% { opacity: 0; transform: translateY(16px) scale(0.92); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes float-y { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>

      {/* AURORA BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full opacity-[0.13]" style={{ background: 'radial-gradient(circle, #1B3A32 0%, transparent 65%)', animation: 'aurora-a 22s ease-in-out infinite alternate' }} />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full opacity-[0.11]" style={{ background: 'radial-gradient(circle, #e3a23c 0%, transparent 65%)', animation: 'aurora-b 26s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #c43e3e 0%, transparent 65%)', animation: 'aurora-a 30s ease-in-out infinite alternate-reverse' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        {cancelado && (
          <div className="mb-8 max-w-md mx-auto flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800" style={{ opacity: 0, animation: 'form-fade-in 0.4s var(--ease-out) forwards' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            Pago cancelado. No se ha cobrado nada — puedes intentarlo cuando quieras.
            <button onClick={() => setCancelado(false)} className="ml-auto text-amber-600 hover:text-amber-900 cursor-pointer shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: pitch */}
          <div>
            <div className="anim-c inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase rounded-full px-3 py-1.5 bg-gold/[0.12] text-[#9a6b1a] border border-gold/25 mb-6">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 14.24l-4.8 2.52.92-5.34-3.88-3.78 5.36-.78L12 2z" /></svg>
              Adapto Pro
            </div>
            <h1 className="anim-c d1 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] mb-5">
              Desbloquea todo<br />el potencial de <span className="text-[#1B3A32]">Adapto</span>
            </h1>
            <p className="anim-c d2 text-lg text-[#1a1a1a]/45 leading-relaxed mb-9 max-w-md">
              Un solo plan. Todo incluido. Diseñado para orientadores y docentes que adaptan exámenes cada semana.
            </p>
            <ul className="space-y-4">
              {BENEFICIOS.map((b, i) => (
                <li key={b.titulo} className={`anim-a d${i + 3} flex items-start gap-3.5`}>
                  <span className="w-8 h-8 rounded-xl bg-[#1B3A32]/[0.07] border border-[#1B3A32]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#1B3A32]" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={b.icono} /></svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{b.titulo}</span>
                    <span className="block text-xs text-[#1a1a1a]/40 mt-0.5 leading-relaxed">{b.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: pricing card */}
          <div className="anim-b d2 relative">
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-[#1B3A32] via-[#2d6b5a] to-gold opacity-20 blur-lg" aria-hidden />
            <div className="group relative bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/[0.08] p-8 md:p-10 overflow-hidden transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-1">
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#1B3A32]/[0.04] to-transparent skew-x-[-18deg]" style={{ animation: 'card-shine 1.4s var(--ease-out)' }} />
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/35">Plan Pro</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Pago seguro Stripe
                </span>
              </div>

              <div className="flex items-end gap-2 mb-1" style={{ animation: 'price-pop 0.7s var(--ease-spring) 0.25s both' }}>
                <span className="font-display text-6xl tracking-tight leading-none">35€</span>
                <span className="text-[#1a1a1a]/35 text-sm mb-1.5">/ mes</span>
              </div>
              <p className="text-xs text-[#1a1a1a]/35 mb-8">IVA incluido · Cancela cuando quieras</p>

              <ul className="space-y-3 mb-8">
                {['Adaptaciones ilimitadas', '16 perfiles NEAE completos', 'Informe PDF sin marca de agua', 'Diagnosticador IA de patrones', 'AdapBot con contexto completo'].map((f, i) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#1a1a1a]/70" style={{ opacity: 0, animation: `form-fade-in 0.45s var(--ease-out) ${0.35 + i * 0.08}s forwards` }}>
                    <span className="w-5 h-5 rounded-full bg-[#1B3A32] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {esPro ? (
                <div className="space-y-3">
                  <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-2xl px-6 py-4 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Ya tienes el plan Pro activo
                  </div>
                  <Link href="/auditor-dua" className="block w-full text-center bg-[#faf8f5] text-[#1a1a1a]/60 font-semibold rounded-2xl px-6 py-3.5 hover:bg-[#f0ede8] transition-colors text-sm border border-black/[0.05]">
                    Ir al auditor
                  </Link>
                </div>
              ) : (
                <button
                  onClick={pasarAPro}
                  disabled={pagando || authLoading}
                  className="group/btn relative w-full overflow-hidden bg-[#1B3A32] text-white font-semibold rounded-2xl px-6 py-4 text-sm hover:bg-[#24493f] hover:shadow-xl hover:shadow-[#1B3A32]/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />
                  {pagando ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirigiendo a Stripe...
                    </span>
                  ) : authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cargando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {user ? 'Pasar a Pro ahora' : 'Inicia sesion para pasar a Pro'}
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                  )}
                </button>
              )}

              {errorPago && (
                <p className="mt-3 text-xs text-red-600 text-center" style={{ animation: 'form-fade-in 0.3s var(--ease-out)' }}>{errorPago}</p>
              )}

              <div className="mt-6 pt-5 border-t border-black/[0.05] flex items-center justify-center gap-5 text-[11px] text-[#1a1a1a]/35">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  Pago cifrado
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                  Cancela cuando quieras
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#1a1a1a]/30" style={{ animation: 'float-y 4s ease-in-out infinite' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></svg>
              Activacion instantanea tras el pago
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="anim-b font-display text-2xl tracking-tight text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className={`anim-g d${i + 1} bg-white rounded-2xl border border-black/[0.05] overflow-hidden`}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#faf8f5] transition-colors">
                  {f.q}
                  <svg className={`w-4 h-4 text-[#1a1a1a]/30 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)] ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-[#1a1a1a]/45 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
