'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import AdapBot from './components/AdapBot';
import { useLocale } from '@/contexts/LocaleContext';

/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════ */

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   MAGNETIC BUTTON
   ═══════════════════════════════════════════════════ */

function MagneticButton({ children, className = '' }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  return (
    <span
      ref={ref}
      className={`mag-btn inline-block ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   TILT CARD (3D hover)
   ═══════════════════════════════════════════════════ */

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    el.style.boxShadow = `${-x * 12}px ${y * 12}px 40px rgba(0,0,0,0.08)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = '';
      ref.current.style.boxShadow = '';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COUNT UP (cubic ease-out)
   ═══════════════════════════════════════════════════ */

function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return <span ref={ref}>{count.toLocaleString('es-ES')}</span>;
}

/* ═══════════════════════════════════════════════════
   FLOATING TAG
   ═══════════════════════════════════════════════════ */

function FloatingTag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase rounded-full px-3 py-1.5 ${className}`}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   MORPH CARD — SIGNATURE ELEMENT
   Toggles between original exam text and adapted
   text every 4.5s with scanning line effect.
   ═══════════════════════════════════════════════════ */

function MorphCard() {
  const [morphed, setMorphed] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setMorphed((m) => !m);
      setScanKey((k) => k + 1);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/[0.06] border border-black/[0.04] overflow-hidden">
      {/* Scanning line */}
      {morphed && (
        <div
          key={scanKey}
          className="morph-scan-line"
          style={{ animation: 'morph-scan 1.2s var(--ease-out) forwards' }}
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Resultado del analisis</p>
          <p className="text-sm text-ink/70 mt-0.5">3a Primaria - Lengua</p>
        </div>
        <div className="inline-flex items-center gap-1 bg-pine/[0.06] text-pine text-xs font-semibold px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          APROBADO
        </div>
      </div>

      {/* Score + Bar */}
      <div className="px-6 py-6 flex items-center gap-6">
        <div className="relative">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0f0f0" strokeWidth="2.5" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1b3a32" strokeWidth="2.5" strokeDasharray="82, 100" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-score text-2xl font-bold text-ink">82</span>
            <span className="text-[9px] text-ink/40 font-medium">/100</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink/50">Adaptaciones</span>
            <span className="font-semibold text-ink">12 aplicadas</span>
          </div>
          <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
            <div className="h-full bg-pine rounded-full" style={{ width: '82%' }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink/50">Criterios LOMLOE</span>
            <span className="font-semibold text-pine">9/10 conformes</span>
          </div>
        </div>
      </div>

      {/* Morphing Question Area */}
      <div className="px-6 pb-6">
        <div className="bg-pine/[0.04] rounded-xl p-4 border border-pine/10 relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-pine mb-2">Pregunta adaptada</p>

          {/* Original text */}
          <p
            className="text-sm text-ink/80 leading-relaxed"
            style={{
              opacity: morphed ? 0 : 1,
              transform: morphed ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)',
              position: morphed ? 'absolute' : 'relative',
            }}
          >
            Completa la siguiente tabla de conjugacion del verbo &quot;haber&quot; en todos sus tiempos verbales.
          </p>

          {/* Adapted text */}
          <p
            className="text-sm text-ink/80 leading-relaxed"
            style={{
              opacity: morphed ? 1 : 0,
              transform: morphed ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.5s var(--ease-out) 0.15s, transform 0.5s var(--ease-out) 0.15s',
              position: morphed ? 'relative' : 'absolute',
              top: morphed ? 0 : '100%',
            }}
          >
            Completa la tabla de conjugacion del verbo <strong>&quot;haber&quot;</strong>. Solo los tiempos:{' '}
            <span className="bg-pine/10 text-pine font-semibold px-1.5 py-0.5 rounded">Presente</span>{' '}
            <span className="bg-pine/10 text-pine font-semibold px-1.5 py-0.5 rounded">Preterito</span>{' '}
            <span className="bg-pine/10 text-pine font-semibold px-1.5 py-0.5 rounded">Futuro</span>
          </p>

          {/* Keyword Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['he', 'has', 'ha', 'habia', 'habre'].map((w, i) => (
              <span
                key={w}
                className="text-[10px] bg-navy/[0.06] text-navy border border-navy/10 rounded-full px-2.5 py-0.5 font-medium"
                style={{
                  opacity: morphed ? 1 : 0,
                  transform: morphed ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.8)',
                  transition: `opacity 0.35s var(--ease-out) ${0.4 + i * 0.08}s, transform 0.35s var(--ease-spring) ${0.4 + i * 0.08}s`,
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FAQS DATA
   ═══════════════════════════════════════════════════ */

const FAQS = [
  { q: 'Como funciona exactamente?', a: 'Subes el examen como imagen, PDF o texto. Seleccionas el perfil del alumno (TDAH, dislexia, etc.) y Adapto reescribe las preguntas con adaptaciones reales: bancos de palabras, consignas simplificadas, tiempos reducidos y pistas visuales.' },
  { q: 'Las adaptaciones son validas para inspeccion?', a: 'Si. Adapto sigue el marco DUA, los criterios LOMLOE y las NEAE del BOE. El dictamen genera un informe con la puntuacion DUA (0-100), el analisis por principios y una hoja de apoyos descargable en PDF.' },
  { q: 'Necesito saber de educacion para usarlo?', a: 'Para nada. Solo indicas el curso, la materia y el tipo de necesidad. Adapto se encarga del resto usando IA entrenada con normativa educativa espanola vigente.' },
  { q: 'Que formatos puedo subir?', a: 'PDF, imagen (JPG/PNG) o texto directo. Puedes pegar el examen completo o subir una foto con el movil.' },
  { q: 'Hay version gratis?', a: 'Si. Puedes adaptar hasta 3 examenes gratis con marca de agua en el PDF. Sin registro, sin tarjeta.' },
];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const sectionsRef = useRef([]);
  const { locale, t } = useLocale();

  const addSectionRef = useCallback((el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  }, []);

  /* Section entrance observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    sectionsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink overflow-hidden selection:bg-pine selection:text-white">
      <ScrollProgress />

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pine to-pine-light flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20L12 4L20 20" />
                <path d="M7.5 14H16.5" />
              </svg>
            </div>
            <span className="flex items-baseline">
              <span className="font-display text-3xl text-ink tracking-tight">adap</span>
              <span className="font-display text-3xl text-pine tracking-tight">to</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: t.nav.comoFunciona, href: '#como-funciona' },
              { label: t.nav.diagnosticador, href: '/diagnosticador' },
              { label: t.nav.perfiles, href: '#perfiles' },
              { label: 'Resultado', href: '#resultado' },
              { label: t.nav.precios, href: '#precios' },
            ].map((s) => (
              s.href.startsWith('/') ? (
                <Link key={s.label} href={s.href} className="nav-link text-sm text-ink/50 hover:text-ink px-4 py-2 rounded-full transition-colors duration-300">{s.label}</Link>
              ) : (
                <a key={s.label} href={s.href} className="nav-link text-sm text-ink/50 hover:text-ink px-4 py-2 rounded-full transition-colors duration-300">{s.label}</a>
              )
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-ink/60 hover:text-ink px-4 py-2 transition-colors hidden sm:block">{t.nav.login}</Link>
            <MagneticButton>
              <Link href="/auditor-dua" className="btn-press text-sm font-semibold bg-pine text-white rounded-full px-5 py-2.5 hover:bg-pine-light hover:shadow-lg hover:shadow-pine/20 transition-all duration-300 block">
                {t.hero.cta}
              </Link>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-40 pb-32 md:pt-52 md:pb-44 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="hero-anim hero-delay-1 font-display text-[3.5rem] md:text-[5.5rem] leading-[0.95] tracking-tight mb-8">
              <span className="text-ink">{t.hero.title1}</span><br />
              <span className="text-ink">{t.hero.titleHighlight}</span>
              <span className="text-pine">{t.hero.title2}</span>
            </h1>
            <p className="hero-anim hero-delay-2 text-xl md:text-2xl text-ink/60 max-w-2xl leading-relaxed mb-12">
              {t.hero.subtitle}
            </p>
            <div className="hero-anim hero-delay-3 flex flex-wrap items-center gap-4 mb-12">
              <MagneticButton>
                <Link href="/auditor-dua" className="btn-press group inline-flex items-center gap-3 bg-pine text-white font-semibold rounded-full px-8 py-4 hover:bg-pine-light hover:shadow-xl hover:shadow-pine/20 transition-colors duration-200 text-base">
                  {t.hero.cta}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </MagneticButton>
              <a href="#como-funciona" className="btn-press inline-flex items-center gap-2 text-ink/60 hover:text-ink font-medium px-6 py-4 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Morph Card (SIGNATURE) */}
          <div className="hero-anim hero-delay-4 hidden lg:block absolute top-32 right-0 w-[480px]">
            <MorphCard />
          </div>
        </div>
      </section>

      {/* ═══════════════ LOGOS / BADGES (anim-b scale) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden border-y border-black/[0.04] bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="anim-b d0 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink/25 mb-8">{t.badges.title}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { label: 'DUA', full: 'Diseno Universal para el Aprendizaje' },
              { label: 'NEAE', full: 'Necesidades Especificas de Apoyo Educativo' },
              { label: 'LOMLOE', full: 'Ley Organica 3/2020' },
              { label: 'B.O.E.', full: 'Boletin Oficial del Estado' },
            ].map((n, i) => (
              <div key={n.label} className={`anim-b d${i + 1} flex items-center gap-3 group cursor-default`}>
                <div className="w-10 h-10 rounded-xl bg-pine/[0.05] border border-pine/10 flex items-center justify-center group-hover:bg-pine/[0.1] transition-colors">
                  <span className="font-mono text-xs font-bold text-pine/60">{n.label.slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink/60">{n.label}</p>
                  <p className="text-[10px] text-ink/30">{n.full}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS (anim-a fade-up) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 10000, suffix: '+', label: t.stats.exams, color: 'text-pine' },
              { value: 94, suffix: '%', label: t.stats.approved, color: 'text-pine' },
              { value: 3, suffix: 's', label: t.stats.time, color: 'text-red-pen' },
              { value: 15, suffix: '+', label: t.stats.profiles, color: 'text-navy' },
            ].map((m, i) => (
              <div key={m.label} className={`anim-a d${i} text-center group`}>
                <div className={`font-mono-score text-4xl md:text-5xl font-bold ${m.color} transition-transform duration-300 group-hover:scale-110`}>
                  <CountUp target={m.value} />{m.suffix}
                </div>
                <p className="text-sm text-ink/50 mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ COMO FUNCIONA (anim-c/anim-d alternating) ═══════════════ */}
      <section ref={addSectionRef} id="como-funciona" className="sr-hidden relative py-20 md:py-28">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20">
            <div>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
                {t.comoFunciona.title.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </h2>
            </div>
            <p className="text-ink/60 text-lg max-w-sm mt-4 md:mt-0">
              {t.comoFunciona.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-pine/20 via-gold/20 to-pine/20" />
            {[
              { num: '01', color: 'from-pine/10 to-pine/[0.02]', borderColor: 'border-pine/20', iconColor: 'text-pine', iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z', title: t.comoFunciona.step1Title, desc: t.comoFunciona.step1Desc },
              { num: '02', color: 'bg-gold/10 to-gold/[0.02]', borderColor: 'border-gold/20', iconColor: 'text-gold', iconPath: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5', title: t.comoFunciona.step2Title, desc: t.comoFunciona.step2Desc },
              { num: '03', color: 'from-pine/10 to-pine/[0.02]', borderColor: 'border-navy/20', iconColor: 'text-pine', iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: t.comoFunciona.step3Title, desc: t.comoFunciona.step3Desc },
            ].map((step, i) => (
              <div key={step.num} className={`${i % 2 === 0 ? 'anim-c' : 'anim-d'} d${i + 1} group relative bg-gradient-to-b ${step.color} rounded-2xl border ${step.borderColor} p-8 hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-500 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-white border ${step.borderColor} flex items-center justify-center mb-6 ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={step.iconPath} /></svg>
                </div>
                <span className="font-mono text-xs text-ink/25 tracking-widest">{step.num}</span>
                <h3 className="font-display text-xl text-ink mt-2 mb-3">{step.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DIAGNOSTICADOR IA (anim-c left, anim-d right) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden relative py-28 md:py-36 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="anim-c">
              <FloatingTag className="bg-red-pen/[0.06] text-red-pen border border-red-pen/10 mb-6">{t.diagLanding.badge}</FloatingTag>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-6">{t.diagLanding.title}</h2>
              <p className="text-ink/60 text-lg leading-relaxed mb-6">{t.diagLanding.desc1}</p>
              <p className="text-ink/60 text-lg leading-relaxed mb-8">{t.diagLanding.desc2}</p>
              <ul className="space-y-3 mb-8">
                {t.diagLanding.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink/60">
                    <svg className="w-4 h-4 text-pine shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <MagneticButton>
                <Link href="/diagnosticador" className="btn-press inline-flex items-center gap-2 bg-red-pen text-white font-semibold rounded-full px-7 py-3.5 hover:bg-red-pen-dark hover:shadow-lg hover:shadow-red-pen/20 transition-colors duration-200 text-sm">
                  {t.diagLanding.cta}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </MagneticButton>
            </div>
            {/* PREVIEW CARD */}
            <div className="anim-d">
              <div className="card-lift relative bg-white rounded-2xl shadow-2xl shadow-black/[0.06] border border-black/[0.04] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/[0.04] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pine/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pine" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a6 6 0 0 1-4.49 2.03h-.04a6 6 0 0 1-4.49-2.03L5 14.5m14 0H5" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">Resultado del diagnosticador</p>
                    <p className="text-[10px] text-ink/50">3 hipotesis identificadas</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { name: 'TDAH con deficit de atencion', pct: 87, color: '#1B3A32' },
                    { name: 'Dislexia evolutiva', pct: 34, color: '#92400e' },
                    { name: 'Ansiedad ante la evaluacion', pct: 21, color: '#c43e3e' },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-4">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke={d.color} strokeWidth="3" strokeDasharray={`${d.pct * 0.88} 88`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold font-mono-score" style={{ color: d.color }}>{d.pct}%</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">{d.name}</p>
                        <div className="mt-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ RESULTADO ANTES/DESPUES ═══════════════ */}
      <section ref={addSectionRef} id="resultado" className="sr-hidden relative py-28 md:py-40" style={{ scrollMarginTop: '80px' }}>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4">{t.resultado.title}</h2>
            <p className="text-ink/50 text-lg max-w-xl mx-auto">{t.resultado.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* ORIGINAL */}
            <div className="anim-c rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="px-6 py-4 bg-paper border-b border-black/[0.04] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/40">{t.resultado.original}</span>
                <span className="text-xs text-ink/40">{t.resultado.noAdapted}</span>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { n: 'P1', text: 'Completa la siguiente tabla de conjugacion del verbo "haber" en todos sus tiempos verbales.', complex: 8 },
                  { n: 'P2', text: 'Escribe un parrafo de al menos 10 oraciones sobre las consecuencias de la contaminacion en los ecosistemas acuaticos.', complex: 7 },
                  { n: 'P3', text: 'Analiza criticamente el siguiente texto argumentativo e identifica las premisas, el argumento principal y la conclusion del autor.', complex: 9 },
                  { n: 'P4', text: 'Compara y contrasta los conceptos de democracia representativa y democracia directa, proporcionando al menos tres ejemplos historicos de cada una.', complex: 9 },
                ].map((q) => (
                  <div key={q.n} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-ink/25 mt-1 shrink-0">{q.n}</span>
                      <p className="text-sm text-ink/60 leading-relaxed">{q.text}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-7">
                      <span className="text-[9px] text-ink/25 font-medium">{t.resultado.complexity}</span>
                      <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-red-pen/30 rounded-full" style={{ width: `${q.complex * 10}%` }} />
                      </div>
                      <span className="text-[10px] font-mono-score font-bold text-ink/25">{q.complex}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADAPTADO (staggered entrance) */}
            <div className="anim-d rounded-2xl border-2 border-pine/20 overflow-hidden shadow-lg shadow-pine/[0.05]">
              <div className="px-6 py-4 bg-pine/[0.04] border-b border-pine/10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pine">{t.resultado.adapted}</span>
                <span className="text-xs text-pine/70 font-semibold">4 {t.resultado.questions}</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Q1 */}
                <div className="anim-a d1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pine bg-pine/[0.06] px-2 py-0.5 rounded-full border border-pine/10">Reduccion de carga cognitiva</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy bg-navy/[0.06] px-2 py-0.5 rounded-full border border-navy/10">DUA: Accion y expresion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-pine/60 mt-1 shrink-0">P1</span>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">Completa la tabla de conjugacion del verbo "haber". Solo: Presente, Preterito, Futuro.</p>
                  </div>
                  <div className="ml-7 rounded-lg bg-gold/[0.04] border border-gold/20 p-2.5">
                    <p className="text-[11px] text-gold/80 leading-relaxed"><span className="font-semibold">{t.resultado.justification}</span> Se reduce de 6 tiempos a 3 para disminuir la sobrecarga de memoria de trabajo.</p>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-[9px] text-ink/25 font-medium">{t.resultado.complexity}</span>
                    <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden"><div className="h-full bg-pine/40 rounded-full" style={{ width: '40%' }} /></div>
                    <span className="text-[10px] font-mono-score font-bold text-pine/50">4/10</span>
                  </div>
                </div>
                {/* Q2 */}
                <div className="anim-a d2 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pine bg-pine/[0.06] px-2 py-0.5 rounded-full border border-pine/10">Reduccion de carga cognitiva</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy bg-navy/[0.06] px-2 py-0.5 rounded-full border border-navy/10">DUA: Representacion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-pine/60 mt-1 shrink-0">P2</span>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">Escribe 5 oraciones sobre la contaminacion. Usa estas palabras: contaminacion, agua, reciclar, planeta.</p>
                  </div>
                  <div className="ml-7 rounded-lg bg-gold/[0.04] border border-gold/20 p-2.5">
                    <p className="text-[11px] text-gold/80 leading-relaxed"><span className="font-semibold">{t.resultado.justification}</span> Se reduce de 10 a 5 oraciones y se dan palabras clave para reducir la carga de planificacion.</p>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-[9px] text-ink/25 font-medium">{t.resultado.complexity}</span>
                    <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden"><div className="h-full bg-pine/40 rounded-full" style={{ width: '35%' }} /></div>
                    <span className="text-[10px] font-mono-score font-bold text-pine/50">3.5/10</span>
                  </div>
                </div>
                {/* Q3 */}
                <div className="anim-a d3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pine bg-pine/[0.06] px-2 py-0.5 rounded-full border border-pine/10">Simplificacion lexica</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy bg-navy/[0.06] px-2 py-0.5 rounded-full border border-navy/10">DUA: Representacion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-pine/60 mt-1 shrink-0">P3</span>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">Lee el texto. Subraya la conclusion del autor.</p>
                  </div>
                  <div className="ml-7 rounded-lg bg-gold/[0.04] border border-gold/20 p-2.5">
                    <p className="text-[11px] text-gold/80 leading-relaxed"><span className="font-semibold">{t.resultado.justification}</span> Se elimina la tarea de analisis multiple y se centra en una sola accion concreta.</p>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-[9px] text-ink/25 font-medium">{t.resultado.complexity}</span>
                    <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden"><div className="h-full bg-pine/40 rounded-full" style={{ width: '30%' }} /></div>
                    <span className="text-[10px] font-mono-score font-bold text-pine/50">3/10</span>
                  </div>
                </div>
                {/* Q4 */}
                <div className="anim-a d4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pine bg-pine/[0.06] px-2 py-0.5 rounded-full border border-pine/10">Andamiaje de instrucciones</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy bg-navy/[0.06] px-2 py-0.5 rounded-full border border-navy/10">DUA: Accion y expresion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-pine/60 mt-1 shrink-0">P4</span>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">Elige: democracia representativa o directa? Escribe por que con 2 razones.</p>
                  </div>
                  <div className="ml-7 rounded-lg bg-pine/[0.03] border border-pine/[0.08] p-2.5">
                    <p className="text-[11px] text-pine/60 leading-relaxed"><span className="font-semibold">{t.resultado.classroomTip}</span> Permite que el alumno elija el formato: lista, dibujo o oraciones.</p>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <span className="text-[9px] text-ink/25 font-medium">{t.resultado.complexity}</span>
                    <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden"><div className="h-full bg-pine/40 rounded-full" style={{ width: '40%' }} /></div>
                    <span className="text-[10px] font-mono-score font-bold text-pine/50">4/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIOS (anim-e rotate) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden py-28 md:py-36 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink">{t.testimonios.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Maria L.', role: 'Prof. Primaria, Madrid', initials: 'ML', color: 'bg-pine', text: 'Pasaba 2 horas adaptando cada examen. Ahora lo tengo en 30 segundos. El dictamen psicopedagogico que genera es de un nivel que yo no alcanzaba.' },
              { name: 'Carlos R.', role: 'Prof. Secundaria, Sevilla', initials: 'CR', color: 'bg-red-pen', text: 'Lo uso con mis alumnos de TDAH. Las adaptaciones incluyen justificaciones, criterios DUA y consejos de aula. No es un simple acortador de texto.' },
              { name: 'Ana S.', role: 'Orientadora, Barcelona', initials: 'AS', color: 'bg-navy', text: 'El informe DUA que genera es impresionante. Lo presento en las reuniones de equipo y la inspeccion lo valida sin problemas.' },
            ].map((t, i) => (
              <div key={t.name} className={`anim-e d${i + 1} card-lift bg-paper rounded-2xl border border-black/[0.04] p-7 transition-all duration-500`}>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-ink/60 leading-relaxed mb-6">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-black/[0.04]">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-[10px] text-white font-bold`}>{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PERFILES ═══════════════ */}
      <section ref={addSectionRef} id="perfiles" className="sr-hidden relative py-28 md:py-36">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4">{t.perfilesLanding.title}</h2>
            <p className="text-ink/50 text-lg max-w-xl mx-auto">{t.perfilesLanding.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slug: 'tdah-atencion', name: 'TDAH Inatento', group: 'Neurodesarrollo', desc: 'Déficit de atención sostenida y fatiga cognitiva.', color: '#1B3A32', anim: 'anim-a' },
              { slug: 'tdah-hiperactivo', name: 'TDAH Hiperactivo', group: 'Neurodesarrollo', desc: 'Impulsividad, inquietud motora y dificultad de autocontrol.', color: '#1B3A32', anim: 'anim-b' },
              { slug: 'tdah-combinado', name: 'TDAH Combinado', group: 'Neurodesarrollo', desc: 'Inatención + hiperactividad en grado significativo.', color: '#1B3A32', anim: 'anim-c' },
              { slug: 'dislexia', name: 'Dislexia', group: 'Neurodesarrollo', desc: 'Dificultad en la lectura: velocidad, precisión y comprensión.', color: '#1B3A32', anim: 'anim-d' },
              { slug: 'disgrafia', name: 'Disgrafía', group: 'Neurodesarrollo', desc: 'Dificultades en la escritura: legibilidad, velocidad y grafía.', color: '#1B3A32', anim: 'anim-a' },
              { slug: 'discalculia', name: 'Discalculia', group: 'Neurodesarrollo', desc: 'Dificultad con el razonamiento numérico y las operaciones.', color: '#1B3A32', anim: 'anim-b' },
              { slug: 'tdl', name: 'TEL / TDL', group: 'Neurodesarrollo', desc: 'Trastorno del Desarrollo del Lenguaje expresivo y receptivo.', color: '#2f4468', anim: 'anim-c' },
              { slug: 'dcd', name: 'DCD', group: 'Neurodesarrollo', desc: 'Dificultades de coordinación motriz y grafomotricidad.', color: '#2f4468', anim: 'anim-d' },
              { slug: 'dificultades-aprendizaje', name: 'Dificultades de Aprendizaje', group: 'Aprendizaje', desc: 'Lectura facilitada y apoyos visuales generalizados.', color: '#e3a23c', anim: 'anim-a' },
              { slug: 'memoria-trabajo', name: 'Memoria de Trabajo', group: 'Aprendizaje', desc: 'Capacidad limitada para retener y manipular información.', color: '#e3a23c', anim: 'anim-b' },
              { slug: 'retraso-madurativo', name: 'Retraso Madurativo', group: 'Aprendizaje', desc: 'Maduración generalizada por debajo de la esperada.', color: '#e3a23c', anim: 'anim-c' },
              { slug: 'altas-capacidades', name: 'Altas Capacidades', group: 'Aprendizaje', desc: 'ACI con necesidad de enriquecimiento y ritmo acelerado.', color: '#e3a23c', anim: 'anim-d' },
              { slug: 'ansiedad', name: 'Ansiedad ante la Evaluación', group: 'Otros Perfiles', desc: 'Bloqueo emocional y performance reducida en exámenes.', color: '#c43e3e', anim: 'anim-a' },
              { slug: 'tea', name: 'TEA - Nivel 1', group: 'Otros Perfiles', desc: 'Trastorno del espectro autista con apoyos limitados.', color: '#c43e3e', anim: 'anim-b' },
              { slug: 'barreras-sensoriales', name: 'Barreras Sensoriales', group: 'Otros Perfiles', desc: 'Dificultades de audición o visión que afectan al acceso.', color: '#c43e3e', anim: 'anim-c' },
              { slug: 'multidiscapacidad', name: 'Multidiscapacidad', group: 'Otros Perfiles', desc: 'Plurideficiencia con adaptaciones complejas y combinadas.', color: '#c43e3e', anim: 'anim-d' },
            ].map((p, i) => (
              <TiltCard key={p.slug}>
                <Link href={`/perfil/${p.slug}`} className={`${p.anim} d${Math.min(i + 1, 14)} group relative block bg-white rounded-2xl overflow-hidden transition-all duration-300`}>
                  {/* Accent bar — slides in from left on hover */}
                  <div className="absolute top-0 left-0 h-full w-[3px] rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" style={{ backgroundColor: p.color }} />
                  {/* Glow blob — fades in on hover */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: p.color }} />
                  {/* Content */}
                  <div className="relative p-6 pl-7">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${p.color}90` }}>{p.group}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink leading-snug mb-1.5 group-hover:text-pine transition-colors duration-200">{p.name}</h3>
                    <p className="text-xs text-ink/45 leading-relaxed line-clamp-2 mb-4">{p.desc}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink/25 group-hover:text-pine transition-colors duration-200">
                      {t.perfilesLanding.viewProfile}
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/auditor-dua" className="inline-flex items-center gap-2 text-sm font-semibold text-pine hover:text-pine-light transition-colors group">
              {t.perfilesLanding.cta}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ (anim-c slide stagger) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink">{t.faqLanding.title}</h2>
          </div>
          <div className="space-y-3">
            {t.faqLanding.questions.map((faq, i) => (
              <div key={i} className={`anim-c d${i + 1} rounded-2xl border border-black/[0.06] overflow-hidden bg-white transition-all duration-300 hover:border-black/[0.1]`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="btn-press w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-display text-base text-ink pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-ink/40 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)] ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-ink/60 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRECIOS (anim-g bounce stagger) ═══════════════ */}
      <section ref={addSectionRef} id="precios" className="sr-hidden relative py-28 md:py-36 bg-white">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4">{t.preciosLanding.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* GRATUITO */}
            <div className="anim-g d1 card-lift bg-paper rounded-2xl border border-black/[0.06] p-8">
              <h3 className="font-display text-xl text-ink">{t.preciosLanding.free.name}</h3>
              <p className="text-sm text-ink/50 mt-1 mb-6">{t.preciosLanding.free.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-mono-score text-5xl font-bold text-ink">{t.preciosLanding.free.price}</span>
                <span className="text-ink/50 text-sm">{t.preciosLanding.free.currency}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.preciosLanding.free.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink/60">
                    <svg className="w-4 h-4 text-pine shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auditor-dua" className="btn-press block text-center border border-navy/20 text-pine hover:bg-pine hover:text-white font-semibold rounded-xl px-4 py-3 transition-colors duration-200 text-sm">{t.preciosLanding.free.cta}</Link>
            </div>
            {/* PRO */}
            <div className="anim-g d2 relative bg-pine text-white rounded-2xl p-8 shadow-2xl shadow-pine/20 scale-[1.03] md:scale-105">
              <span className="absolute -top-3.5 left-8 text-[10px] font-bold uppercase tracking-wider bg-gold text-ink rounded-full px-3 py-1">{t.preciosLanding.pro.badge}</span>
              <h3 className="font-display text-xl">{t.preciosLanding.pro.name}</h3>
              <p className="text-sm text-white/50 mt-1 mb-6">{t.preciosLanding.pro.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-mono-score text-5xl font-bold">{t.preciosLanding.pro.price}</span>
                <span className="text-white/40 text-sm">{t.preciosLanding.pro.currency}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.preciosLanding.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <svg className="w-4 h-4 text-pine/60 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/precios" className="btn-press block text-center bg-white text-pine hover:bg-white/90 font-semibold rounded-xl px-4 py-3 transition-colors duration-200 text-sm">Empezar con Pro</Link>
            </div>
            {/* CENTROS */}
            <div className="anim-g d3 card-lift bg-paper rounded-2xl border border-black/[0.06] p-8">
              <h3 className="font-display text-xl text-ink">{t.preciosLanding.centros.name}</h3>
              <p className="text-sm text-ink/50 mt-1 mb-6">{t.preciosLanding.centros.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-mono-score text-4xl font-bold text-ink">{t.preciosLanding.centros.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.preciosLanding.centros.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink/60">
                    <svg className="w-4 h-4 text-pine shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contacto" className="btn-press block text-center border border-navy/20 text-pine hover:bg-pine hover:text-white font-semibold rounded-xl px-4 py-3 transition-colors duration-200 text-sm">{t.preciosLanding.centros.cta}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA FINAL (anim-f + anim-b) ═══════════════ */}
      <section ref={addSectionRef} className="sr-hidden py-24 md:py-32 bg-pine">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="anim-f font-display text-4xl md:text-6xl text-white tracking-tight mb-6">
            {t.ctaFinal.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p className="anim-f d1 text-lg text-white/40 max-w-lg mx-auto mb-10">{t.ctaFinal.subtitle}</p>
          <MagneticButton>
            <Link href="/auditor-dua" className="anim-b d2 btn-press group inline-flex items-center gap-3 bg-white text-pine font-semibold rounded-full px-10 py-4 hover:shadow-2xl hover:shadow-white/20 transition-colors duration-200 text-base">
              {t.ctaFinal.cta}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-black/[0.04] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pine to-pine-light flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20L12 4L20 20" />
                    <path d="M7.5 14H16.5" />
                  </svg>
                </div>
                <span className="flex items-baseline">
                  <span className="font-display text-xl text-ink">adap</span>
                  <span className="font-display text-xl text-pine">to</span>
                </span>
              </div>
              <p className="text-xs text-ink/40 leading-relaxed">
                {t.footer.description}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-4">{t.footer.producto}</p>
              <ul className="space-y-2.5">
                {[t.nav.comoFunciona, t.nav.perfiles, t.nav.precios].map((s) => (
                  <li key={s}><a href={'#' + s.toLowerCase().replace(/ /g, '-')} className="text-sm text-ink/50 hover:text-ink/60 transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-4">{t.footer.legal}</p>
              <ul className="space-y-2.5">
                <li><Link href="/aviso-legal" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">Aviso legal</Link></li>
                <li><Link href="/politica-privacidad" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">Politica de privacidad</Link></li>
                <li><Link href="/politica-cookies" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">Politica de cookies</Link></li>
                <li><Link href="/terminos-condiciones" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">Terminos y condiciones</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-4">{t.footer.contactoLabel}</p>
              <ul className="space-y-2.5">
                <li><Link href="/contacto" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">{t.footer.formContact}</Link></li>
                <li><a href="mailto:hola@adapto.app" className="text-sm text-ink/50 hover:text-ink/60 transition-colors">hola@adapto.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-ink/25">&copy; {new Date().getFullYear()} Adapto. {t.footer.copyright}</span>
            <div className="flex items-center gap-4 text-xs text-ink/20">
              <span>Espana (UE)</span>
              <span className="w-1 h-1 rounded-full bg-ink/10" />
              <span>RGPD + LOPDGDD</span>
              <span className="w-1 h-1 rounded-full bg-ink/10" />
              <span>LSSI-CE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ADAPBOT FLOATING WIDGET */}
      <AdapBot floating esPro={false} />
    </div>
  );
}
