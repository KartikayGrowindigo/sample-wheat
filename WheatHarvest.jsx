/* ============================================================================
   WheatHarvest - Low-Carbon Wheat Programme
   Rabi Crop Season 2025-26 · Grow Indigo / ClearHarvest
   ----------------------------------------------------------------------------
   Content source: "LC Wheat Programme.docx" - restructured section-for-section
   to match that document's own table of contents (14 sections). Nothing in
   this file states a fact, figure or claim that isn't drawn directly from
   that document. Photographs and figures are the document's own field
   evidence, extracted from it directly; a small number of scanned farmer-diary
   / procurement-receipt images have had personally identifying fields
   (names, phone numbers, addresses, bank details) redacted before use.

   Design tokens, motion system and shared chrome are unchanged - only content
   and section structure were replaced, per the document restructure.
   ========================================================================== */

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  LayoutGroup,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { WheatFieldsMapBlock } from "./WheatHarvestMap.jsx";

/* ----------------------------------------------------------------------------
   PHOTO / MEDIA IMPORTS - LOW-CARBON WHEAT PROGRAMME DOCX ONLY
   Every image below was extracted directly from "LC Wheat Programme.docx" and
   lives in src/assets/wheat/docx/ and src/assets/wheat/brand/. Nothing here is
   a placeholder image.
---------------------------------------------------------------------------- */
import wheatPartnerLogo from "./src/assets/wheat/brand/gilogo1.png";
import wheatProgrammeLogo from "./src/assets/wheat/brand/chnlogo-fixed.png";

import monitoringApp1 from "./src/assets/wheat/docx/monitoring-app-1.jpeg";
import monitoringApp3 from "./src/assets/wheat/docx/monitoring-app-3.jpeg";
import monitoringApp4 from "./src/assets/wheat/docx/monitoring-app-4.jpeg";
import monitoringApp5 from "./src/assets/wheat/docx/mm5.jpeg";
import traceabilityFlow from "./src/assets/wheat/docx/trace.jpg";
import journeyQualityTest1 from "./src/assets/wheat/docx/journey-qtn-1.jpg";
import journeyQualityTest2 from "./src/assets/wheat/docx/journey-qtn-2.jpg";
import journeyFarmerDiary3 from "./src/assets/wheat/docx/journey-farmer-diary-3.png";
import journeyKickoff from "./src/assets/wheat/docx/pkow.jpeg";
import journeyKickoff2 from "./src/assets/wheat/docx/pkow2.jpg";
import journeyVlm1 from "./src/assets/wheat/docx/journey-02-vlm1-khasikalan.jpg";
import journeyVlm2 from "./src/assets/wheat/docx/journey-03-vlm2-kotkapura.jpeg";
import journeyVlm3 from "./src/assets/wheat/docx/journey-04-vlm3-bisafarm.jpeg";
import journeyVlm4 from "./src/assets/wheat/docx/journey-05-vlm4-aulakh.jpeg";
import journeyVlm5 from "./src/assets/wheat/docx/journey-06-vlm5-nurpurbet.jpeg";
import journeyVlm6 from "./src/assets/wheat/docx/journey-07-vlm6-dhanansu.jpeg";
import journeyVlm7 from "./src/assets/wheat/docx/journey-08-vlm7-stakeholder-ludhiana.jpeg";
import journeyVlm8 from "./src/assets/wheat/docx/journey-09-vlm8-group-field.jpeg";
import journeyVlm9 from "./src/assets/wheat/docx/journey-10-vlm9-group-field2.jpg";
import journeyLowCarbonWheat from "./src/assets/wheat/docx/journey-08-lowcarbon-wheat.jpeg";
import journeyLowCarbonWheat2 from "./src/assets/wheat/docx/lewp.jpg";
import journeyThirdPartyAudit from "./src/assets/wheat/docx/journey-09-thirdparty-audit.jpeg";
import journeyThirdPartyAudit2 from "./src/assets/wheat/docx/itpa.jpg";
import journeyQuantification1 from "./src/assets/wheat/docx/journey-quant-1.png";
import journeyQuantification2 from "./src/assets/wheat/docx/journey-quant-2.png";
import annexureVlm from "./src/assets/wheat/docx/annexure-01-vlm.jpeg";
import annexureZtField from "./src/assets/wheat/docx/annexure-02-zt-field.jpeg";
import annexureLandPrepSowing from "./src/assets/wheat/docx/annexure-land-prep-sowing.png";
import annexureWhatsapp from "./src/assets/wheat/docx/annexure-04-whatsapp.jpeg";
import annexureWhatsapp2 from "./src/assets/wheat/docx/annexure-whatsapp-2.png";
import annexureHarvest from "./src/assets/wheat/docx/annexure-05-harvest.jpeg";
import annexureHarvest2 from "./src/assets/wheat/docx/annexure-harvest-2.jpg";
import annexureGrains from "./src/assets/wheat/docx/annexure-06-grains.jpeg";
import annexureAudit from "./src/assets/wheat/docx/annexure-08-audit.jpeg";
import aboutGrowIndigoGraphic from "./src/assets/wheat/docx/about-grow-indigo.png";
import farmerVoice1 from "./src/assets/wheat/testimonials/voice-1.mov";
import farmerVoice2 from "./src/assets/wheat/testimonials/voice-2.mp4";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------------
   1 · DESIGN TOKENS - ported verbatim from ClearHarvest.jsx (the rice
   report), per the client's direction to match its palette exactly.
---------------------------------------------------------------------------- */
const C = {
  ink: "#0A1F16",
  inkSoft: "#12291F",
  field: "#0E5B33",
  leaf: "#4FA65B",
  water: "#1E88A8",
  waterDeep: "#12566B",
  husk: "#C98A2E",
  clay: "#8C5A3C",
  paper: "#EEF3EC",
  paperDim: "#DFE8DD",
  line: "#C3D3C1",
  mute: "#7A6A54",
};

const FONT_DISPLAY = "'Archivo', 'Helvetica Neue', Arial, sans-serif";
const FONT_BODY = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const FONT_DATA = "'Inter', 'Helvetica Neue', Arial, sans-serif";
/** Editorial serif italic, used sparingly for the report's few pull-quote
 *  moments - inspired by the ABC AR's handwritten-quote treatment,
 *  without literally copying its script face. */
const FONT_QUOTE = "'Fraunces', Georgia, 'Times New Roman', serif";

const EASE = [0.22, 0.61, 0.36, 1];
const GSAP_EASE = "power3.out";

/** PDF export mode - set by the Playwright export script via "?pdf=1" (or
 *  set manually in the URL for a quick preview). Anything that only exists
 *  for the interactive, on-screen experience and has no printed equivalent
 *  (the marquee ticker, the WebGL field map) is skipped entirely instead of
 *  merely hidden, and anything that is normally revealed by a click or a
 *  hover (the PMU/RBM/TBM accordion, a theme tile's highlight stat) starts
 *  already open/revealed so nothing behind an interaction is lost. */
const PDF_EXPORT =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("pdf") === "1";

function GlobalStyle() {
  return (
    <style>{`
      .wh-root { font-family: ${FONT_BODY}; background: ${C.paper}; color: ${C.ink};
        overflow-x: hidden; }
      .wh-display { font-family: ${FONT_DISPLAY}; letter-spacing: -0.03em; line-height: 0.98; }
      .wh-data { font-family: ${FONT_DATA}; font-variant-numeric: tabular-nums; }
      .wh-root p, .wh-root .wh-justify { text-align: justify; text-justify: inter-word; }

      .wh-mask { display: block; overflow: hidden; }
      .wh-scrub { will-change: transform; }

      .wh-root ::selection { background: ${C.husk}; color: #fff; }
      .wh-root :focus-visible { outline: 2px solid ${C.water}; outline-offset: 3px; border-radius: 2px; }
      .wh-scroll::-webkit-scrollbar { height: 6px; }
      .wh-scroll::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 99px; }

      .wh-grain { position: fixed; inset: 0; pointer-events: none; z-index: 60; opacity: .035;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E"); }

      .print-only { display: none !important; }

      /* Print / "Download PDF" - the report's scroll-triggered reveals leave
         anything below the fold at its hidden initial state (opacity 0,
         translated, pinned) since print never actually scrolls the page.
         These overrides force every section to its fully-revealed resting
         state and drop the fixed/decorative chrome that doesn't belong on
         a printed page. */
      @media print {
        @page { size: A4 portrait; margin: 8mm; }
        html, body { margin: 0 !important; background: ${C.paper} !important; }
        .no-print { display: none !important; }
        .screen-only { display: none !important; }
        .print-only { display: block !important; }
        .wh-root, .wh-root * {
          opacity: 1 !important; transform: none !important; filter: none !important;
          visibility: visible !important; animation: none !important; clip-path: none !important;
          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
        }
        .wh-root { overflow: visible !important; }
        .wh-root section { break-inside: auto; padding: 9mm 5mm !important; }
        .wh-root .section-head { margin-bottom: 7mm !important; break-inside: avoid; }
        .wh-root h1, .wh-root h2, .wh-root h3, .wh-root h4 { break-after: avoid; }
        /* Atomic content - a single card, photo, paragraph or table row -
           should never straddle a page break. Each of these either prints
           whole on the page it starts, or moves whole onto the next one;
           the section around it (break-inside: auto, above) is what's
           allowed to actually split across pages. A block taller than one
           full page can't honour this and simply breaks anyway - expected,
           and harmless. */
        .wh-root .annexure-card, .wh-root .voice-card, .wh-root .returns-card,
        .wh-root .theme-tile, .wh-root .pillar-card, .wh-root .vertical-card,
        .wh-root .monitor-shot, .wh-root .journey-step, .wh-root .role-row,
        .wh-root .audit-row, .wh-root .stat-card, .wh-root .headline-card,
        .wh-root .chart-frame, .wh-root .impact-card,
        .wh-root .workflow-stepper, .wh-root .activity-timeline,
        .wh-root .timeline-visual-group,
        .wh-root img, .wh-root video, .wh-root figure {
          break-inside: avoid-page;
        }
        .wh-root p, .wh-root li, .wh-root blockquote, .wh-root figcaption {
          break-inside: avoid; orphans: 3; widows: 3;
        }
        .wh-root .role-accordion { break-inside: auto !important; overflow: visible !important; }
        .wh-root .chart-print-notes { margin-top: 12px; padding-top: 10px; border-top: 1px solid ${C.line}; }
        .wh-root .chart-print-notes li { font-size: 10.5px; line-height: 1.5; color: ${C.mute}; }
        .wh-root .chart-print-notes li + li { margin-top: 5px; }
        .wh-root #fields { padding-top: 5mm !important; padding-bottom: 5mm !important; }
        .wh-root #fields .section-head { margin-bottom: 4mm !important; }
        .wh-root #themes .themes-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 10px !important;
        }
        .wh-root #themes .theme-tile { padding: 14px !important; }
        .wh-root #themes .theme-tile h4 { font-size: 13px !important; margin-top: 7px !important; }
        .wh-root #themes .theme-tile p,
        .wh-root #themes .theme-tile li { font-size: 9.25px !important; line-height: 1.34 !important; }
        .wh-root #themes .theme-tile .mt-4 { margin-top: 8px !important; }
        .wh-root #themes .theme-tile .space-y-3 > * + * { margin-top: 5px !important; }
        .wh-root #themes .theme-tile .space-y-2 > * + * { margin-top: 3px !important; }
        .wh-root #audited .audit-charts-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 10px !important;
        }
        .wh-root #audited .audit-water-wrapper { grid-column: auto !important; width: auto !important; padding: 0 !important; }
        .wh-root #audited .chart-frame { padding: 14px !important; }
        .wh-root #audited .chart-plot { height: 240px !important; }
        .wh-root #audited .chart-print-notes li { font-size: 8.5px !important; line-height: 1.32 !important; }
        .wh-root #farmerimpact .impact-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important;
        }
        .wh-root #farmerimpact .section-head { margin-bottom: 4mm !important; }
        .wh-root #farmerimpact .impact-card { padding: 14px !important; }
        .wh-root #farmerimpact .impact-card h4 { margin-bottom: 10px !important; }
        .wh-root #farmerimpact .impact-card .space-y-5 > * + * { margin-top: 8px !important; }
        .wh-root #farmerimpact .impact-card p { font-size: 9.75px !important; line-height: 1.34 !important; }
        .wh-root #farmerimpact .impact-card p + * { break-before: auto; }
        .wh-root #evidence .evidence-grid { gap: 12px !important; }
        .wh-root #evidence .annexure-card h4 { font-size: 14px !important; }
        .wh-root #evidence .annexure-card figcaption { font-size: 9.5px !important; line-height: 1.45 !important; }
        /* A section heading/eyebrow should never print as the last line on
           a page with its body pushed to the next one. Most sub-headings in
           this report are a styled Eyebrow div, not an h1-h4. */
        .wh-root h1 + *, .wh-root h2 + *, .wh-root h3 + *, .wh-root h4 + *, .wh-root .wh-eyebrow + * {
          break-before: avoid;
        }
        .wh-root .wh-eyebrow { break-after: avoid; }
        /* The index/rule + title + lede that opens every section reads as
           one unit - never split the section number onto one page and its
           title onto the next. */
        .wh-root .section-head { break-inside: avoid; break-after: avoid; }
        /* Hover-only expansion (line-clamp) can never trigger in print - show
           the full paragraph instead of the truncated preview. */
        .wh-root [class*="line-clamp"] {
          -webkit-line-clamp: unset !important; display: block !important; overflow: visible !important;
        }
        /* The hero and pinned-statement blocks reserve a vh-based viewport
           height and vertically center/bottom-align their content for the
           on-screen scroll experience - on a print page that reads as a big
           empty run before the title. Let them size to their content instead. */
        .wh-root .wh-hero {
          min-height: 281mm !important; height: 281mm !important; display: flex !important;
          break-after: page; box-sizing: border-box;
        }
        .wh-root .wh-hero .hero-content { padding-top: 26mm !important; padding-bottom: 20mm !important; }
        .wh-root .wh-pin-block {
          min-height: 0 !important; height: auto !important; display: block !important;
          padding: 14mm 10mm !important; break-inside: avoid-page;
        }
      }
    `}</style>
  );
}

/* ----------------------------------------------------------------------------
   2 · MOTION SYSTEM (unchanged)
---------------------------------------------------------------------------- */
function useGsapContext(setup, deps = []) {
  const scope = useRef(null);
  useLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context((self) => setup(self, scope.current), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scope;
}

const vFadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};
const vFadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
};
const vStagger = (stagger = 0.09, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

function Reveal({ children, delay = 0, variants = vFadeUp, amount = 0.25, className = "", style, ...rest }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function Stagger({ children, stagger = 0.09, delay = 0, className = "", amount = 0.2, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={vStagger(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

function MaskedHeading({ text, className = "", style, delay = 0, as: Tag = "h2" }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[Tag] || motion.h2;
  return (
    <MotionTag
      className={className}
      style={style}
      variants={vStagger(0.055, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="wh-mask"
          style={{ display: "inline-block", verticalAlign: "bottom", marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "108%", opacity: 0, rotate: 2 },
              show: { y: "0%", opacity: 1, rotate: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

function Counter({ value, decimals = 0, duration = 1.8, className = "", style, prefix = "", suffix = "" }) {
  const tweenRef = useRef(null);
  const scope = useGsapContext((self, node) => {
    if (!node) return;
    const finalValue = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-IN");
    if (PDF_EXPORT) {
      node.textContent = `${prefix}${finalValue}${suffix}`;
      return;
    }
    const obj = { v: 0 };
    const fmt = (n) =>
      decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-IN");
    node.textContent = `${prefix}0${suffix}`;
    tweenRef.current = gsap.to(obj, {
      v: value,
      duration,
      ease: "power2.out",
      snap: decimals ? { v: 1 / Math.pow(10, decimals) } : { v: 1 },
      onUpdate: () => { node.textContent = `${prefix}${fmt(obj.v)}${suffix}`; },
      scrollTrigger: { trigger: node, start: "top 88%", once: true },
    });
  }, [value]);
  // The count-up only fires once its ScrollTrigger has actually scrolled into
  // view - printing never scrolls, so anything below the fold would print
  // as "0". Snap every counter to its final value right before the browser
  // hands off to print.
  useEffect(() => {
    const finish = () => tweenRef.current?.progress(1);
    window.addEventListener("beforeprint", finish);
    return () => window.removeEventListener("beforeprint", finish);
  }, []);
  return <span ref={scope} className={className} style={style} />;
}

function Magnetic({ children, strength = 0.35, className = "", style, ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = useCallback(
    (e) => {
      const r = ref.current.getBoundingClientRect();
      mx.set((e.clientX - (r.left + r.width / 2)) * strength);
      my.set((e.clientY - (r.top + r.height / 2)) * strength);
    },
    [mx, my, strength]
  );
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, ...style }}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function useBatchReveal(selector, opts = {}) {
  return useGsapContext((self, el) => {
    const items = gsap.utils.toArray(selector, el);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 34 });
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: GSAP_EASE,
          stagger: opts.stagger ?? 0.08,
          overwrite: true,
        }),
    });
  }, []);
}

/* ---- shared chrome ----------------------------------------------------- */
function Eyebrow({ children, color = C.husk, className = "", big = false }) {
  return (
    <div
      className={`wh-eyebrow wh-data uppercase ${big ? "text-base" : "text-xs"} ${className}`}
      style={{ color, letterSpacing: big ? "0.1em" : "0.18em", fontWeight: big ? 700 : 600 }}
    >
      {children}
    </div>
  );
}

/** Warm, tinted callout card for a single load-bearing sentence - an
 *  auditor's finding, a synthesis line - that deserves to stand apart from
 *  running body copy. A quiet quotation glyph and a serif-italic setting
 *  (the same FONT_QUOTE used for the report's other pull-quote moments) do
 *  the differentiating; deliberately no hand-drawn doodle or script accent,
 *  so it reads as editorial restraint rather than decoration. */
function PullQuoteCard({ children, tone = C.husk, dark = false, label, className = "" }) {
  return (
    <div
      className={`relative p-7 md:p-8 rounded-lg ${className}`}
      style={{
        background: dark ? "rgba(255,255,255,.04)" : `${tone}14`,
        border: `1px solid ${dark ? tone + "4d" : tone + "33"}`,
      }}
    >
      <svg width="30" height="22" viewBox="0 0 34 26" aria-hidden="true" style={{ color: tone, opacity: dark ? 0.85 : 0.5 }}>
        <path
          d="M0 26V15.6C0 6.9 5.2 1.4 13.6 0l1.4 3.7C9.6 5 6.8 8 6.6 12.4h6.8V26H0zm18.6 0V15.6c0-8.7 5.2-14.2 13.6-15.6L33.6 3.7c-5.4 1.3-8.2 4.3-8.4 8.7H32V26H18.6z"
          fill="currentColor"
        />
      </svg>
      {label && <Eyebrow color={tone} className="mt-3">{label}</Eyebrow>}
      <p
        className="mt-3"
        style={{
          fontFamily: FONT_QUOTE,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "1.05rem",
          lineHeight: 1.65,
          color: dark ? "rgba(255,255,255,.92)" : C.ink,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function SectionHead({ index, title, lede, tone = "light" }) {
  const fg = tone === "dark" ? "#fff" : C.field;
  const body = tone === "dark" ? "rgba(255,255,255,.72)" : C.mute;
  const rule = tone === "dark" ? "rgba(255,255,255,.18)" : C.line;
  return (
    <div className="section-head mb-10 md:mb-14">
      <Stagger stagger={0.1}>
        <motion.div variants={vFadeIn} className="flex items-baseline gap-4">
          <span className="wh-data text-sm" style={{ color: C.husk, fontWeight: 600 }}>{index}</span>
          <motion.span
            style={{ height: 1, background: rule, transformOrigin: "left center", flex: 1 }}
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease: EASE } } }}
          />
        </motion.div>
      </Stagger>
      <MaskedHeading
        text={title}
        className="wh-display mt-4 text-3xl md:text-5xl"
        style={{ color: fg, fontWeight: 800, maxWidth: "30ch" }}
        delay={0.1}
      />
      {lede && (
        <Reveal delay={0.18}>
          <p className="mt-5 text-base md:text-lg" style={{ color: body, lineHeight: 1.65 }}>{lede}</p>
        </Reveal>
      )}
    </div>
  );
}

function Section({ id, children, tone = "light", className = "" }) {
  return (
    <section
      id={id}
      className={`px-5 md:px-10 py-20 md:py-28 ${className}`}
      style={{ background: tone === "dark" ? C.ink : tone === "tint" ? C.paperDim : C.paper }}
    >
      <div className="mx-auto" style={{ maxWidth: 1180 }}>{children}</div>
    </section>
  );
}

/** Drop-in image frame - give it a `src` and it renders full-bleed with an
 *  optional caption bar. Every use in this file already has a real `src`
 *  extracted from the docx. Every photo pops into place as it scrolls into
 *  view and, where it has a fixed aspect ratio, drifts gently (Ken-Burns
 *  style) as the page keeps scrolling past it - a small "the report is alive"
 *  cue that repeats in every section without needing a bespoke effect each. */
function PhotoSlot({ ratio, src, alt, className = "", caption, fit = "cover" }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  // "contain" is for evidence-type images (screenshots, forms, receipts,
  // portrait photos) where cropping could hide real content - it letterboxes
  // instead of cutting anything off, so the whole image is always visible.
  const useCover = ratio && fit === "cover";

  return (
    <motion.figure
      ref={wrapRef}
      className={className}
      initial={{ opacity: 0, scale: 1.06, y: 26 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={ratio
          ? { aspectRatio: ratio, background: C.paperDim, border: `1px solid ${C.line}` }
          : { background: C.paperDim, border: `1px solid ${C.line}`, lineHeight: 0 }}
      >
        {useCover && !reduce ? (
          <motion.img
            src={src}
            alt={alt}
            style={{ position: "absolute", top: "-10%", left: 0, width: "100%", height: "120%", objectFit: "cover", y: parallaxY }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            style={ratio
              ? { width: "100%", height: "100%", objectFit: fit }
              : { width: "100%", height: "auto", display: "block" }}
          />
        )}
      </div>
      {caption && (
        <figcaption className="wh-data mt-2" style={{ fontSize: 11, color: C.mute, lineHeight: 1.6, fontStyle: "italic" }}>
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

/** Small arrow-cursor glyph used by CursorFollow - a stand-in for the
 *  reader's own pointer, tinted to the report's field-green rather than a
 *  generic system colour, so the floating tag reads as part of this report
 *  and not a browser chrome element. */
function CursorArrow(props) {
  return (
    <svg width={16} height={19} viewBox="0 0 26 31" fill="none" {...props}>
      <path
        fill={C.field}
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="square"
        d="M21.993 14.425 2.549 2.935l4.444 23.108 4.653-10.002z"
      />
    </svg>
  );
}

/** Wraps any block (typically a photo) so that, on hover, a small
 *  cursor + label tag follows the pointer inside it - a lightweight way to
 *  name what a reader is looking at without a caption competing for space
 *  underneath the image itself. Spring-follows the pointer so it trails
 *  smoothly rather than snapping frame to frame. */
function CursorFollow({ children, label, className = "" }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 320, damping: 28, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 320, damping: 28, mass: 0.5 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMove}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.15 }}
            className="pointer-events-none absolute z-20 flex items-center gap-1.5"
            style={{ left: sx, top: sy }}
          >
            <CursorArrow />
            <span
              className="wh-data rounded"
              style={{ background: C.field, color: "#fff", padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 8px 20px -6px rgba(10,31,22,.5)" }}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   3 · SIGNATURE - grain moisture gauge (decorative scroll-position chrome,
   not a data claim - no figure in the document is attached to it). Scoped to
   the Programme Journey section only: hidden everywhere else, empty when the
   section is entered and full by the time the "Quantification and Reporting"
   step (the section's final step) scrolls into view.
---------------------------------------------------------------------------- */
function MoistureGauge() {
  const fill = useRef(null);
  const label = useRef(null);

  const scope = useGsapContext((self, el) => {
    const TOP = 10, H = 168, BOTTOM = TOP + H;
    gsap.matchMedia().add(
      { ok: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      () => {
        const section = document.getElementById("journey");
        if (!section) return;

        // onToggle (not onEnter/onLeave) so a fast fling or a jump straight
        // to a section past Journey still resolves to the correct hidden
        // state - and onRefresh re-syncs visibility if lazy-loaded images
        // shift the section's height after the trigger was first measured.
        const sync = (active) => {
          gsap.to(el, {
            autoAlpha: active ? 1 : 0, x: active ? 0 : 30,
            duration: active ? 0.5 : 0.4, ease: GSAP_EASE, overwrite: true,
          });
        };

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (st) => {
            const level = Math.min(1, Math.max(0, 0.1 + st.progress * 0.9));
            const h = H * level;
            gsap.set(fill.current, { attr: { y: BOTTOM - h, height: h } });
            if (label.current) label.current.textContent = `${(10 + level * 4).toFixed(1)}%`;
          },
          onToggle: (st) => sync(st.isActive),
          onRefresh: (st) => sync(st.isActive),
        });

        // set the correct state immediately (no tween) in case the page
        // mounts already scrolled into/past the section.
        gsap.set(el, { autoAlpha: trigger.isActive ? 1 : 0, x: trigger.isActive ? 0 : 30 });
      }
    );
  }, []);

  return (
    <div
      ref={scope}
      className="no-print fixed z-40 hidden lg:flex flex-col items-center gap-2"
      style={{ right: 26, top: "50%", transform: "translateY(-50%)", opacity: 0 }}
      aria-hidden="true"
    >
      <div className="wh-data" style={{ fontSize: 9, letterSpacing: ".14em", color: C.mute }}>GRAIN MOISTURE</div>
      <svg width="46" height="190" viewBox="0 0 46 190">
        <defs>
          <clipPath id="whTubeClip"><rect x="12" y="10" width="22" height="168" rx="11" /></clipPath>
        </defs>
        <rect x="12" y="10" width="22" height="168" rx="11" fill="#fff" stroke={C.line} />
        <g clipPath="url(#whTubeClip)">
          <rect ref={fill} x="12" y="120" width="22" height="58" fill={C.husk} opacity="0.85" />
        </g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx="23" cy={30 + i * 19} r="1.6" fill={C.field} opacity="0.35" />
        ))}
        <line x1="6" y1="132" x2="40" y2="132" stroke={C.leaf} strokeWidth="1" strokeDasharray="3 3" />
      </svg>
      <div ref={label} className="wh-data text-center" style={{ fontSize: 10, color: C.field, fontWeight: 600 }}>
        12%
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   4 · TOP BAR - nav mirrors the document's own table of contents
---------------------------------------------------------------------------- */
const NAV = [
  ["season", "Season"], ["fields", "Fields"], ["themes", "Themes"], ["governance", "Governance"],
  ["journey", "Journey"], ["voices", "Voices"], ["practice", "Practice"],
  ["audited", "Audited"], ["timeline", "Timeline"], ["farmerimpact", "Farmer Impact"],
  ["sourcing", "Sourcing"], ["evidence", "Evidence"], ["about", "About"],
];

function TopBar() {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("season");
  const bar = useRef(null);

  const scope = useGsapContext(() => {
    gsap.fromTo(
      bar.current,
      { scaleX: 0 },
      {
        scaleX: 1, ease: "none", transformOrigin: "left center",
        scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
      }
    );
    ScrollTrigger.create({
      trigger: document.body, start: "top+=90 top",
      onEnter: () => setSolid(true), onLeaveBack: () => setSolid(false),
    });
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el, start: "top 45%", end: "bottom 45%",
        onToggle: (st) => st.isActive && setActive(id),
      });
    });
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <motion.header
      ref={scope}
      className="no-print fixed top-0 left-0 right-0 z-50"
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
      style={{
        background: solid ? "rgba(32,24,11,.92)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        transition: "background .4s ease, backdrop-filter .4s ease",
      }}
    >
      <div className="flex items-center gap-4 px-5 md:px-10" style={{ height: 58 }}>
        <Magnetic strength={0.2}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
            <LogoSlot name="Grow Indigo" src={wheatPartnerLogo} light height={33} />
          </button>
        </Magnetic>

        <LayoutGroup id="wh-nav">
          <nav className="wh-scroll flex-1 hidden md:flex gap-1 overflow-x-auto">
            {NAV.map(([id, labelText]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="relative wh-data px-3 py-1.5 rounded"
                style={{ fontSize: 10.5, letterSpacing: ".08em", color: active === id ? "#fff" : "rgba(255,255,255,.55)", whiteSpace: "nowrap", transition: "color .3s ease" }}
              >
                {active === id && (
                  <motion.span
                    layoutId="wh-nav-pill"
                    className="absolute inset-0 rounded"
                    style={{ background: "rgba(255,255,255,.12)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{labelText.toUpperCase()}</span>
              </button>
            ))}
          </nav>
        </LayoutGroup>

        <div className="hidden lg:block ml-auto">
          <LogoSlot name="ClearHarvest" src={wheatProgrammeLogo} align="right" light height={33} />
        </div>
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,.12)" }}>
        <div ref={bar} style={{ height: 2, background: C.husk, transformOrigin: "left center" }} />
      </div>
    </motion.header>
  );
}

/* ----------------------------------------------------------------------------
   5 · HERO
   Title, lede and meta are the document's own cover page.
---------------------------------------------------------------------------- */
const HERO_LINES = [["Low-emission"], ["Wheat", "offtake"]];
const HERO_META = [
  ["Reporting period", "Rabi Crop Season 2025-26"],
  ["Implementation partner", "Grow Indigo"],
  ["Geography", "Ludhiana & Faridkot, Punjab"],
  ["Quantification", "Cool Farm Platform v3.0"],
];

function Hero() {
  const scope = useGsapContext((self, el) => {
    const q = gsap.utils.selector(el);
    gsap.set(q(".hero-word"), { yPercent: 115 });
    gsap.set([q(".hero-eyebrow"), q(".hero-lede"), q(".hero-meta > *"), q(".hero-cue")], { autoAlpha: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: GSAP_EASE } });
    tl.fromTo(q(".hero-stalk"), { scaleY: 0, transformOrigin: "bottom center", opacity: 0 },
        { scaleY: 1, opacity: 0.8, duration: 1.4, stagger: { each: 0.012, from: "center" } }, 0.15)
      .to(q(".hero-eyebrow"), { autoAlpha: 1, y: 0, duration: 0.8 }, 0.35)
      .to(q(".hero-word"), { yPercent: 0, duration: 1.1, stagger: 0.09, ease: "expo.out" }, 0.5)
      .to(q(".hero-lede"), { autoAlpha: 1, y: 0, duration: 0.9 }, 1.05)
      .to(q(".hero-meta > *"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.2)
      .to(q(".hero-cue"), { autoAlpha: 1, y: 0, duration: 0.6 }, 1.6);

    gsap.matchMedia().add({ ok: "(prefers-reduced-motion: no-preference)" }, () => {
      gsap.to(q(".hero-content"), {
        yPercent: -14, autoAlpha: 0, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
      });
      gsap.to(q(".hero-field"), {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    });
  }, []);

  return (
    <div ref={scope} className="wh-hero relative flex flex-col justify-end" style={{ minHeight: "100vh", background: C.ink }}>
      {/* Drawn, not photographed - a field of wheat built from code, same
          approach as the rice report's paddy-field hero. Sky is a plain CSS
          gradient covering the whole hero; the wheat itself lives in a fixed-
          height band pinned to the bottom edge, so it can never grow tall
          enough to collide with the title/lede/meta above it. */}
      <div
        className="absolute inset-0 wh-scrub"
        aria-hidden="true"
        style={{ background: "linear-gradient(180deg, #241C16 0%, #3A2418 62%, #4A2F1E 100%)" }}
      />
      <svg
        className="hero-field absolute bottom-0 left-0 w-full wh-scrub"
        style={{ height: "clamp(140px, 22vh, 240px)" }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 240"
        aria-hidden="true"
      >
        {/* stubble line at the base - the zero-tillage story in one gesture:
            residue stays on the field instead of being burnt off */}
        <rect x="0" y="200" width="1200" height="40" fill={C.clay} opacity="0.3" />
        {Array.from({ length: 46 }).map((_, i) => {
          const x = 20 + i * 26;
          const h = 30 + ((i * 37) % 40);
          const tipY = 210 - h - 12;
          const tilt = (i % 5) - 2;
          return (
            <g key={i} className="hero-stalk">
              <path d={`M${x} 210 q3 -${h} 0 -${h + 12}`} stroke={C.husk} strokeWidth="1.6" fill="none" opacity=".8" />
              {/* plump wheat ear (shared WheatEar shape, scaled down for the hero field) */}
              <g transform={`translate(${x} ${tipY}) rotate(${tilt})`}>
                <WheatEar scale={0.5} opacity=".9" />
              </g>
            </g>
          );
        })}
      </svg>

      <div className="hero-content relative px-5 md:px-10 pb-16 md:pb-24 pt-32 mx-auto w-full wh-scrub" style={{ maxWidth: 1180 }}>
        <h1 className="wh-display mt-8" style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(2.2rem, 6.4vw, 5.2rem)", maxWidth: "20ch" }}>
          {HERO_LINES.map((line, li) => (
            <span key={li} className="wh-mask">
              {line.map((w, wi) => (
                <span
                  key={wi}
                  className="hero-word"
                  style={{ display: "inline-block", marginRight: wi < line.length - 1 ? "0.28em" : 0 }}
                >
                  {w}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="hero-lede mt-7 text-lg md:text-xl" style={{ color: "rgba(255,255,255,.78)", maxWidth: "60ch", lineHeight: 1.6 }}>
          Across XXS ha in Ludhiana and Faridkot, wheat cultivation advances regenerative agricultural practices
          through Zero/Reduced tillage (ZT/RT), responsible residue management, optimised fertiliser use and
          digitally traceable from farm to processor.
        </p>

        <div className="hero-meta mt-10 flex flex-wrap gap-x-10 gap-y-5">
          {HERO_META.map(([k, v]) => (
            <div key={k}>
              <div className="wh-data" style={{ fontSize: 9.5, letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>
                {k.toUpperCase()}
              </div>
              <div style={{ color: "#fff", fontWeight: 500, fontSize: 15, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-cue relative pb-8 flex justify-center" aria-hidden="true">
        <motion.svg
          width="20" height="26" viewBox="0 0 20 26"
          animate={{ y: [0, 7, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M10 2v20M3 15l7 7 7-7" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" fill="none" />
        </motion.svg>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   5a · TICKER - the season's headline figures, running the way the rice
   report's does: a quiet strip directly under the title page, not layered
   on top of it. GSAP-driven so it can ease to a crawl (not a hard stop) the
   moment a reader's cursor lands on it.
---------------------------------------------------------------------------- */
const TICKER_ITEMS = [
  "XXS wheat farmers enrolled across Ludhiana & Faridkot",
  "XXS hectares under Zero/Reduced Tillage",
  "~XXS% nitrogen reduction against ABC baseline",
  "~XXS% GHG reduction against ABC baseline",
  "~XXS% lower irrigation water use against Grow Indigo's baseline",
  "XXS MT of low-emission wheat procured",
  "Rabi Crop Season 2025-26",
];

function Ticker() {
  const scope = useGsapContext((self, el) => {
    const track = el.querySelector(".wh-ticker-track");
    const half = track.scrollWidth / 2;
    const tween = gsap.to(track, { x: -half, duration: 28, ease: "none", repeat: -1 });
    // slows to a crawl on hover so a reader can actually catch a figure
    el.addEventListener("mouseenter", () => gsap.to(tween, { timeScale: 0.15, duration: 0.6 }));
    el.addEventListener("mouseleave", () => gsap.to(tween, { timeScale: 1, duration: 0.6 }));
  }, []);
  return (
    <div ref={scope} className="overflow-hidden" style={{ background: C.ink, padding: "14px 0" }}>
      <div className="wh-ticker-track flex" style={{ width: "max-content" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <div key={i} className="wh-data flex items-center" style={{ fontSize: 12, color: "rgba(255,255,255,.72)", letterSpacing: ".06em", padding: "0 28px" }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: C.husk, marginRight: 14, flexShrink: 0 }} />
            {t.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   5b · ROLLING NUMBER - every headline stat/figure counts up from 0 the first
   time it scrolls into view, instead of appearing as static text.
---------------------------------------------------------------------------- */
function RollingNumber({ value, duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();

  const str = String(value);
  const m = str.match(/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/s);
  const prefix = m?.[1] ?? "";
  const numStr = m?.[2] ?? "";
  const suffix = m?.[3] ?? "";
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  const target = m ? parseFloat(numStr.replace(/,/g, "")) : 0;

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(
    (PDF_EXPORT ? target : 0).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );

  useEffect(() => {
    if (!m) return;
    if (PDF_EXPORT || inView) mv.set(target);
  }, [inView, target, m, reduceMotion]);

  useEffect(() => {
    if (!m) return;
    if (reduceMotion) {
      setDisplay(target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
      return;
    }
    return spring.on("change", (v) => {
      setDisplay(v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
    });
  }, [spring, decimals, m, reduceMotion, target]);

  // Same problem as the GSAP-driven Counter: this only counts up once
  // useInView reports true, which requires the element to have actually
  // scrolled past. Printing never scrolls, so anything below the fold would
  // print as "0" - force the final formatted value straight into state
  // right before the browser hands off to print.
  useEffect(() => {
    if (!m) return;
    const finish = () => setDisplay(target.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
    window.addEventListener("beforeprint", finish);
    return () => window.removeEventListener("beforeprint", finish);
  }, [m, target, decimals]);

  if (!m) return <span>{value}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ----------------------------------------------------------------------------
   5b · REPORT ICON SET - a small shared library of line icons (24x24,
   stroke="currentColor", 1.6px, rounded caps) matching the hand-drawn style
   already used for the theme tiles and workflow cards, so every stat,
   pillar and step in the report reads from one consistent icon language
   instead of bare numbers and text.
---------------------------------------------------------------------------- */
const ICON_PEOPLE = (
  <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.6 2.6 0 1 0 0-5.2M22 20c0-2.8-2.1-5.1-4.8-5.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_FIELD = (
  <path d="M3 20h18M4 20V9l4-3 4 3 4-3 4 3v11M8 20v-6M12 20v-6M16 20v-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_CO2 = (
  <path d="M7 17a4 4 0 1 1 .7-7.94A5 5 0 0 1 17.5 11H18a3.5 3.5 0 0 1 0 7H7zM9 20l-1.5 2M13 20l-1.5 2M17 20l-1.5 2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_NITROGEN = (
  <path d="M10 3h4M11 3v5.2L6.5 17a2 2 0 0 0 1.8 2.9h7.4A2 2 0 0 0 17.5 17L13 8.2V3M9 14h6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_WATER = (
  <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11zM9.5 15a2.5 2.5 0 0 0 2.5 2.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_GRAIN = (
  <path d="M12 2c1.2 3 3 4 3 7a3 3 0 1 1-6 0c0-3 1.8-4 3-7zM12 12v10M8 22h8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_SHIELD_CHECK = (
  <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3zM8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
);
const ICON_CLIPBOARD = (
  <path d="M9 4h6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1V5a1 1 0 0 1 1-1zM9 4v2h6V4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_CHART = (
  <path d="M4 20h16M8 20v-7M13 20V7M18 20v-11" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_TREE = (
  <path d="M12 3l4.5 6h-2.7L18 14h-3l3.5 6H7.5L11 14H8l4.2-5H9.5L12 3zM12 20v2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);

/** Icon badge - a round tinted disc that sits above a stat or beside a
 *  label, matching each card's colour system rather than one flat brand hue. */
function IconBadge({ icon, color = C.field, size = 40 }) {
  const bg = color === "#fff" ? "rgba(255,255,255,.16)" : `${color}17`;
  return (
    <div
      className="inline-flex items-center justify-center rounded-full flex-none"
      style={{ width: size, height: size, background: bg, color }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24">{icon}</svg>
    </div>
  );
}

/** Keyword lookup so existing [value, label, sub] stat tuples across the
 *  report automatically pick up the right icon without every call site
 *  needing to be rewritten to a new shape. */
function iconForStatLabel(label = "") {
  const l = label.toLowerCase();
  if (l.includes("farmer")) return ICON_PEOPLE;
  if (l.includes("hectare")) return ICON_FIELD;
  if (l.includes("nitrogen")) return ICON_NITROGEN;
  if (l.includes("ghg") || l.includes("emission") || l.includes("carbon")) return ICON_CO2;
  if (l.includes("water")) return ICON_WATER;
  if (l.includes("procurement") || l.includes("mt)")) return ICON_GRAIN;
  return ICON_CHART;
}

/* ----------------------------------------------------------------------------
   6 · SHARED STAT ROW - reused for the two identical "season headline"
   result trios (Section 01 and Section 09).
---------------------------------------------------------------------------- */
function StatRow({ stats }) {
  const colsClass = stats.length === 4 ? "sm:grid-cols-4" : stats.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {stats.map(([value, label, sub]) => (
        <div
          key={label}
          className="stat-card p-6 rounded-lg text-center transition-transform duration-300 ease-out hover:-translate-y-1"
          style={{ background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(10,31,22,.04)" }}
        >
          <IconBadge icon={iconForStatLabel(label)} color={C.field} />
          <div className="wh-display mt-3" style={{ fontWeight: 800, fontSize: "2rem", color: C.field }}><RollingNumber value={value} /></div>
          <div className="mx-auto mt-2" style={{ width: 28, height: 2, background: C.husk }} />
          <div className="mt-3" style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{label}</div>
          {sub && <div className="wh-data mt-1" style={{ fontSize: 11.5, color: C.mute }}>{sub}</div>}
        </div>
      ))}
    </div>
  );
}

const ENROLMENT_HEADLINES = [
  ["XXS", "Farmers participated", null],
  ["XXS", "Hectares", null],
  ["XXS", "Procurement quantity (MT)", null],
];

const HEADLINE_RESULTS = [
  ["~XXS%", "Nitrogen reduction", "XXS to XXS kg N/ha **"],
  ["~XXS%", "Water saved", "XXS → XXS m³/ha *"],
  ["~XXS%", "GHG reduction", "vs. ABC baseline **"],
];

/* ----------------------------------------------------------------------------
   7 · SECTION 01 - WHAT THE SEASON DELIVERED
---------------------------------------------------------------------------- */
function SeasonSection() {
  return (
    <Section id="season" tone="tint">
      <SectionHead
        index="01"
        title="What the Season Delivered?"
        lede="The Low-emission Wheat Offtake promoted sustainable practices like Zero/Reduced Tillage (ZT/RT) as the central practice for wheat sown after the preceding crop. The programme recorded farmer registration, field-level agronomic data including optimised fertilizer uses, crop residue management (CRM) and irrigation water use followed by an independent third-party audit."
      />

      <Reveal>
        <StatRow stats={ENROLMENT_HEADLINES} />
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <StatRow stats={HEADLINE_RESULTS} />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <p className="wh-data" style={{ fontSize: 12, color: C.mute, letterSpacing: ".01em" }}>
          * Baseline established by Grow Indigo.
          <br />
          ** Baseline provided by ABC.
        </p>
        <Eyebrow big className="mt-5">Why This Programme Exists?</Eyebrow>
        <div className="mt-4 space-y-5" style={{ fontSize: 16, lineHeight: 1.75, color: C.mute }}>
          <p>
            Wheat sown after paddy in Punjab is usually established through repeated tillage, with the previous
            crop's residue often burnt to clear fields fast. Tillage adds diesel use and soil disturbance at every
            pass; burning adds air pollution and strips out organic matter. Against that backdrop the programme
            built its establishment method around Zero/Reduced tillage, optimised nitrogen use and Crop residue
            management (CRM).
          </p>
          <p>
            Participating farmers adopted a revised wheat establishment approach centred on Zero/Reduced tillage.
            It enabled direct sowing through retained crop residue, replacing conventional ploughing and seedbed
            preparation with a single-pass operation. Farmer training, nutrient management, field monitoring and
            digital traceability were aligned around this practice to support consistent implementation and
            provide an auditable record of programme adoption.
          </p>
          <p>
            The project reduced GHG emissions by an average of XXS% per MT. By integrating Soil Organic Carbon
            (SOC) sequestration, the project generated an average XXS% total net greenhouse gas benefit over
            the baseline.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12} className="mt-12">
        <div className="p-7 rounded-lg" style={{ background: C.ink }}>
          <Eyebrow color={C.husk} big>The claim, in one line?</Eyebrow>
          <p className="mt-4" style={{ fontFamily: FONT_QUOTE, fontStyle: "italic", color: "#fff", fontWeight: 500, fontSize: "clamp(1.3rem,2.6vw,1.75rem)", lineHeight: 1.42 }}>
            A farmer-led model for lower-emission wheat, centred on sustainable practices and supported by
            transparent field records, independent assurance and traceable procurement.
          </p>
          <div className="wh-data mt-5" style={{ fontSize: 13, color: "rgba(255,255,255,.65)", letterSpacing: ".02em" }}>
            XXS farmers enrolled · XXS hectares covered · XXS MT of wheat procured
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   8 · SECTION 02 - EVERY FIELD ON THE MAP
---------------------------------------------------------------------------- */
function FieldsSection() {
  return (
    <Section id="fields">
      <SectionHead
        index="02"
        title="Every Field on the Map"
        lede="The programme covered registered wheat farms in Punjab. Farmer identities, field boundaries and agronomic information were digitally recorded to support field-level monitoring and traceability. Field-level records were organised across four processors: Miller 1, Miller 2, Miller 3 and Miller 4."
      />
      <Reveal delay={0.15}>
        {!PDF_EXPORT && (
          <div className="mt-6">
            <WheatFieldsMapBlock />
          </div>
        )}
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   9 · SECTION 03 - THE THREE PROGRAMME THEMES
---------------------------------------------------------------------------- */
const THEME_1_BULLETS = [
  "Fewer conventional land-preparation operations compared with repeated tillage.",
  "Reduced soil disturbance during crop establishment.",
  "Residue retained within the production system instead of being openly burnt.",
  "Practical ZT/RT demonstrations conducted during farmer meetings and field exposure sessions.",
  "Field-level adoption recorded and verified through programme monitoring.",
  "Low-emission wheat segregated in distinct white PP bags during procurement to support identification and traceability.",
];

const THEME_2_BULLETS = [
  "No open-field residue burning was reinforced as a core programme practice.",
  "Farmers were sensitised on the environmental and agronomic importance of responsible crop-residue management.",
  "Residue retention, incorporation and baling were promoted as appropriate alternatives to burning.",
  "Zero/reduced Tillage machinery enabled wheat sowing through retained paddy residue, reducing the need for field clearing before sowing.",
  "Kisan Advisors reinforced no-burning practices through regular field visits, farmer meetings and practical demonstrations.",
  "Field boundaries and agronomic records were digitally captured, while remote-sensing checks supported verification of no-burning on mapped programme fields.",
];

const THEME_3_BULLETS = [
  "Field visits by Kisan Advisors from sowing to harvest",
  "several village-level meetings (VLMs) with live demonstrations",
  "Vernacular learning videos on Grow Indigo's YouTube channel and weekly WhatsApp messages",
];

const ICON_SOIL = (
  <path d="M12 21v-7M12 14c-4 0-7-3-7-7 4 0 7 3 7 7zM12 14c4 0 7-3 7-7-4 0-7 3-7 7z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);
const ICON_NO_BURN = (
  <>
    <path d="M12 3c1 3-2 4-2 7a3 3 0 1 0 6 0c0-1-.5-2-1-2.5.5 2-1 3-2 3-1.5 0-2-1.5-1-3.5C13 6 12.5 4.5 12 3z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>
);
const ICON_EXTENSION = (
  <path d="M3 10v4h3l6 4V6l-6 4H3zM14.5 8.5a4 4 0 0 1 0 7M17.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
);

const THEMES = [
  {
    n: "Theme 01", category: "Soil", title: "Zero/Reduced Tillage", icon: ICON_SOIL, color: C.field,
    stat: "Zero/Reduced Tillage across XXS hectares",
    paragraphs: [
      "Sustainable practices like Zero/Reduced tillage were the main establishment practice promoted under the wheat programme. It enabled wheat to be sown with in-situ management of paddy residue, avoiding the conventional sequence of repeated land preparation and providing farmers with an alternative to open-field residue burning.",
    ],
    bullets: THEME_1_BULLETS,
  },
  {
    n: "Theme 02", category: "Residue", title: "Crop Residue Management", icon: ICON_NO_BURN, color: C.leaf,
    stat: "Zero open-field burning · residue incorporated or baled for third-party use",
    paragraphs: [
      "The Low-emission Wheat Offtake promoted no open-field burning of crop residue as a key principle of responsible residue management. Farmers were encouraged to manage wheat residue through appropriate alternatives such as incorporation in the soil or baling and sending it to a third party.",
      "Sustainable practices such as Zero/Reduced Tillage provided farmers with a practical pathway to establish wheat through crop residue management, avoiding the need for open-field burning before sowing.",
    ],
    bullets: THEME_2_BULLETS,
  },
  {
    n: "Theme 03", category: "Program Competencies", title: "A High-touch, Phygital Extension Model", icon: ICON_EXTENSION, color: C.husk,
    stat: "Several Village-Level Meetings across the season",
    paragraphs: [
      "Kisan Advisors (KAs) conducted regular field visits throughout the wheat season, from field establishment to harvest, enabling one-on-one farmer support, field-level troubleshooting and verification of zero/reduced tillage practices, fertiliser application, crop protection and residue management.",
      <>
        Grow Indigo's digital learning platform on{" "}
        <a href="https://www.youtube.com/@growindigoindia" target="_blank" rel="noopener noreferrer" style={{ color: C.husk, textDecoration: "underline" }}>
          YouTube (@growindigoindia)
        </a>{" "}
        featured simple, vernacular videos on regenerative agriculture, water-saving methods, soil health and
        climate-smart practices, complemented by weekly WhatsApp messages carrying similar vernacular videos and
        visual infographics, giving farmers continuous learning support.
      </>,
    ],
    bullets: THEME_3_BULLETS,
  },
];

/** Themes card - icon, category eyebrow, headline and the full point list
 *  all show at rest, so the section reads rich even before anyone touches
 *  it. Hovering lifts the card, pulses its icon and reveals one extra
 *  line - the highlight stat - as the small "there's more here" payoff. */
function ThemeTile({ t }) {
  // PDF export: the highlight stat is otherwise hover-only content, and
  // nothing in a printed page can hover - show it from the start.
  const [hover, setHover] = useState(PDF_EXPORT);
  return (
    <motion.div
      className="theme-tile p-6 rounded-lg h-full"
      style={{ background: "#fff", border: `1px solid ${C.line}`, borderTop: `3px solid ${t.color}` }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -8, scale: 1.02, boxShadow: "0 26px 48px -18px rgba(10,31,22,.28)" }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 38, height: 38, background: `${t.color}1a`, color: t.color }}
          animate={{ scale: hover ? 1.12 : 1, rotate: hover ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24">{t.icon}</svg>
        </motion.span>
        <div className="wh-data" style={{ color: t.color, fontWeight: 700, fontSize: 11, letterSpacing: ".1em" }}>
          {t.n.toUpperCase()} · {t.category.toUpperCase()}
        </div>
      </div>

      <h4 className="wh-display mt-3 text-lg" style={{ color: C.ink, fontWeight: 700 }}>{t.title}</h4>

      <AnimatePresence initial={false}>
        {hover && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="wh-data mt-1.5 inline-block"
              style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: t.color, padding: "3px 8px", borderRadius: 4 }}
            >
              {t.stat}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 space-y-3" style={{ fontSize: 13.5, lineHeight: 1.65, color: C.mute }}>
        {t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <ul className="mt-4 space-y-2">
        {t.bullets.map((b, i) => (
          <li key={i} className="flex gap-2.5" style={{ fontSize: 13, lineHeight: 1.6, color: C.ink }}>
            <span style={{ color: t.color }}>▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ThemesSection() {
  const grid = useBatchReveal(".theme-tile", { stagger: 0.08 });
  return (
    <Section id="themes" tone="tint">
      <SectionHead index="03" title="The three programme themes" />
      <div ref={grid} className="themes-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {THEMES.map((t) => (
          <ThemeTile key={t.n} t={t} />
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   10 · SECTION 04 - PROGRAMME GOVERNANCE AND IMPLEMENTATION
---------------------------------------------------------------------------- */
const GOVERNANCE_TABLE = [
  ["Project Management Unit", [
    "Strategic supervision and governance",
    "Alignment with ABC's sustainability and reporting requirements",
    "Oversight of procurement and reporting",
  ]],
  ["RBM (Regional Business Manager) / Agronomist", [
    "Led on-ground implementation with the TBM and Kisan Advisors",
    "Technical guidance on Zero/Reduced tillage",
    "Farmer training on establishment method and record-keeping",
    "Quality assurance of field data and practice verification",
  ]],
  ["TBM (Territory Business Manager)", [
    "Supervised Kisan Advisors daily",
    "Coordination during procurement with processors",
    "Adherence to implementation timelines and technical protocols",
  ]],
  ["Kisan Advisors", [
    "Single point of contact for farmers",
    "Farmer engagement and mobilisation across project villages",
    "Field geofencing in the ClearHarvest application",
    "Field visits and built awareness between farmers on Zero/Reduced tillage",
  ]],
  ["Scientists", [
    "Quality checks on field mapping and monitoring of field activities",
    "GHG emission quantification and nitrogen-reduction assessment",
  ]],
  ["Engineering Team", [
    "Upgradation and maintenance of the ClearHarvest application",
    "Digital traceability and audit-trail generation, farm to processor",
  ]],
];

/** One-line taglines for the org tree's leaf boxes - short enough to sit
 *  under a name, unlike the full responsibility bullets GOVERNANCE_TABLE and
 *  RoleAccordion below carry. */
const ORG_TAGLINE = {
  "RBM (Regional Business Manager) / Agronomist": "Regional field leadership & agronomic guidance",
  "TBM (Territory Business Manager)": "Team management & operational execution",
  "Kisan Advisors": "Farmer engagement, advisory & hand-holding",
  "Scientists": "GHG quantification, data analysis & impact assessment",
  "Engineering Team": "Digital tools, data systems & technology enablement",
};

/** Coded org chart, not a screenshot - the tree assembles top-down as it
 *  scrolls into view, and every box lifts slightly on hover. */
function OrgChart() {
  const scope = useGsapContext((self, el) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
      defaults: { ease: GSAP_EASE, duration: 0.6 },
    });
    tl.from(el.querySelectorAll(".org-root"), { y: -18, autoAlpha: 0 })
      .from(el.querySelectorAll(".org-stem"), { scaleY: 0, transformOrigin: "top center", duration: 0.4 }, "-=0.2")
      .from(el.querySelectorAll(".org-branch"), { y: -14, autoAlpha: 0, stagger: 0.12 }, "-=0.1")
      .from(el.querySelectorAll(".org-leaf"), { x: -14, autoAlpha: 0, stagger: 0.07 }, "-=0.25");
  }, []);

  const node = (label, sub, bg, fg = "#fff", cls = "") => (
    <motion.div
      className={`px-4 py-3 rounded ${cls}`}
      style={{ background: bg, color: fg, minWidth: 0 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.25, ease: EASE } }}
    >
      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
      {sub && <div className="wh-data mt-1" style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.5 }}>{sub}</div>}
    </motion.div>
  );

  return (
    <div ref={scope} className="p-6 md:p-8 rounded-lg" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      <Eyebrow big>ClearHarvest team structure</Eyebrow>
      <div className="mt-6 flex flex-col items-center">
        {node("PMU", "Project Management Unit · timely execution against milestones", C.field, "#fff", "org-root")}
        <div className="org-stem" style={{ width: 1, height: 22, background: C.line }} />
        <div className="grid gap-4 sm:grid-cols-2 w-full">
          <div>
            {node("Field Operations", null, C.leaf, "#fff", "org-branch")}
            <div className="mt-3 space-y-3">
              {node("RBM (Regional Business Manager) / Agronomist", ORG_TAGLINE["RBM (Regional Business Manager) / Agronomist"], C.paperDim, C.ink, "org-leaf")}
              {node("TBM (Territory Business Manager)", ORG_TAGLINE["TBM (Territory Business Manager)"], C.paperDim, C.ink, "org-leaf")}
              {node("Kisan Advisors", ORG_TAGLINE["Kisan Advisors"], C.paperDim, C.ink, "org-leaf")}
            </div>
          </div>
          <div>
            {node("Science & Technology", null, C.water, "#fff", "org-branch")}
            <div className="mt-3 space-y-3">
              {node("Scientists", ORG_TAGLINE["Scientists"], C.paperDim, C.ink, "org-leaf")}
              {node("Engineering Team", ORG_TAGLINE["Engineering Team"], C.paperDim, C.ink, "org-leaf")}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6" style={{ fontSize: 13.5, lineHeight: 1.7, color: C.mute }}>
        Field execution was led by the Regional Business Manager / Agronomist, who oversaw technical implementation and
        agronomic fidelity across the project area, supported by the Territory Business Manager on day-to-day oversight,
        farmer coordination and operational planning. At ground level, Kisan Advisors worked directly with farmers to
        drive adoption, monitor fields and protect the integrity of data collection.
      </p>
    </div>
  );
}

/** Accordion of full role responsibilities - one open at a time, click to
 *  expand - instead of a permanently-open table. */
function RoleAccordion() {
  // PDF export: every role's responsibilities should already be open,
  // instead of only the first one - there's no click to reveal the rest.
  const [open, setOpen] = useState(PDF_EXPORT ? "all" : 0);
  return (
    <div className="role-accordion rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
      <div className="px-6 py-4" style={{ background: C.field }}>
        <Eyebrow color="rgba(255,255,255,.7)" big>Functional responsibility mapping</Eyebrow>
      </div>
      {GOVERNANCE_TABLE.map(([role, duties], i) => {
        const isOpen = open === "all" || open === i;
        return (
          <div key={role} className="role-row" style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <motion.button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center gap-4 px-6 py-4 text-left"
              aria-expanded={isOpen}
              whileHover={{ backgroundColor: "rgba(14,91,51,.04)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="wh-data" style={{ fontSize: 11, color: C.husk, fontWeight: 600, width: 22 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <motion.span
                animate={{ color: isOpen ? C.field : C.ink, x: isOpen ? 4 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ fontWeight: 600, fontSize: 15, flex: 1 }}
              >
                {role}
              </motion.span>
              <motion.span
                animate={{ rotate: isOpen ? 135 : 0, color: isOpen ? C.field : C.mute }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                style={{ fontSize: 20, lineHeight: 1 }}
              >
                +
              </motion.span>
            </motion.button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <motion.ul
                    className="px-6 pb-5 space-y-2"
                    style={{ paddingLeft: 68 }}
                    variants={vStagger(0.05, 0.06)}
                    initial="hidden"
                    animate="show"
                  >
                    {duties.map((d) => (
                      <motion.li key={d} variants={vFadeUp} className="flex gap-3" style={{ fontSize: 14, lineHeight: 1.6, color: C.mute }}>
                        <span style={{ color: C.leaf }}>▸</span>
                        <span>{d}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Six-step monitoring/traceability/assurance chain - coded, not a
 *  screenshot, so each node lifts on hover like everything else in the
 *  report. Content and snake layout (1→2→3, then down, then 6←5←4) match
 *  the six-step-chain.png graphic exactly. */
const WF_ICONS = [
  <path key="a" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.2c2.9.4 5.5 2.7 5.5 5.8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="b" d="M12 2a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 2zM9.5 19h5M10 22h4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="c" d="M6 2h9l5 5v15H6zM15 2v5h5M9 12h6M9 16h6M9 8h2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="d" d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />,
  <path key="e" d="M3 6h6l2 2h10v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
  <path key="f" d="M4 20V10M10 20V4M16 20v-7M4 20h16" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
];

const WORKFLOW_WHEAT = [
  ["Kisan Advisor visits the farmer", "On-field engagement and practice verification"],
  ["Capability building on interventions", "Training on sustainable practices"],
  ["Data capture on agronomic practices", "Digitally captured the agronomy data from sowing to harvest"],
  ["QC of field-reported data by scientists", "Methodological review and validation"],
  ["Procurement audit trail", "End-to-end record captured in S3 Sutra"],
  ["3rd-party audit & report submission", "Independent field verification, GHG quantification and final reporting"],
];

function WFArrow({ dir = "right" }) {
  const rotate = { right: 0, left: 180, down: 90 }[dir];
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" style={{ color: C.field, transform: `rotate(${rotate}deg)` }}>
      <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WFCard({ n, icon, title, sub }) {
  return (
    <motion.div
      className="wf-node rounded-lg"
      style={{ background: "#fff", border: `1px solid ${C.line}`, borderTop: `3px solid ${C.field}`, padding: "12px 14px", height: "100%" }}
      whileHover={{ y: -6, boxShadow: "0 16px 32px -12px rgba(14,91,51,.35)" }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: C.field, color: "#fff", fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
          {n}
        </div>
        <svg width="17" height="17" viewBox="0 0 24 24" style={{ color: C.field, opacity: 0.55 }}>{icon}</svg>
      </div>
      <div className="mt-2" style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, color: C.ink }}>{title}</div>
      <div className="mt-1.5" style={{ width: 22, height: 2, background: C.husk }} />
      <div className="mt-1.5" style={{ fontSize: 11, lineHeight: 1.5, color: C.mute }}>{sub}</div>
    </motion.div>
  );
}

const WF_ROW_STYLE = { display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr", columnGap: 8, alignItems: "stretch" };
const WF_CONNECTOR_STYLE = { display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr", columnGap: 8, margin: "2px 0" };
const WF_ARROW_CELL = { display: "flex", alignItems: "center", justifyContent: "center" };

function WorkflowStepper() {
  const grid = useBatchReveal(".wf-node", { stagger: 0.06 });
  const step = (i) => <WFCard n={i + 1} icon={WF_ICONS[i]} title={WORKFLOW_WHEAT[i][0]} sub={WORKFLOW_WHEAT[i][1]} />;
  return (
    <div className="workflow-stepper rounded-lg p-6 md:p-8" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      <div className="text-center pb-5" style={{ borderBottom: `2px solid ${C.field}` }}>
        <div className="wh-display" style={{ fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: ".01em" }}>
          CLEAN WHEAT RABI 2025-26 PROGRAM
        </div>
      </div>
      <div className="text-center mt-5">
        <div className="wh-data" style={{ fontSize: 13, fontWeight: 700, color: C.field, letterSpacing: 0.6 }}>
          MONITORING, TRACEABILITY &amp; ASSURANCE WORKFLOW
        </div>
      </div>

      <div ref={grid} className="mt-8" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
          <div style={WF_ROW_STYLE}>
            {step(0)}
            <div style={WF_ARROW_CELL}><WFArrow dir="right" /></div>
            {step(1)}
            <div style={WF_ARROW_CELL}><WFArrow dir="right" /></div>
            {step(2)}
          </div>

          <div style={WF_CONNECTOR_STYLE}>
            <div /><div /><div /><div />
            <div style={WF_ARROW_CELL}><WFArrow dir="down" /></div>
          </div>

          <div style={WF_ROW_STYLE}>
            {step(5)}
            <div style={WF_ARROW_CELL}><WFArrow dir="left" /></div>
            {step(4)}
            <div style={WF_ARROW_CELL}><WFArrow dir="left" /></div>
            {step(3)}
          </div>
        </div>
      </div>
    </div>
  );
}

function GovernanceSection() {
  const grid = useBatchReveal(".monitor-shot", { stagger: 0.08 });
  return (
    <Section id="governance">
      <SectionHead
        index="04"
        title="Programme Governance and Implementation"
        lede="Delivery ran through a layered implementation architecture. Strategic oversight sat with Grow Indigo's ClearHarvest Business team, keeping the programme aligned to ABC's sustainability objectives and reporting requirements."
      />

      <Reveal className="mt-8">
        <OrgChart />
      </Reveal>

      <Reveal delay={0.12} className="mt-8">
        <RoleAccordion />
      </Reveal>

      <div className="mt-16">
        <Eyebrow big>Monitoring, Reporting and Verification</Eyebrow>

        <div className="mt-8">
          <h4 className="wh-display text-lg" style={{ color: C.field, fontWeight: 700 }}>Monitoring and Measurement</h4>
          <p className="mt-3" style={{ fontSize: 16, lineHeight: 1.72, color: C.mute }}>
            Grow Indigo implemented a structured, phygital monitoring system that combined regular field-level
            observations with digital data capture to ensure accuracy, traceability and verification. Throughout
            the season, Kisan Advisors conducted periodic field visits to monitor crop growth, verify sustainable
            establishment practices, nutrient applications and update farmer diaries. Farmer
            information, field boundary geofencing and agronomy information (fertiliser, pesticide use,
            irrigation method) was recorded using the FieldKhatta application, ODK and farmer diaries. All mapped
            field boundaries were also quality-checked and verified using Remote Sensing to confirm spatial
            accuracy, consistency and no burning on the mapped fields. The agronomist and science team reviewed
            these records, performing quality checks on data accuracy, completeness and geolocation consistency
            to ensure reliable inputs for GHG accounting.
          </p>
          <div ref={grid} className="grid gap-4 grid-cols-2 sm:grid-cols-4 mt-6">
            {[monitoringApp1, monitoringApp3, monitoringApp4, monitoringApp5].map((src, i) => (
              <div key={i} className="monitor-shot">
                <PhotoSlot ratio="9 / 16" fit="contain" src={src} alt="Farmer onboarding, field-level data collection & supply chain audit trail" />
              </div>
            ))}
          </div>
          <div className="wh-data text-center mt-3" style={{ fontSize: 11, color: C.mute, fontStyle: "italic" }}>
            Farmer onboarding, field-level data collection &amp; supply chain audit trail
          </div>
          <Reveal delay={0.1} className="mt-8">
            <WorkflowStepper />
          </Reveal>
        </div>

        <div className="mt-14">
          <h4 className="wh-display text-lg" style={{ color: C.field, fontWeight: 700 }}>Traceability</h4>
          <p className="mt-3" style={{ fontSize: 16, lineHeight: 1.72, color: C.mute }}>
            Post harvest and during procurement, S3 Sutra enabled traceability of low-emission wheat from farm to
            processor. It captured the complete audit trail, documenting farmer validation, produce quantities, and
            movement of low-emission wheat. This integrated approach created a robust monitoring and verification
            system that delivered high-quality data, ensured credible traceability, and supported accurate GHG
            quantification aligned with ABC reporting requirements.
          </p>
          <Reveal delay={0.1} className="mt-6">
            <PhotoSlot className="max-w-md mx-auto" src={traceabilityFlow} alt="Node-to-node view, Farm-to-processor traceability flow" caption="Node-to-node view, Farm-to-processor traceability flow" />
          </Reveal>
        </div>

        <div className="mt-14">
          <h4 className="wh-display text-lg" style={{ color: C.field, fontWeight: 700 }}>Verification</h4>
          <div className="mt-3 space-y-4" style={{ fontSize: 16, lineHeight: 1.72, color: C.mute }}>
            <p>
              The program delivered measurable reductions in greenhouse gas emissions, water consumption, and
              fertilizer use through farmers' adoption of regenerative agricultural practices, including
              zero/reduced tillage and crop residue management.
            </p>
            <p>
              The reported outcomes were evaluated against the approved monitoring methodology through a review
              of monitoring records, farmer-level data, supporting documentation, and field-level evidence. The
              verification process assessed the completeness, consistency, accuracy, and traceability of the
              reported data and cross-checked the results against the established baseline.
            </p>
          </div>
          <Reveal delay={0.1} className="mt-6">
            <PullQuoteCard tone={C.field} label="Independently verified">
              The project and its reported outcomes were independently verified by the third-party auditor, One Peterson.
            </PullQuoteCard>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   11 · SECTION 05 - PROGRAMME JOURNEY
---------------------------------------------------------------------------- */
const JOURNEY_STEPS = [
  {
    n: "01", title: "Programme Kick-off", gallery: [journeyKickoff, journeyKickoff2],
    body: "The programme began with alignment on scope, geography and implementation requirements. Field identification and deployment of the programme team followed, establishing the operational base for farmer engagement and seasonal monitoring.",
  },
  {
    n: "02", title: "Village-Level Meetings", gallery: [journeyVlm1, journeyVlm2, journeyVlm3, journeyVlm4, journeyVlm5, journeyVlm6, journeyVlm7, journeyVlm8, journeyVlm9],
    body: "Several Village-Level Meetings (VLMs) were conducted during the programme period to strengthen farmer awareness, technical capacity and adoption of recommended practices under the ClearHarvest Wheat Programme. The sessions covered Zero Tillage and Reduced Tillage, crop residue management, balanced fertiliser application, integrated and responsible pest management, avoidance of harmful chemical categories, safe disposal of pesticide containers, efficient water and resource use, farmer record-keeping, responsible labour practices and programme participation requirements. Practical demonstrations included Zero Tillage machinery, farmer diaries and Leaf Colour Chart use, while field exposure and stakeholder interactions provided farmers with opportunities for hands-on learning, peer exchange and clarification of programme requirements. The meetings also reinforced awareness of low-carbon wheat production, sustainable procurement, the wider ClearHarvest sustainability programme and the Carbon Credit initiative, supporting practical adoption of improved practices at field level.",
  },
  {
    n: "03", title: "Farmer Diaries", gallery: [journeyFarmerDiary3],
    body: "Kisan Advisors supported farmers in maintaining agronomic and economic records. Farmer diaries captured field operations, input use and other information required for programme monitoring and quantification.",
  },
  {
    n: "04", title: "Quality test conducted by ABC", gallery: [journeyQualityTest1, journeyQualityTest2],
    body: "Prior to harvest, the ABC team collected representative wheat samples directly from programme fields and conducted pre-harvest quality and food-safety testing for pesticide residues, aflatoxins and other specified contaminants to assess compliance with applicable quality requirements.",
  },
  {
    n: "05", title: "Low-Emission Wheat procurement", gallery: [journeyLowCarbonWheat, journeyLowCarbonWheat2],
    body: "Following farmer engagement, field teams continued to record establishment practices, fertiliser use and crop-stage information through the season from the farm to processor.",
  },
  {
    n: "06", title: "Independent Third-Party audit", gallery: [journeyThirdPartyAudit, journeyThirdPartyAudit2],
    body: "OnePeterson independently reviewed the field evidence and digital records - geo-tagged boundaries, farmer diaries, practice verification and the procurement trail - testing whether the reductions claimed are attributable to the fields that produced them.",
  },
  {
    n: "07", title: "Quantification and Reporting", gallery: [journeyQuantification1, journeyQuantification2],
    body: "Grow Indigo quantified emissions on the Cool Farm Platform v3.0 using the square-root sample, then compiled this report. The assessment applied the GHG Protocol framework and IPCC guidelines. Results were reviewed and prepared for ABC's sustainability reporting.",
  },
];

function JourneySection() {
  const spineRef = useRef(null);
  const { scrollYProgress: spineProgress } = useScroll({ target: spineRef, offset: ["start 0.7", "end 0.3"] });
  return (
    <Section id="journey" tone="tint">
      <MoistureGauge />
      <SectionHead
        index="05"
        title="Programme Journey"
        lede="From programme confirmation to the final audit, each stage generates a verifiable record. Together these records form the evidence base for the programme's monitoring and quantification."
      />
      <div ref={spineRef} className="relative">
        <div
          className="hidden md:block absolute top-0 bottom-0"
          style={{ left: -28, width: 2, background: C.line }}
          aria-hidden="true"
        />
        <motion.div
          className="hidden md:block absolute top-0"
          style={{ left: -28, width: 2, height: "100%", background: C.field, scaleY: spineProgress, transformOrigin: "top" }}
          aria-hidden="true"
        />
        <div className="space-y-8">
        {JOURNEY_STEPS.map((step, i) => {
          const hasMedia = Boolean(step.img || step.gallery);
          const reverse = hasMedia && i % 2 === 1;
          return (
            <motion.div
              key={step.n}
              className="journey-step grid gap-6 md:grid-cols-5 items-stretch"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div
                className={hasMedia ? "md:col-span-3 p-7 rounded-lg" : "md:col-span-5 p-7 rounded-lg"}
                style={{ background: "#fff", border: `1px solid ${C.line}`, order: reverse ? 2 : 1 }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="wh-data" style={{ color: C.husk, fontWeight: 700, fontSize: 13 }}>{step.n} ·</span>
                  <h4 className="wh-display text-xl" style={{ color: C.ink, fontWeight: 700 }}>{step.title}</h4>
                </div>
                {step.place && (
                  <div className="wh-data mt-1.5" style={{ fontSize: 12.5, color: C.field, fontWeight: 600 }}>{step.place}</div>
                )}
                {step.body && (
                  <p className="mt-3" style={{ fontSize: 14, lineHeight: 1.72, color: C.mute }}>{step.body}</p>
                )}
              </div>
              {step.img && (
                <div className="md:col-span-2" style={{ order: reverse ? 1 : 2 }}>
                  <CursorFollow label={step.title}>
                    <PhotoSlot ratio="4 / 3" fit="contain" src={step.img} alt={step.title} />
                  </CursorFollow>
                </div>
              )}
              {step.gallery && (
                <div
                  className={`md:col-span-2 grid gap-2 h-full ${step.gallery.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}
                  style={{ order: reverse ? 1 : 2, gridAutoRows: "1fr" }}
                >
                  {step.gallery.map((src, gi) => (
                    <CursorFollow key={gi} label={step.title}>
                      <div
                        className="relative overflow-hidden rounded-lg h-full"
                        style={{ background: C.paperDim, border: `1px solid ${C.line}`, minHeight: 100 }}
                      >
                        <img
                          src={src}
                          alt={step.title}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                    </CursorFollow>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   12 · SECTION 06 - FARMER VOICES
---------------------------------------------------------------------------- */
const FARMER_VOICES = [
  { id: "v1", src: farmerVoice1 },
  { id: "v2", src: farmerVoice2 },
];

function VoiceCard({ v, index }) {
  return (
    <motion.div
      className="voice-card rounded-lg overflow-hidden"
      style={{ background: C.paperDim, border: `1px solid ${C.line}` }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="relative" style={{ aspectRatio: "4 / 3", background: C.ink }}>
        {v.src ? (
          <video
            src={v.src}
            controls={!PDF_EXPORT}
            playsInline
            // PDF export: the export script seeks each video to a
            // representative frame and prints that still - the native
            // play/scrub/mute chrome has no purpose on a printed page and
            // would otherwise be baked into the page as dead controls.
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div style={{ width: 58, height: 58, borderRadius: 99, background: "rgba(255,255,255,.1)", border: "1px dashed rgba(255,255,255,.3)", display: "grid", placeItems: "center" }}>
              <svg width="18" height="20" viewBox="0 0 18 20" fill="rgba(255,255,255,.4)"><path d="M0 0l18 10L0 20z" /></svg>
            </div>
            <div className="ch-data" style={{ fontSize: 9.5, color: "rgba(255,255,255,.4)", letterSpacing: ".12em" }}>
              VIDEO TO BE ADDED
            </div>
          </div>
        )}
      </div>
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="ch-data" style={{ fontSize: 10.5, color: C.mute, letterSpacing: ".1em" }}>
          FARMER VOICE
        </div>
        <div className="ch-data" style={{ fontSize: 22, color: C.line, fontWeight: 600, lineHeight: 1 }}>
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
}

function VoicesSection() {
  const grid = useBatchReveal(".voice-card", { stagger: 0.08 });
  return (
    <Section id="voices">
      <SectionHead index="06" title="Farmer Voices" />
      <Reveal>
        <p className="italic" style={{ fontSize: 15, color: C.mute }}>Recorded on-field during the season.</p>
      </Reveal>
      <div ref={grid} className="mt-6 grid gap-5 sm:grid-cols-2">
        {FARMER_VOICES.map((v, i) => <VoiceCard key={v.id} v={v} index={i} />)}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   14 · SECTION 08 - ONE PRACTICE, MULTIPLE RETURNS
   ("Tillage: One Establishment Change, Multiple Returns")
---------------------------------------------------------------------------- */
const RETURNS_GRID = [
  ["01", "More efficient wheat establishment", "Zero/Reduced tillage machinery enabled direct sowing through retained residue, reducing conventional preparatory operations."],
  ["02", "Responsible residue and soil management", "Residue retention provided an alternative to open-field burning, while avoiding repeated ploughing reduced soil disturbance."],
  ["03", "More efficient nitrogen application", "Recorded nitrogen use declined from XXS to XXS kg N/ha, a calculated reduction of XXS% against the ABC baseline."],
  ["04", "Lower modelled emission intensity", "The assessment recorded an average modelled emission reduction of XXS% per MT of wheat."],
  ["05", "Stronger farmer capability and field support", "Several village-level and technical sessions, supported by field advisory, reinforced practice adoption, crop management and record-keeping."],
  ["06", "Traceable and independently assured sourcing", "Digital field records, segregated procurement, audited sample farmers and Cool Farm Platform v3.0 quantification supported credible reporting."],
];

const PRACTICE_BIG_PICTURE = "Zero/Reduced Tillage is one establishment change with multiple connected benefits: fewer preparatory operations, retained crop residue, reduced soil disturbance, an alternative to open-field burning and lower tillage-related fuel use and emissions. Supported by optimised nitrogen application, farmer guidance and digital traceability, it provides a practical foundation for lower-carbon emission production.";

function PracticeSection() {
  const grid = useBatchReveal(".returns-card", { stagger: 0.08 });
  return (
    <Section id="practice">
      <SectionHead
        index="07"
        title="Tillage: One Establishment Change, Multiple Returns"
        lede="Using the ZT/RT practices, the wheat could be sown through retained residue without the conventional sequence of repeated land preparation. The practice reduced soil disturbance supported non-burning residue management and lowered the requirement for preparatory tractor operations."
      />
      <div ref={grid} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RETURNS_GRID.map(([n, title, body]) => (
          <div
            key={n}
            className="returns-card group relative p-6 rounded-lg transition-all duration-300 ease-out hover:-translate-y-4 hover:scale-[1.045] hover:z-10 hover:shadow-[0_28px_50px_-16px_rgba(201,138,46,0.55)]"
            style={{ background: C.paperDim, border: `1px solid ${C.line}` }}
          >
            <div className="wh-display" style={{ color: C.husk, fontWeight: 800, fontSize: "1.6rem" }}>{n}</div>
            <h4 className="wh-display mt-2" style={{ fontSize: 15.5, fontWeight: 700, color: C.ink }}>{title}</h4>
            <p
              className="mt-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-300"
              style={{ fontSize: 13, lineHeight: 1.6, color: C.mute }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   15 · PINNED STATEMENT - "The big picture" (Section 08's own callout, given
   the dramatic full-bleed pinned treatment the design system provides)
---------------------------------------------------------------------------- */
function PinnedStatement({ text }) {
  const scope = useGsapContext((self, el) => {
    const words = el.querySelectorAll(".pin-word");
    gsap.matchMedia().add(
      {
        desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        compact: "(max-width: 1023px), (prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions.desktop) {
          gsap
            .timeline({
              scrollTrigger: { trigger: el, start: "top top", end: "+=90%", pin: true, scrub: 0.5, anticipatePin: 1 },
            })
            .fromTo(words, { opacity: 0.14, filter: "blur(1px)" },
              { opacity: 1, filter: "blur(0px)", stagger: 0.08, ease: "none" });
        } else {
          gsap.fromTo(words, { opacity: 0.2 },
            { opacity: 1, stagger: 0.03, duration: 0.5, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
        }
      }
    );
  }, []);

  return (
    <div ref={scope} className="wh-pin-block flex items-center justify-center px-5" style={{ minHeight: "60vh", background: C.field }}>
      <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
        <Eyebrow color={C.husk} big>The big picture</Eyebrow>
        <p className="mt-6" style={{ fontFamily: FONT_QUOTE, fontStyle: "italic", color: "#fff", fontWeight: 500, fontSize: "clamp(1.4rem,3vw,2.4rem)", lineHeight: 1.35 }}>
          {text.split(" ").map((w, i) => (
            <span key={i} className="pin-word" style={{ display: "inline-block", marginRight: "0.28em" }}>{w}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   16 · SECTION 09 - SAMPLED. QUANTIFIED. AUDITED.
---------------------------------------------------------------------------- */
const PIPELINE = ["Data Collection", "Independent Audit", "GHG Impact Calculation"];
const PIPELINE_ICONS = [ICON_CLIPBOARD, ICON_SHIELD_CHECK, ICON_CHART];
const PIPELINE_COLORS = [C.field, C.inkSoft, C.husk];

const AUDIT_TABLE = [
  ["Data Collection", "Field-level agronomy data was digitally recorded by enrolled farmers via the FieldKhatta/ ODK application at each key intervention event.", "XXS wheat farmers participated across Ludhiana and Faridkot districts."],
  ["Independent Audit", "One Peterson conducted on-site field visits to a statistically representative sample of enrolled farms, verifying recorded data against observed practices.", "XXS randomly selected farmers were independently audited and verified."],
  ["GHG Impact Calculation", "Emission reductions were quantified using the Cool Farm Platform v3.0, applying GHG Protocol and IPCC guidelines.", "Results validated for ABC sustainability reporting."],
];

function PipelineSteps() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3">
      {PIPELINE.map((label, i) => (
        <React.Fragment key={label}>
          <motion.div
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-5 rounded text-center"
            style={{ background: PIPELINE_COLORS[i], color: "#fff", fontWeight: 700, fontSize: 15 }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" style={{ opacity: 0.85, flexShrink: 0 }}>{PIPELINE_ICONS[i]}</svg>
            {label}
          </motion.div>
          {i < PIPELINE.length - 1 && (
            <div className="hidden sm:flex items-center justify-center" style={{ color: C.mute, fontSize: 20 }}>→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** Waterfall bar charts - Recharts, mounted on viewport entry so their own
 *  draw animation doubles as the scroll reveal. Ported from ClearHarvest.jsx
 *  (the rice report) so both reports render this figure in the same visual
 *  language; only the underlying wheat data and copy changed. */
/** Turns a sequence of "total" (absolute) and "delta" (change from the
 *  running total) steps into floating-bar rows: `base`/`top` mark where the
 *  segment starts and ends, `height` is its span - so a delta bar hangs
 *  between the two totals it connects instead of rising from zero. */
function buildWaterfall(steps) {
  let cumulative = 0;
  return steps.map((s) => {
    if (s.type === "total") {
      cumulative = s.value;
      return { ...s, base: 0, height: s.value, top: s.value };
    }
    const start = cumulative;
    cumulative += s.value;
    const base = Math.min(start, cumulative);
    const top = Math.max(start, cumulative);
    return { ...s, base, top, height: top - base };
  });
}

function waterfallLabel(row) {
  return "XXS";
}

function waterfallLabelContent(data) {
  return ({ x, y, width, index }) => (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" style={{ fontSize: 12, fontFamily: FONT_DATA, fill: C.ink, fontWeight: 600 }}>
      {waterfallLabel(data[index])}
    </text>
  );
}

/** Custom XAxis tick factory: renders the rotated category label as usual, and for
 *  categories present in the given pct map, circles a percentage callout beneath it -
 *  sits under the axis so it reads as an annotation, not a chart value. Each chart
 *  gets its own map since bar names ("Reduction", "Project") repeat across charts. */
function makeWaterfallAxisTick(pctMap) {
  return function waterfallAxisTick({ x, y, payload }) {
    const pct = pctMap[payload.value];
    return (
      <g>
        <text x={x} y={y + 9} textAnchor="end" transform={`rotate(-12, ${x}, ${y + 9})`} style={{ fontSize: 11, fill: C.mute, fontFamily: FONT_DATA }}>
          {payload.value}
        </text>
        {pct && (
          <g transform={`translate(${x}, ${y + 40})`}>
            <circle r={18} fill="none" stroke={C.field} strokeWidth={1.6} />
            <text textAnchor="middle" dy={4} style={{ fontSize: 11, fontWeight: 700, fill: C.field, fontFamily: FONT_DATA }}>
              {pct}
            </text>
          </g>
        )}
      </g>
    );
  };
}

const EMISSIONS_AXIS_TICK = makeWaterfallAxisTick({ "Reduction": "XX%" });
const NITROGEN_AXIS_TICK = makeWaterfallAxisTick({ "Reduction": "XX%" });
const WATER_AXIS_TICK = makeWaterfallAxisTick({ "Saving": "XX%" });

/** Draws only the [base, top] slice of the bar - recharts positions this
 *  shape as if it were a full bar for `top`, so we shorten it from the same
 *  top edge down to `height` px instead of letting it run to the axis. */
function WaterfallBarShape({ x, y, width, height, payload }) {
  const pxPerUnit = payload.top > 0 ? height / payload.top : 0;
  const segHeight = Math.max(payload.height * pxPerUnit, 1);
  const r = Math.min(4, segHeight / 2, width / 2);
  return (
    <path
      d={`M${x},${y + segHeight} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + segHeight} Z`}
      fill={payload.fill}
    />
  );
}

const EMISSIONS_WATERFALL = buildWaterfall([
  { name: "Baseline", type: "total", value: 425, fill: C.mute, note: "ABC's declared baseline, kg CO₂e per MT of wheat" },
  { name: "Reduction", type: "delta", value: -65, fill: C.leaf, note: "XXS kg CO₂e/MT of wheat lower - a ~XXS% reduction" },
  { name: "Project", type: "total", value: 360, fill: C.field, note: "Modelled programme emissions intensity - the XXS% headline result. Removals of -XXS kg CO₂e/MT of wheat via soil organic carbon add to this on top." },
]);

const NITROGEN_WATERFALL = buildWaterfall([
  { name: "Baseline", type: "total", value: 187, fill: C.mute, note: "ABC's baseline nitrogen application rate" },
  { name: "Reduction", type: "delta", value: -64, fill: C.leaf, note: "XXS kg N/ha lower - a ~XXS% reduction against baseline" },
  { name: "Project", type: "total", value: 123, fill: C.field, note: "Average nitrogen application recorded under the programme" },
]);

const WATER_WATERFALL = buildWaterfall([
  { name: "Baseline", type: "total", value: 1410, fill: C.mute, note: "Grow Indigo baseline irrigation water use, m³ per ha" },
  { name: "Saving", type: "delta", value: -649, fill: C.waterDeep, note: "XXS m³/ha lower - a ~XXS% reduction against baseline" },
  { name: "Project", type: "total", value: 761, fill: C.water, note: "Irrigation water use recorded under the programme" },
]);

function ChartTip({ active, payload, unit }) {
  return (
    <AnimatePresence>
      {active && payload && payload.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="rounded p-3"
          style={{ background: C.ink, maxWidth: 260, boxShadow: "0 20px 40px -24px rgba(0,0,0,.6)" }}
        >
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{payload[0].payload.name}</div>
          <div className="wh-display" style={{ color: payload[0].payload.fill, fontWeight: 800, fontSize: 22, marginTop: 2 }}>
            XXS{" "}
            <span style={{ fontSize: 11, fontWeight: 500 }}>{unit}</span>
          </div>
          <div className="wh-data" style={{ color: "rgba(255,255,255,.62)", fontSize: 10.5, lineHeight: 1.6, marginTop: 6 }}>
            {payload[0].payload.note}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChartFrame({ title, unit, kicker, icon, children, height = 320, footnote, printNotes = [] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const showChart = PDF_EXPORT || inView;
  return (
    <motion.div
      ref={ref}
      className="chart-frame p-6 md:p-7 rounded-lg h-full"
      style={{ background: "#fff", border: `1px solid ${C.line}` }}
      initial={{ opacity: 0, y: 30 }}
      animate={showChart ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={{ boxShadow: "0 24px 48px -32px rgba(10,31,22,.5)" }}
    >
      <div className="flex items-center gap-2.5">
        {icon && <IconBadge icon={icon} color={C.field} size={30} />}
        <Eyebrow>{kicker}</Eyebrow>
      </div>
      <h4 className="wh-display mt-3 text-xl md:text-2xl" style={{ color: C.field, fontWeight: 700 }}>{title}</h4>
      <div className="wh-data mt-1" style={{ fontSize: 11, color: C.mute }}>{unit}</div>
      <div className="chart-plot" style={{ height, marginTop: 18 }}>
        {showChart && <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>}
      </div>
      {footnote && (
        <div className="wh-data mt-3 pt-3" style={{ fontSize: 10.5, color: C.mute, lineHeight: 1.6, borderTop: `1px solid ${C.line}` }}>
          {footnote}
        </div>
      )}
      {printNotes.length > 0 && (
        <ul className="print-only chart-print-notes">
          {printNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
    </motion.div>
  );
}

const chartAxisStyle = { fontSize: 11, fill: C.mute, fontFamily: FONT_DATA };

const WHEAT_SEASON_HEADLINE = [
  {
    label: "GHG reduction", value: 15, prefix: "~ ", suffix: "%", tone: C.field, icon: ICON_CO2,
    detail: [
      ["XXS", "kg CO₂e/MT of wheat removed · net sink, on top of the reduction"],
      ["XXS", "kg CO₂e/MT of wheat cut · XXS → XXS, vs. ABC baseline"],
    ],
  },
  {
    label: "Water saved", value: 46, prefix: "~ ", suffix: "%", tone: C.water, icon: ICON_WATER,
    detail: [
      ["XXS", "m³/ha · vs. Grow Indigo baseline"],
    ],
  },
  {
    label: "Less nitrogen", value: 34, prefix: "~ ", suffix: "%", tone: C.husk, icon: ICON_NITROGEN,
    detail: [
      ["XXS", "kg N/ha · vs. ABC baseline"],
    ],
  },
];

function SeasonHeadlineResults() {
  return (
    <div className="mb-10 md:mb-12">
      <Eyebrow color={C.husk} big>Season headline results</Eyebrow>
      <div className="grid gap-5 sm:grid-cols-3 mt-4">
        {WHEAT_SEASON_HEADLINE.map((s) => (
          <motion.div
            key={s.label}
            variants={vFadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="headline-card p-6 rounded-lg h-full"
            style={{ background: s.detail ? C.ink : "#fff", border: s.detail ? "none" : `1px solid ${C.line}` }}
          >
            <IconBadge icon={s.icon} color={s.detail ? "#fff" : s.tone} />
            <div className="wh-display mt-3" style={{ color: s.detail ? "#fff" : s.tone, fontWeight: 800, fontSize: "clamp(2rem,4.4vw,2.6rem)" }}>
              {s.prefix}XXS{s.suffix}
            </div>
            <div className="mt-1" style={{ fontWeight: 600, fontSize: 14.5, color: s.detail ? "rgba(255,255,255,.85)" : C.ink }}>{s.label}</div>
            {s.detail && (
              <div className="mt-4 space-y-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}>
                {s.detail.map(([v, l]) => (
                  <div key={v} className="wh-data" style={{ fontSize: 10.5, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>
                    <span style={{ color: C.leaf, fontWeight: 700 }}>{v}</span> {l}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AuditedSection() {
  return (
    <Section id="audited" tone="tint">
      <SectionHead index="08" title="Sampled. Quantified. Audited." lede="Carbon Accounting and Audit Pipeline: digital field-data collection, independent third-party audit, and GHG calculation." />
      <Reveal><PipelineSteps /></Reveal>

      <Reveal delay={0.12} className="mt-10">
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <div className="hidden md:grid grid-cols-3" style={{ background: C.field }}>
            {["Step", "What We Did", "Key Facts"].map((h) => (
              <div key={h} className="px-5 py-3" style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{h}</div>
            ))}
          </div>
          {AUDIT_TABLE.map(([step, did, facts], i) => (
            <div key={step} className="audit-row grid md:grid-cols-3" style={{ borderTop: i ? `1px solid ${C.line}` : "none", background: i % 2 ? C.paperDim : "#fff" }}>
              <div className="px-5 py-4" style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{step}</div>
              <div className="px-5 py-4 wh-justify" style={{ fontSize: 13.5, lineHeight: 1.65, color: C.mute }}>{did}</div>
              <div className="px-5 py-4 wh-justify" style={{ fontSize: 13.5, lineHeight: 1.65, color: C.field, fontWeight: 600 }}>{facts}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <SeasonHeadlineResults />
      </Reveal>

      <div className="audit-charts-grid grid gap-5 lg:grid-cols-2">
        <ChartFrame
          kicker="Emissions intensity"
          printNotes={EMISSIONS_WATERFALL.map(({ note }) => note)}
          icon={ICON_CO2}
          title="XXS% less carbon in every tonne"
          unit="kg CO₂e per MT of wheat"
          height={360}
          footnote="The project achieved a XXS% reduction in emissions compared to the ABC baseline, alongside removals of -XXS kg CO₂e/MT of wheat via soil organic carbon (not shown on this chart)."
        >
          <BarChart data={EMISSIONS_WATERFALL} margin={{ top: 10, right: 10, left: -12, bottom: 46 }}>
            <XAxis dataKey="name" tick={EMISSIONS_AXIS_TICK} interval={0} height={66} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} domain={[0, 500]} tickFormatter={() => "XXS"} />
            <Tooltip content={<ChartTip unit="kg CO₂e/MT of wheat" />} cursor={{ fill: "rgba(14,91,51,.06)" }} />
            <Bar dataKey="top" shape={WaterfallBarShape} animationDuration={1400} animationEasing="ease-out">
              <LabelList dataKey="top" content={waterfallLabelContent(EMISSIONS_WATERFALL)} />
            </Bar>
          </BarChart>
        </ChartFrame>

        <ChartFrame
          kicker="Nitrogen use"
          printNotes={NITROGEN_WATERFALL.map(({ note }) => note)}
          icon={ICON_NITROGEN}
          title="Less fertiliser, same crop"
          unit="kg nitrogen per ha"
          height={360}
          footnote="Average nitrogen application decreased from XXS to XXS kg N/ha under the programme, a reduction of XXS kg N/ha, or approximately XXS% against the ABC baseline."
        >
          <BarChart data={NITROGEN_WATERFALL} margin={{ top: 10, right: 10, left: -12, bottom: 46 }}>
            <XAxis dataKey="name" tick={NITROGEN_AXIS_TICK} interval={0} height={66} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} domain={[0, 220]} tickFormatter={() => "XXS"} />
            <Tooltip content={<ChartTip unit="kg N/ha" />} cursor={{ fill: "rgba(14,91,51,.06)" }} />
            <Bar dataKey="top" shape={WaterfallBarShape} animationDuration={1400} animationBegin={200}>
              <LabelList dataKey="top" content={waterfallLabelContent(NITROGEN_WATERFALL)} />
            </Bar>
          </BarChart>
        </ChartFrame>
        <div className="audit-water-wrapper lg:col-span-2 lg:w-1/2 lg:mx-auto lg:pl-2.5">
          <ChartFrame
            kicker="Irrigation water use"
            printNotes={WATER_WATERFALL.map(({ note }) => note)}
            icon={ICON_WATER}
            title="XXS% less water per hectare"
            unit="m³ per ha"
            height={320}
            footnote="Because of adoption of sustainable practices like ZT/RT, irrigation water use decreased from XXS to XXS m³/ha under the programme, a reduction of XXS m³/ha, or approximately XXS% Vs Grow Indigo baseline."
          >
            <BarChart data={WATER_WATERFALL} margin={{ top: 10, right: 10, left: -12, bottom: 46 }}>
              <XAxis dataKey="name" tick={WATER_AXIS_TICK} interval={0} height={66} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} domain={[0, 1600]} tickFormatter={() => "XXS"} />
              <Tooltip content={<ChartTip unit="m³/ha" />} cursor={{ fill: "rgba(30,136,168,.07)" }} />
              <Bar dataKey="top" shape={WaterfallBarShape} animationDuration={1400}>
                <LabelList dataKey="top" content={waterfallLabelContent(WATER_WATERFALL)} />
              </Bar>
            </BarChart>
          </ChartFrame>
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   17 · SECTION 10 - ACTIVITY TIMELINE
   A real scroller, not a photo: GSAP pins this card in place (same
   ScrollTrigger pin used by PinnedStatement elsewhere in this file) for one
   long scroll, so the reader stays put and watches the field grow instead of
   the plant growing while the page also scrolls past it. Every value below -
   stalk height, colour, whether the ears have formed, which month is
   "current" - is driven off that one pinned scroll fraction, updated
   imperatively (not via React state) so it stays smooth at 60fps.
---------------------------------------------------------------------------- */
const ACTIVITY_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const ACTIVITY_EVENTS = [
  { month: 0.8, label: "Reduced Tillage", color: C.leaf },
  { month: 1.2, label: "↓ DAP", color: C.water },
  { month: 2, label: "↓ Urea", color: C.husk },
  { month: 3, label: "↓ Urea", color: C.husk },
  { month: 4, label: "↓ Urea", color: C.husk },
  { month: 6, label: "Harvest", color: C.field },
];
const ACTIVITY_STALK_COUNT = 5;

/* A flat, filled wheat ear - plump almond-shaped kernels in facing pairs
   up a central rachis, tapering to a single tip kernel and a short bristle -
   instead of the thin line-spike (and, before that, the plain ellipse
   "grain") this used to be. One shared shape, reused at full scale here in
   the Activity Timeline and scaled down for the hero field below. */
const WHEAT_KERNEL_PATH = "M0,0 C-3.4,-1.6 -3.8,-5.6 0,-9.4 C3.8,-5.6 3.4,-1.6 0,0 Z";
const WHEAT_KERNEL_LEVELS = [
  { y: 6, x: 6.0, rot: 24 }, { y: 1, x: 6.3, rot: 22 }, { y: -4, x: 6.0, rot: 19 },
  { y: -9, x: 5.2, rot: 15 }, { y: -14, x: 4.0, rot: 11 }, { y: -18, x: 2.6, rot: 7 },
];
function WheatEar({ className, scale = 1, fill = C.husk, stroke = C.clay, opacity }) {
  return (
    <g className={className} opacity={opacity}>
      <g transform={scale !== 1 ? `scale(${scale})` : undefined}>
        <line x1="0" y1="8" x2="0" y2="-19" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
        <line x1="0" y1="-19" x2="0" y2="-24" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" />
        {WHEAT_KERNEL_LEVELS.map(({ y, x, rot }, i) => (
          <g key={i}>
            <path d={WHEAT_KERNEL_PATH} transform={`translate(${-x}, ${y}) rotate(${-rot})`} fill={fill} stroke={stroke} strokeWidth="0.5" />
            <path d={WHEAT_KERNEL_PATH} transform={`translate(${x}, ${y}) rotate(${rot})`} fill={fill} stroke={stroke} strokeWidth="0.5" />
          </g>
        ))}
        <path d={WHEAT_KERNEL_PATH} transform="translate(0,-21) scale(0.55)" fill={fill} stroke={stroke} strokeWidth="0.5" />
      </g>
    </g>
  );
}

function ActivityTimelineScroller() {
  const nMonths = ACTIVITY_MONTHS.length - 1;

  const scope = useGsapContext((self, el) => {
    const cluster = el.querySelector(".at-cluster");
    const stalks = el.querySelectorAll(".at-stalk-path");
    const ears = el.querySelectorAll(".at-ear");
    const monthEls = el.querySelectorAll(".at-month");
    const mid = (ACTIVITY_STALK_COUNT - 1) / 2;

    const render = (p) => {
      const h = 8 + p * 100;
      const earStart = 0.62, earEnd = 0.74;
      const earOpacity = p < earStart ? 0 : p < earEnd ? (p - earStart) / (earEnd - earStart) : 1;
      const bladeOpacity = p < 0.05 ? p / 0.05 : 1;
      const goldT = Math.max(0, Math.min(1, (p - 0.72) / 0.28));
      const color = gsap.utils.interpolate(C.leaf, C.husk, goldT);
      const xPct = 4 + p * 92;

      if (cluster) cluster.style.left = `${xPct}%`;
      stalks.forEach((path, i) => {
        const variance = (i - mid) * 5;
        const hh = Math.max(5, h + variance);
        path.setAttribute("d", `M0 0 Q${variance * 0.2} ${-hh * 0.55} 0 ${-hh}`);
        path.setAttribute("stroke", color);
        path.style.opacity = bladeOpacity;
      });
      ears.forEach((ear, i) => {
        const variance = (i - mid) * 5;
        const hh = Math.max(5, h + variance);
        ear.setAttribute("transform", `translate(0, ${-hh - 7})`);
        ear.style.opacity = earOpacity;
      });

      const monthIndex = p * nMonths;
      monthEls.forEach((elm, i) => {
        const isNear = Math.abs(monthIndex - i) < 0.5;
        elm.style.color = isNear ? C.field : C.mute;
        elm.style.fontWeight = isNear ? "800" : "700";
      });
    };

    render(PDF_EXPORT ? 1 : 0);

    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self2) => render(self2.progress),
      });
    });
  }, []);

  return (
    <div ref={scope} className="activity-timeline rounded-lg overflow-hidden" style={{ background: C.paperDim, border: `1px solid ${C.line}` }}>
      <div className="w-full px-6 md:px-10 py-10 md:py-14" style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* events row - each badge sits at its month's x position */}
        <div className="relative mt-8" style={{ height: 64 }}>
          {ACTIVITY_EVENTS.map((e, i) => (
            <div
              key={i}
              className="wh-data absolute -translate-x-1/2 px-2.5 py-1.5 rounded whitespace-nowrap"
              style={{
                left: `${(e.month / nMonths) * 92 + 4}%`,
                top: i % 2 ? 0 : undefined,
                bottom: i % 2 ? undefined : 0,
                background: e.color,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 6px 14px -6px rgba(10,31,22,.35)",
              }}
            >
              {e.label}
            </div>
          ))}
        </div>

        {/* the field - a horizon line and a cluster of stalks growing as one, sliding across it */}
        <div className="relative mt-12" style={{ height: 260 }}>
          <div className="absolute left-0 right-0" style={{ bottom: 0, height: 1, background: C.line }} />
          <div className="at-cluster absolute" style={{ bottom: 0, transform: "translateX(-50%)" }}>
            <svg width="140" height="230" viewBox="0 0 140 230" aria-hidden="true">
              <rect x="10" y="222" width="120" height="8" rx="3" fill={C.clay} opacity="0.35" />
              {Array.from({ length: ACTIVITY_STALK_COUNT }).map((_, i) => (
                <g key={i} transform={`translate(${20 + i * 25}, 222)`}>
                  <path className="at-stalk-path" d="M0 0 Q0 0 0 0" stroke={C.leaf} strokeWidth="3" fill="none" strokeLinecap="round" />
                  <WheatEar className="at-ear" opacity="0" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* month labels - the one nearest the current scroll fraction is highlighted */}
        <div className="relative mt-6 flex justify-between">
          {ACTIVITY_MONTHS.map((m) => (
            <div key={m} className="at-month wh-data text-center" style={{ width: `${100 / ACTIVITY_MONTHS.length}%`, fontSize: 13, fontWeight: 700, color: C.mute }}>
              {m.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineSection() {
  return (
    <Section id="timeline">
      <div className="timeline-visual-group">
        <SectionHead
          index="09"
          title="Activity Timeline"
          lede="The wheat programme followed the crop production cycle from pre-sowing through sowing and establishment to maturity and harvest, with agronomic operations, regenerative interventions and nutrient applications aligned to each key growth stage."
        />

        <ActivityTimelineScroller />
      </div>

      <Reveal delay={0.1} className="mt-12 space-y-5" style={{ fontSize: 14.5, lineHeight: 1.75, color: C.mute }}>
        <p>
          Sowing took place during Mid October to mid November. Farmers applied a basal dose of Di-Ammonium
          Phosphate (DAP) fertilizer at the time of seed sowing alongside early pre-emergent herbicides (Axial,
          Leader, or Sensor). Top-dressing of urea applications followed at approximately XXS DAS and XXS DAS. Once
          the crop reached maturity, harvesting, procurement, and supply chain traceability documentation were
          completed, followed by greenhouse gas (GHG) quantification.
        </p>
        <p>
          For participating farms, the adopted practices resulted in emissions
          of XXS kg CO₂e/MT of wheat produced. This reflects a XXS% reduction compared to ABC's baseline
          emissions, in addition to achieving carbon removals of XXS kg CO₂e/MT of wheat.
        </p>
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   18 · SECTION 11 - WHAT IT MEANT FOR THE FARMER
---------------------------------------------------------------------------- */
const SHORT_TERM = [
  ["Lower labour and establishment costs", "The ZT/RT practice reduced repeated land-preparation operations, lowering tractor use, fuel consumption, labour requirements, and overall wheat establishment costs."],
  ["Fertiliser savings", "Guided nutrient management reduced nitrogen application from XXS kg N/ha to XXS kg N/ha, saving XXS kg N/ha and lowering fertiliser expenditure without attributing the reduction to biological inputs."],
  ["Water savings", "Direct sowing under retained residue helped conserve soil moisture and reduced the need for irrigation during crop establishment, contributing to lower pumping and irrigation costs."],
  ["Reduced residue-management costs", "Retaining and sowing through crop residue provided an alternative to burning and avoided additional labour and machinery costs associated with residue removal or disposal."],
  ["Improved input-use efficiency", "Regular field-team guidance helped farmers apply fertiliser and irrigation more judiciously, supporting immediate savings in labour, water, and production inputs."],
];

const LONG_TERM = [
  ["Reduced soil erosion and land degradation", "Maintaining residue cover and minimising tillage can protect the soil surface from wind and water erosion, helping conserve fertile topsoil and maintain long-term land productivity."],
  ["Improved soil health", "Continued Zero Tillage and residue retention can gradually improve soil structure, organic matter, biological activity and nutrient cycling, supporting more productive and resilient soils over time."],
  ["Better soil moisture retention", "Reduced soil disturbance and retained crop residue can limit surface evaporation and improve moisture conservation, helping maintain water availability for the wheat crop during dry periods."],
  ["Improved water-use efficiency", "Over successive seasons, better soil structure and moisture retention can reduce dependence on frequent irrigation and improve the efficiency of water used for wheat production."],
  ["Lower environmental footprint", "Reduced tillage operations, more efficient fertiliser use and improved residue management can contribute to lower fuel use, nutrient losses and greenhouse-gas emissions across successive wheat seasons."],
  ["Stronger market access", "Traceable, low-carbon wheat opens premium procurement linkages with sustainability-focused buyers like ABC."],
];

function CheckList({ items, color }) {
  return (
    <div className="space-y-5">
      {items.map(([title, body]) => (
        <div key={title} className="flex gap-3">
          <span
            className="inline-flex items-center justify-center rounded-full flex-none"
            style={{ width: 22, height: 22, marginTop: 1, background: `${color}17`, color }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path d="M4 12.5l5 5.5L20 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>{title}</div>
            <p className="mt-1" style={{ fontSize: 13.5, lineHeight: 1.62, color: C.mute }}>{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FarmerImpactSection() {
  return (
    <Section id="farmerimpact" tone="tint">
      <SectionHead
        index="10"
        title="What It Meant for the Farmer"
        lede="The project strengthened farm economics through immediate cost savings and longer-term productivity gains from regenerative practice."
      />
      <div className="impact-grid grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="impact-card p-7 rounded-lg h-full" style={{ background: "#fff", border: `1px solid ${C.line}`, borderTop: `3px solid ${C.field}` }}>
            <h4 className="wh-display text-lg mb-6" style={{ color: C.field, fontWeight: 700 }}>Short-term impact</h4>
            <CheckList items={SHORT_TERM} color={C.field} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="impact-card p-7 rounded-lg h-full" style={{ background: "#fff", border: `1px solid ${C.line}`, borderTop: `3px solid ${C.leaf}` }}>
            <h4 className="wh-display text-lg mb-6" style={{ color: C.leaf, fontWeight: 700 }}>Long-term impact</h4>
            <CheckList items={LONG_TERM} color={C.leaf} />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   19 · SECTION 12 - MAPPED TO ABC'S RESPONSIBLE SOURCING STANDARD
---------------------------------------------------------------------------- */
const SOURCING_PILLARS = [
  ["Pillar 01", "Climate Action & Net Zero", "Zero Tillage machinery reduces conventional preparatory operations; optimised nitrogen use (~XXS% below baseline) lowers application-linked emissions. The project achieved a XXS% reduction in emissions compared to the baseline, alongside net carbon removals of -XXS kgCO2e/MT: a field-recorded Scope 3 contribution.", C.husk, ICON_CO2],
  ["Pillar 02", "Water Stewardship & Livelihoods", "Optimised irrigation delivers ~XXS% water savings against Grow Indigo's baseline; farmer training and pest-management guidance support informed, resource-efficient decisions.", C.water, ICON_WATER],
  ["Pillar 03", "Land, Forests & Biodiversity", "Zero Tillage machinery provides an alternative to open-field residue burning; soil sampling supports future soil-health assessment.", C.leaf, ICON_TREE],
  ["Pillar 04", "Transparency & traceability", "Onboarding, geofencing and farmer diaries build a recorded, audit-ready trail; One Peterson provides independent review.", C.clay, ICON_SHIELD_CHECK],
];

function SourcingSection() {
  const grid = useBatchReveal(".pillar-card", { stagger: 0.08 });
  const [hovered, setHovered] = useState(null);
  return (
    <Section id="sourcing" tone="dark">
      <SectionHead
        index="11"
        tone="dark"
        title="Mapped to ABC's Responsible Sourcing Standard"
        lede="The standard sets out how the supply chain is expected to operate - environmental performance, human-rights protection, traceability and farmer livelihoods. Every intervention deployed in Ludhiana and Faridkot maps onto a pillar, and every metric here supports ABC's Responsible Sourcing."
      />
      <div ref={grid} className="grid gap-4 sm:grid-cols-2">
        {SOURCING_PILLARS.map(([pillar, name, body, color, icon]) => {
          const isHovered = hovered === pillar;
          return (
            <motion.div
              key={pillar}
              className="pillar-card relative p-6 rounded-lg"
              onMouseEnter={() => setHovered(pillar)}
              onMouseLeave={() => setHovered((h) => (h === pillar ? null : h))}
              animate={{ y: isHovered ? -10 : 0, scale: isHovered ? 1.035 : 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{
                background: isHovered ? `linear-gradient(rgba(20,15,8,.32), rgba(20,15,8,.32)), ${color}` : "rgba(255,255,255,.04)",
                border: `1px solid ${isHovered ? color : color + "40"}`,
                borderTop: `3px solid ${color}`,
                boxShadow: isHovered ? `0 14px 28px -12px ${color}80` : "0 0 0 rgba(0,0,0,0)",
                zIndex: isHovered ? 10 : 1,
                transition: "background .3s ease, border-color .3s ease, box-shadow .3s ease",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="wh-data"
                  style={{ color: isHovered ? "#fff" : color, fontWeight: 700, fontSize: 12, letterSpacing: ".1em", transition: "color .3s ease" }}
                >
                  {pillar.toUpperCase()}
                </div>
                <div
                  className="inline-flex items-center justify-center rounded-full flex-none"
                  style={{ width: 32, height: 32, background: isHovered ? "rgba(255,255,255,.18)" : `${color}22`, color: isHovered ? "#fff" : color, transition: "background .3s ease, color .3s ease" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">{icon}</svg>
                </div>
              </div>
              <h4 className="wh-display mt-3 text-lg" style={{ color: "#fff", fontWeight: 700 }}>{name}</h4>
              <p
                className={isHovered ? "mt-3" : "mt-3 line-clamp-2"}
                style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,.85)", transition: "color .3s ease" }}
              >
                {body}
              </p>
            </motion.div>
          );
        })}
      </div>
      <Reveal delay={0.15} className="mt-10">
        <PullQuoteCard tone={C.husk} dark label="Insight">
          Zero/Reduced Tillage and optimised fertiliser use can reduce field operations, fuel consumption and
          input requirements, improving overall production efficiency. Continued adoption can also support
          better soil structure, enhanced moisture retention and greater resilience to water stress, while
          reducing residue burning and the overall environmental footprint of wheat cultivation.
        </PullQuoteCard>
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   20 · SECTION 13 - FIELD EVIDENCE
---------------------------------------------------------------------------- */
const ANNEXURES = [
  ["Annexure 1", "Zero/Reduced Tillage field", annexureZtField, "Uniform crop rows and retained surface residue indicate field-level adoption of Zero/Reduced Tillage practices."],
  ["Annexure 2", "Village-level meetings with farmers", annexureVlm, "Farmers attending a VLM with the field team."],
  ["Annexure 3", "Farmer diary", annexureLandPrepSowing, "Land preparation and sowing register recording date of work, field ID, regenerative acres, sowing method, equipment used, time taken, fuel consumption and cost per acre."],
  ["Annexure 4", "Weekly WhatsApp messages sent to farmers", [annexureWhatsapp, annexureWhatsapp2], "Videos and visual infographics on Zero/Reduced Tillage, crop residue management and balanced fertiliser use in vernacular language were shared through weekly WhatsApp messages. The advisories also reinforced integrated pest management, responsible chemical use, farmer-diary maintenance and safe labour practices"],
  ["Annexure 5", "Harvest in Action", [annexureHarvest, annexureHarvest2], "Geotagged documentation of mechanised wheat harvesting at a programme field prior to programme procurement and traceability activities."],
  ["Annexure 6", "Grains ready to be transported", annexureGrains, "Harvested low-carbon programme wheat being weighed and packed in separate, clearly identifiable white bags."],
  ["Annexure 7", "Independent third-party audit", annexureAudit, "Third Party auditor in field with the Grow Indigo team and participating farmers."],
];

function EvidenceSection() {
  const grid = useBatchReveal(".annexure-card", { stagger: 0.07 });
  return (
    <Section id="evidence">
      <SectionHead
        index="12"
        title="Field Evidence"
        lede="The annexures below document field-level evidence, monitoring data and operational records collected throughout the project period - each one geo-tagged and dated at the point of capture."
      />
      <div ref={grid} className="evidence-grid grid gap-6 sm:grid-cols-2">
        {ANNEXURES.map(([tag, title, src, caption]) => {
          const srcs = Array.isArray(src) ? src : [src];
          // An array of captions pairs one caption per photo. A single shared
          // string means the photos describe the same thing - show it once
          // below the whole gallery instead of repeating it under each photo.
          const perPhotoCaptions = Array.isArray(caption) ? caption : null;
          const sharedCaption = perPhotoCaptions ? null : caption;
          return (
            <div key={tag} className="annexure-card">
              <Eyebrow>{tag}</Eyebrow>
              <h4 className="wh-display mt-1 text-lg" style={{ color: C.ink, fontWeight: 700 }}>{title}</h4>
              <div className={`mt-3 ${srcs.length > 1 ? "grid gap-3 grid-cols-2" : ""}`}>
                {srcs.map((s, i) => (
                  <CursorFollow key={i} label={tag}>
                    <PhotoSlot ratio="4 / 3" fit="contain" src={s} alt={title} caption={perPhotoCaptions?.[i]} />
                  </CursorFollow>
                ))}
              </div>
              {sharedCaption && (
                <figcaption className="wh-data mt-2" style={{ fontSize: 11, color: C.mute, lineHeight: 1.6, fontStyle: "italic" }}>
                  {sharedCaption}
                </figcaption>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   21 · SECTION 14 - ABOUT GROW INDIGO
---------------------------------------------------------------------------- */
const VERTICALS = [
  ["01", "NATURE-BASED CROP INPUTS", "Biologicals", "We empower farmers with innovative biological products that enhance soil health, promote plant growth, and unlock the full potential of their land.", C.leaf],
  ["02", "CARBON FARMING", "Carbon - Regen Ag", "We're building India's leading vertically integrated carbon program. This program delivers high-quality, certified carbon units, safeguarding businesses from greenwashing claims and driving positive climate action.", C.field],
  ["03", "SCOPE 3 INSETTING", "ClearHarvest", "With our combined expertise of biologicals and carbon accounting, we help food, beverage, and apparel companies reduce farm-side emissions to achieve their net-zero goals.", C.husk],
  ["04", "CARBON-NEGATIVE SOIL AMENDMENT", "Biochar", "We convert crop residue into high-quality biochar, restoring soil health and unlocking a permanent, verifiable route to carbon removal - while ending the need for open-field burning.", C.clay],
];

function AboutSection() {
  const grid = useBatchReveal(".vertical-card", { stagger: 0.08 });
  return (
    <Section id="about" tone="tint">
      <SectionHead
        index="13"
        title="About Grow Indigo"
        lede="Grow Indigo is a pioneering agri-tech company, with a focus on advancing sustainable agriculture to improve farmer profitability, environmental sustainability, and consumer health. Our mission is to accelerate agricultural transformation for a healthier planet, driven by four core pillars."
      />

      <Reveal>
        <PhotoSlot ratio="1 / 1" fit="contain" className="max-w-sm mx-auto" src={aboutGrowIndigoGraphic} alt="Grow Indigo - We Accelerate Ag Transformation For a Healthy Planet" />
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <Eyebrow big>Our four core verticals</Eyebrow>
        <div ref={grid} className="grid gap-4 sm:grid-cols-2 mt-4">
          {VERTICALS.map(([n, label, name, body, color]) => (
            <div
              key={n}
              className="vertical-card group relative p-6 rounded-lg transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:z-10"
              style={{ background: "#fff", border: `1px solid ${C.line}`, borderTop: `3px solid ${color}` }}
            >
              <div className="wh-data" style={{ color, fontWeight: 700, fontSize: 11.5, letterSpacing: ".1em" }}>{n} {label}</div>
              <h4 className="wh-display mt-1.5 text-lg" style={{ color: C.ink, fontWeight: 700 }}>{name}</h4>
              <p
                className="mt-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-300"
                style={{ fontSize: 13.5, lineHeight: 1.62, color: C.mute }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <div className="p-7 rounded-lg text-center" style={{ background: C.ink }}>
          <Eyebrow color={C.husk} big>Get in touch</Eyebrow>
          <div className="wh-display mt-3" style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>ClearHarvest - Grow Indigo</div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-2" style={{ color: "rgba(255,255,255,.78)", fontSize: 14 }}>
            <div><span style={{ color: "rgba(255,255,255,.5)" }}>Email: </span>clearharvest@growindigo.co.in</div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------------------------
   22 · LOGO LOCKUP
---------------------------------------------------------------------------- */
function LogoSlot({ name, src, align = "left", light = false, height = 34 }) {
  const fg = light ? "rgba(255,255,255,.55)" : C.mute;
  const edge = light ? "rgba(255,255,255,.22)" : C.line;
  return (
    <div style={{ display: "flex", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          style={{
            height,
            width: "auto",
            display: "block",
            filter: light
              ? "drop-shadow(0 1px 3px rgba(0,0,0,.55)) drop-shadow(0 0 10px rgba(0,0,0,.25))"
              : "none",
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded"
          style={{ height, width: height * 3.6, border: `1px dashed ${edge}`, background: light ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.02)" }}
          aria-label={`${name} logo placeholder`}
        >
          <span className="wh-data" style={{ fontSize: 8.5, letterSpacing: ".12em", color: fg, textAlign: "center", lineHeight: 1.35 }}>
            {name.toUpperCase()}
            <br />LOGO
          </span>
        </div>
      )}
    </div>
  );
}

function LogoLockup({ light = false, height = 34, rule = true }) {
  return (
    <div className="flex items-center gap-5 w-full">
      <LogoSlot name="Grow Indigo" src={wheatPartnerLogo} align="left" light={light} height={height} />
      {rule && <span style={{ flex: 1, height: 1, background: light ? "rgba(255,255,255,.18)" : C.line }} />}
      <LogoSlot name="ClearHarvest" src={wheatProgrammeLogo} align="right" light={light} height={height} />
    </div>
  );
}

/* ----------------------------------------------------------------------------
   23 · CLOSING
---------------------------------------------------------------------------- */
function Closing() {
  return (
    <footer style={{ background: C.ink }}>
      <div className="mx-auto px-5 md:px-10 py-14" style={{ maxWidth: 1180 }}>
        <LogoLockup light height={40} />
        <div className="wh-data mt-8 text-center" style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", letterSpacing: ".1em" }}>
          © 2026 Grow Indigo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------------------
   24 · ROOT
---------------------------------------------------------------------------- */
export default function WheatHarvestReport() {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wh-root">
      <GlobalStyle />
      <div className="wh-grain no-print" aria-hidden="true" />
      <TopBar />

      <main>
        <Hero />
        {!PDF_EXPORT && <Ticker />}
        <SeasonSection />
        <FieldsSection />
        <ThemesSection />
        <GovernanceSection />
        <JourneySection />
        <VoicesSection />
        <PracticeSection />
        <PinnedStatement text={PRACTICE_BIG_PICTURE} />
        <AuditedSection />
        <TimelineSection />
        <FarmerImpactSection />
        <SourcingSection />
        <EvidenceSection />
        <AboutSection />
      </main>

      <Closing />
    </div>
  );
}
