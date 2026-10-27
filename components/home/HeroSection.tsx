"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { getPathname } from "@/i18n/navigation";

/* ========================================================= */
/* SETTINGS                                                  */
/* ========================================================= */

const LOGO_SRC = "/gdg-logo-motion.png";

const LOGO_W = 190;
const LOGO_H = 115;

const CX = 835;
const CY = 395;

const LEFT_END = CX - LOGO_W / 2 + 12;
const RIGHT_END = CX + LOGO_W / 2 - 12;

/* ========================================================= */
/* RESPONSIVE STAGE                                          */
/* ========================================================= */

type Points = [number, number][];

// [عرض الشاشة, حجم الـ stage (اللوقو + كل شي)]
const SCALE_POINTS: Points = [
  [320, 0.37],
  [375, 0.42],
  [640, 0.6],
  [768, 0.72],
  [1280, 1],
  [1536, 1.12],
  [1920, 1.25],
];

// [عرض الشاشة, ضغط الأشرطة أفقياً]: 1 = الطول الأصلي (من 1280 وفوق)
const RIBBON_POINTS: Points = [
  [320, 0.5],
  [390, 0.5],
  [640, 0.65],
  [768, 0.75],
  [1024, 0.9],
  [1280, 1],
];

function interpolate(points: Points, width: number) {
  const first = points[0];
  const last = points[points.length - 1];

  if (width <= first[0]) return first[1];
  if (width >= last[0]) return last[1];

  for (let i = 0; i < points.length - 1; i++) {
    const [w1, v1] = points[i];
    const [w2, v2] = points[i + 1];

    if (width >= w1 && width <= w2) {
      return v1 + ((v2 - v1) * (width - w1)) / (w2 - w1);
    }
  }

  return last[1];
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useStageMetrics() {
  const [metrics, setMetrics] = useState<{
    scale: number;
    ribbonX: number;
  } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      setMetrics({
        scale: interpolate(SCALE_POINTS, w),
        ribbonX: interpolate(RIBBON_POINTS, w),
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return metrics;
}

/* ========================================================= */
/* RIBBONS                                                    */
/* ========================================================= */

type Pt = [number, number];

const bez = (
  a: Pt,
  b: Pt,
  c: Pt,
  d: Pt,
  t: number
): Pt => {
  const u = 1 - t;

  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],

    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
};

function ribbonPath(
  p: [Pt, Pt, Pt, Pt],
  w0: number,
  wEnd = 1.2,
  n = 28,
  wave?: (t: number) => number
) {
  const top: Pt[] = [];
  const bot: Pt[] = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;

    const [x, y] = bez(
      p[0],
      p[1],
      p[2],
      p[3],
      t
    );

    const [xa, ya] = bez(
      p[0],
      p[1],
      p[2],
      p[3],
      Math.max(0, t - 0.01)
    );

    const [xb, yb] = bez(
      p[0],
      p[1],
      p[2],
      p[3],
      Math.min(1, t + 0.01)
    );

    let dx = xb - xa;
    let dy = yb - ya;

    const len = Math.hypot(dx, dy) || 1;

    dx /= len;
    dy /= len;

    const w =
      (wEnd +
        (w0 - wEnd) * Math.pow(1 - t, 1.5)) /
      2;

    const o = wave ? wave(t) : 0;

    const mx = x - dy * o;
    const my = y + dx * o;

    top.push([
      mx - dy * w,
      my + dx * w,
    ]);

    bot.push([
      mx + dy * w,
      my - dx * w,
    ]);
  }

  const f = (q: Pt) =>
    `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;

  return `M${f(top[0])} ${top
    .slice(1)
    .map((q) => `L${f(q)}`)
    .join(" ")} ${bot
    .reverse()
    .map((q) => `L${f(q)}`)
    .join(" ")} Z`;
}

type RibbonDef = {
  id: string;
  color: string;
  side: "l" | "r";
  start: Pt;
  c1: Pt;
  c2: Pt;
  endDy?: number;
  end?: Pt;
  w0: number;
  amp: number;
  duration: number;
};

const RIBBON_DEFS: RibbonDef[] = [
  /* LEFT */

  {
    id: "lRed",
    color: "var(--gdg-red)",
    side: "l",
    start: [0, 262],
    c1: [200, 250],
    c2: [390, 335],
    endDy: -2,
    w0: 20,
    amp: 22,
    duration: 11,
  },

  {
    id: "lBlue",
    color: "var(--gdg-blue)",
    side: "l",
    start: [0, 455],
    c1: [170, 462],
    c2: [370, 405],
    endDy: 3,
    w0: 24,
    amp: 20,
    duration: 13,
  },

  {
    id: "lRed2",
    color: "var(--gdg-pink-accent)",
    side: "l",
    start: [0, 335],
    c1: [230, 348],
    c2: [410, 380],
    endDy: -1,
    w0: 8,
    amp: 16,
    duration: 9,
  },

  {
    id: "lBlue2",
    color: "var(--gdg-blue-accent)",
    side: "l",
    start: [0, 525],
    c1: [210, 528],
    c2: [410, 445],
    endDy: 5,
    w0: 9,
    amp: 18,
    duration: 12,
  },

  {
    id: "lSilver",
    color: "var(--hero-white)",
    side: "l",
    start: [0, 112],
    c1: [90, 150],
    c2: [175, 200],
    end: [255, 244],
    w0: 12,
    amp: 5,
    duration: 10,
  },

  /* RIGHT */

  {
    id: "rGreenTop",
    color: "var(--gdg-green)",
    side: "r",
    start: [1672, 150],
    c1: [1500, 205],
    c2: [1270, 345],
    endDy: -2,
    w0: 20,
    amp: 22,
    duration: 12,
  },

  {
    id: "rGreenMid",
    color: "var(--gdg-green-accent)",
    side: "r",
    start: [1672, 292],
    c1: [1520, 292],
    c2: [1390, 352],
    endDy: 1,
    w0: 14,
    amp: 18,
    duration: 10,
  },

  {
    id: "rYellow",
    color: "var(--gdg-yellow)",
    side: "r",
    start: [1672, 432],
    c1: [1500, 432],
    c2: [1310, 412],
    endDy: 3,
    w0: 24,
    amp: 20,
    duration: 13,
  },

  {
    id: "rYellow2",
    color: "var(--gdg-yellow-accent)",
    side: "r",
    start: [1672, 505],
    c1: [1500, 505],
    c2: [1290, 455],
    endDy: 6,
    w0: 8,
    amp: 16,
    duration: 9,
  },
];

const RIBBONS = RIBBON_DEFS.map((r) => {
  const end: Pt =
    r.end ??
    [
      r.side === "l" ? LEFT_END : RIGHT_END,
      CY + (r.endDy ?? 0),
    ];

  const mk = (
    a: number
  ): [Pt, Pt, Pt, Pt] => [
    r.start,
    [r.c1[0], r.c1[1] + a],
    [r.c2[0], r.c2[1] - a * 0.8],
    end,
  ];

  return {
    ...r,
    x1: r.start[0],
    x2: end[0],
    pts: mk(0),
    d0: ribbonPath(mk(0), r.w0),
  };
});

/* ========================================================= */
/* SPARKS / DUST                                             */
/* ========================================================= */

const DUST = Array.from(
  { length: 110 },
  (_, i) => {
    const r = (n: number) => {
      const x =
        Math.sin(
          i * 97.13 + n * 12.9898
        ) * 43758.5453;

      return x - Math.floor(x);
    };

    return {
      x: Math.round(r(1) * 1000),
      y: Math.round(r(2) * 1000),
      r: +(r(3) * 1.4 + 0.5).toFixed(2),
      o: +(r(4) * 0.5 + 0.2).toFixed(2),

      c: [
        "var(--gdg-blue)",
        "var(--gdg-red)",
        "var(--gdg-green)",
        "var(--gdg-yellow)",
        "var(--hero-white)",
      ][Math.floor(r(5) * 5)],

      d: +(r(6) * 3 + 2).toFixed(1),
    };
  }
);

/* ========================================================= */
/* RIBBON COMPONENT                                          */
/* ========================================================= */

function Ribbon({
  r,
  index,
}: {
  r: (typeof RIBBONS)[number];
  index: number;
}) {
  const baseRef =
    useRef<SVGPathElement>(null);

  const shineRef =
    useRef<SVGPathElement>(null);

  const shineGrad =
    useRef<SVGLinearGradientElement>(null);

  const reduce = useReducedMotion();

  useAnimationFrame((time) => {
    if (reduce) return;

    const s =
      time / 1000 + index * 0.9;

    const waves = 1.3;
    const k = 2 * Math.PI * waves;

    const speed =
      (2 * Math.PI) /
      (r.duration * 0.5);

    const amp = r.amp * 1.3;

    const d = ribbonPath(
      r.pts,
      r.w0,
      1.2,
      28,
      (t) =>
        amp *
        Math.pow(1 - t, 0.9) *
        Math.sin(
          k * t - speed * s
        )
    );

    baseRef.current?.setAttribute(
      "d",
      d
    );

    shineRef.current?.setAttribute(
      "d",
      d
    );

    const p =
      (s * 0.12 + index * 0.13) %
      1;

    const c =
      r.x1 +
      (r.x2 - r.x1) * p;

    shineGrad.current?.setAttribute(
      "x1",
      String(c - 140)
    );

    shineGrad.current?.setAttribute(
      "x2",
      String(c + 140)
    );
  });

  return (
    <g
      style={{
        filter: `drop-shadow(0 0 6px ${r.color})`,
      }}
    >
      <defs>
        <linearGradient
          ref={shineGrad}
          id={`shine-${r.id}`}
          gradientUnits="userSpaceOnUse"
          x1="-2000"
          y1="0"
          x2="-1900"
          y2="0"
        >
          <stop
            offset="0"
            stopColor="var(--hero-white)"
            stopOpacity="0"
          />

          <stop
            offset="0.5"
            stopColor="var(--hero-white)"
            stopOpacity="0.9"
          />

          <stop
            offset="1"
            stopColor="var(--hero-white)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        ref={baseRef}
        d={r.d0}
        fill={`url(#grad-${r.id})`}
      />

      <path
        ref={shineRef}
        d={r.d0}
        fill={`url(#shine-${r.id})`}
      />
    </g>
  );
}

/* ========================================================= */
/* COMPONENT                                                 */
/* ========================================================= */

export default function HeroSection() {
  const t = useTranslations("home.hero");

  const dir = useTextDirection();

  const locale = useLocale();

  // يتحدد بالـ JS بعد التحميل. قبله تشتغل القيم الاحتياطية بالـ classes
  const metrics = useStageMetrics();

  // الحاوية الثابتة حق اللوقو: نراقبها هي بدل النصفين المزاحين برا الشاشة
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const logoSpread = useTransform(scrollYProgress, [0, 0.75], [0, LOGO_W * 0.2], {
    clamp: true,
  });
  const reduceMotion = useReducedMotion();
  const introSpread = useMotionValue(LOGO_W * 0.65);
  const [introComplete, setIntroComplete] = useState(false);
  const activeLogoSpread = introComplete || reduceMotion ? logoSpread : introSpread;
  const leftLogoSpread = useTransform(activeLogoSpread, (value) => -value);

  useEffect(() => {
    if (reduceMotion) {
      introSpread.set(0);
      return;
    }

    const animation = animate(introSpread, 0, {
      duration: 1.35,
      ease: "easeInOut",
      onComplete: () => setIntroComplete(true),
    });

    return () => animation.stop();
  }, [introSpread, reduceMotion]);

  const sectionStyle = {
    ...(metrics
      ? {
          "--stage-scale": metrics.scale,
          "--ribbon-x": metrics.ribbonX,
        }
      : {}),
    // شاشة كاملة، أو أقل ارتفاع يكفي اللوقو + النص + الأزرار بدون تداخل
    minHeight:
      "max(100svh, calc((var(--stage-scale) * 100px + 350px) / 0.58))",
  } as CSSProperties;

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative overflow-hidden bg-[var(--hero-background)] [--ribbon-x:0.5] [--stage-scale:0.42] sm:[--ribbon-x:0.65] sm:[--stage-scale:0.6] md:[--ribbon-x:0.75] md:[--stage-scale:0.72] xl:[--ribbon-x:1] xl:[--stage-scale:1] 2xl:[--stage-scale:1.12]"
      style={sectionStyle}
    >
      {/* NAVBAR */}
      <Navbar />

      {/* BACKGROUND */}
      <div
        className="
          absolute inset-0 z-0
          bg-[radial-gradient(ellipse_at_50%_42%,var(--hero-glow-blue),transparent_45%),radial-gradient(ellipse_at_0%_45%,var(--hero-glow-left),transparent_40%),radial-gradient(ellipse_at_100%_45%,var(--hero-glow-right),transparent_40%),linear-gradient(to_bottom,var(--hero-background)_0%,var(--hero-background-mid)_60%,var(--hero-background-bottom)_100%)]
        "
      />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {[
          {
            left: "18%",
            color: "var(--gdg-red)",
            o: 0.16,
          },
          {
            left: "40%",
            color: "var(--gdg-blue)",
            o: 0.24,
          },
          {
            left: "54%",
            color: "var(--gdg-yellow)",
            o: 0.21,
          },
          {
            left: "73%",
            color: "var(--gdg-green)",
            o: 0.18,
          },
          {
            left: "80%",
            color: "var(--gdg-yellow-accent)",
            o: 0.13,
          },
        ].map((r, i) => (
          <motion.div
            key={i}
            className="absolute top-[22%] h-[62%] w-[10%] rounded-full blur-3xl"
            style={{
              left: r.left,
              background: r.color,
            }}
            animate={{
              opacity: [
                r.o * 0.6,
                r.o,
                r.o * 0.6,
              ],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {DUST.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.c}
            animate={{ opacity: [p.o * 0.2, Math.min(p.o * 1.15, 1), p.o * 0.2] }}
            transition={{ duration: p.d, repeat: Infinity }}
          />
        ))}
      </svg>

      <div
        className="
          pointer-events-none
          absolute inset-0 z-0
          bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--hero-vignette)_100%)]
        "
      />

      {/* ========================================================= */}
      {/* STAGE                                                     */}
      {/* ========================================================= */}

      <div
        className="pointer-events-none absolute left-1/2 top-[26%] z-[2] h-0 w-0"
        style={{ transform: "scale(var(--stage-scale))" }}
      >

        {/* RIBBONS */}



        {/* ======================================================= */}
        {/* LOGO — SPLIT ENTRANCE                                  */}
        {/* ======================================================= */}

        <div
          className="absolute"
          style={{
            left: -LOGO_W / 2,
            top: -LOGO_H / 2,
            width: LOGO_W,
            height: LOGO_H,
          }}
        >
          {/* logo glow */}

          <motion.div
            className="absolute inset-[-40px] -z-10 rounded-full bg-[radial-gradient(circle,var(--hero-logo-glow),transparent_65%)] blur-2xl"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
          />

          {/* LEFT HALF */}

          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{
              x: leftLogoSpread,
              clipPath:
                "inset(0 50% 0 0)",
              WebkitClipPath:
                "inset(0 50% 0 0)",
            }}
          >
            <Image
              src={LOGO_SRC}
              alt="Google Developer Group on Campus - University of Jeddah"
              width={LOGO_W}
              height={LOGO_H}
              priority
              className="h-full w-full object-contain"
            />
          </motion.div>

          {/* RIGHT HALF */}

          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{
              x: activeLogoSpread,
              clipPath:
                "inset(0 0 0 50%)",
              WebkitClipPath:
                "inset(0 0 0 50%)",
            }}
          >
            <Image
              src={LOGO_SRC}
              alt=""
              width={LOGO_W}
              height={LOGO_H}
              priority
              className="h-full w-full object-contain"
            />
          </motion.div>

          {/* floating motion */}

          <motion.div
            className="absolute inset-0"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.3,
            }}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEXT + BUTTONS                                           */}
      {/* ========================================================= */}

      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center px-5 sm:px-8"
        style={{
          top: "calc(26% + var(--stage-scale) * 100px + 20px)",
        }}
      >

        {/* MAIN TITLE */}

        <motion.h1
          dir={dir}
          className="max-w-[1100px] text-balance text-center text-[clamp(1.875rem,1.2rem+2.2vw,4rem)] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--hero-white)]"
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.3,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut",
          }}
        >
          Google Developer Group
        </motion.h1>

        {/* SUBTITLE */}

        <motion.p
          dir={dir}
          className="mt-1 text-balance text-center text-[clamp(1.05rem,0.8rem+1.1vw,2.2rem)] font-normal leading-snug text-[var(--hero-white-muted)]"
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            delay: 0.35,
          }}
        >
          on Campus | University of Jeddah
        </motion.p>

        {/* TAGLINE */}

        <motion.p
          dir={dir}
          className="mt-3 max-w-[34ch] text-balance text-center text-[clamp(0.875rem,0.7rem+0.45vw,1.2rem)] leading-relaxed tracking-[0.06em] text-[var(--hero-white-muted)] sm:max-w-[60ch]"
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            delay: 0.45,
          }}
        >
          {t("tagline")}
        </motion.p>

        {/* BUTTONS */}

        <motion.div
          className="mt-6 flex w-full flex-col items-center justify-center gap-3.5 sm:mt-7 sm:w-auto sm:flex-row"
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            delay: 0.55,
          }}
        >
          {/* EXPLORE EVENTS */}

          <motion.a
            href="#events"
            className="
              relative flex
              h-[50px] w-full max-w-[260px] sm:w-[240px]
              items-center justify-between
              rounded-[40px]
              border border-[var(--hero-button-border)]
              bg-[var(--hero-button-secondary-bg)]
              ps-7
              text-[15px]
              font-medium
              text-[var(--hero-foreground)]
              backdrop-blur-md
            "
            whileHover={{
              scale: 1.03,
              backgroundColor:
                "var(--hero-button-hover)",
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <span dir={dir}>
              {t("exploreEvents")}
            </span>

            <span
              className="
                me-[3px]
                flex h-[42px] w-[42px]
                items-center justify-center
                rounded-full
                bg-[var(--hero-button-bg)]
              "
            >
              <svg
                className="h-5 w-5 rtl:-scale-x-100"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="var(--hero-button-text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </motion.a>

          {/* JOIN US */}

          <motion.a
            href={getPathname({
              href: "/signup",
              locale,
            })}
            className="
              relative flex
              h-[50px] w-full max-w-[260px] sm:w-[190px]
              items-center justify-between
              rounded-[40px]
              bg-[var(--hero-button-bg)]
              ps-7
              text-[15px]
              font-medium
              text-[var(--hero-button-text)]
              shadow-[0_0_0_3px_var(--hero-button-shadow)]
            "
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <span dir={dir}>
              {t("joinUs")}
            </span>

            <span
              className="
                me-[3px]
                flex h-[42px] w-[42px]
                items-center justify-center
                rounded-full
                bg-[var(--hero-button-text)]
              "
            >
              <svg
                className="h-5 w-5 rtl:-scale-x-100"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="var(--hero-button-bg)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
