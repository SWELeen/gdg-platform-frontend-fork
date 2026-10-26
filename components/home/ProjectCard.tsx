"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";

/* ============================================================
   الأنواع (Types)
   ============================================================ */

export type Project = {
  id: string;
  img: string;
  committeeColor?: string;
  detailsImg?: string;
  detailsImages?: string[];
  tags?: string[]; // اختيارية: إذا ما وجدت ما تظهر الشارات
};

type ProjectCardProps = {
  project: Project;
  onViewProject?: () => void;
  detailsOpen?: boolean;
  position: number; // موقع الكرت بالنسبة للكرت النشط: 0 = المنتصف، -1 = يسار، 1 = يمين ...
  index: number; // رقم المشروع الفعلي (يظهر في التبويبة)
  isActive?: boolean;
  onSelect?: () => void; // عند الضغط على كرت جانبي ينتقل له
};

/* ============================================================
   إعدادات التصميم (غيّري هنا فقط)
   ============================================================ */

const CARD_W = 280; // عرض الكرت بالبكسل
const HALF_W = CARD_W / 2;

/** المسافة الظاهرة بين كل كرتين متجاورين (بالبكسل) */
const GAP = -12;

/** قوة الـ perspective: لازم نفس القيمة تنستخدم في FeaturedProjects */
export const PERSPECTIVE = 1800;

/**
 * خصائص كل موقع:
 * scale   = التصغير
 * rotateY = زاوية الدوران (تزيد كل ما ابتعد الكرت)
 * opacity = الشفافية
 * dim     = قوة التغميق فوق الكرت
 */
const RAW = [
  { scale: 1, rotateY: 0, z: 0, opacity: 1, dim: 0 }, // الكرت النشط
  { scale: 0.92, rotateY: 24, z: -24, opacity: 1, dim: 0.08 },
  { scale: 0.84, rotateY: 38, z: -88, opacity: 1, dim: 0.16 },
  { scale: 0.76, rotateY: 50, z: -180, opacity: 0.9, dim: 0.24 },
];

/* ============================================================
   حساب الإزاحة الأفقية لكل موقع
   ------------------------------------------------------------
   الهدف: الفراغ بين حافة كرت وحافة اللي بجانبه = GAP بالضبط.

   الـ perspective يغيّر مكان الحواف على الشاشة، فنحسبها بالمعادلة:
   موضع نقطة على الشاشة = (x + مسافتها من المركز بعد الدوران والتصغير)
                          × P / (P ± العمق)
   ============================================================ */

const toRad = (deg: number) => (deg * Math.PI) / 180;

type Slot = (typeof RAW)[number] & { x: number };

const SLOTS: Slot[] = (() => {
  const result: Slot[] = [];

  // مكان الحافة الخارجية (اليمنى) للكرت السابق على الشاشة
  let prevOuterEdge = 0;

  RAW.forEach((slot, i) => {
    // الكرت الأول (النشط) في المنتصف تمامًا
    if (i === 0) {
      result.push({ ...slot, x: 0 });
      prevOuterEdge = HALF_W;
      return;
    }

    const rad = toRad(slot.rotateY);

    // A: نصف العرض الأفقي للكرت بعد التصغير والدوران
    const A = slot.scale * HALF_W * Math.cos(rad);

    // B: عمق الحافة (كم تقترب أو تبتعد عن العين بسبب الدوران)
    const B = HALF_W * Math.sin(rad);

    // نحل المعادلة بحيث: الحافة الداخلية للكرت = الحافة الخارجية للسابق + GAP
    const x = A + (prevOuterEdge + GAP) * ((PERSPECTIVE - B) / PERSPECTIVE);

    // نحفظ مكان الحافة الخارجية لهذا الكرت للكرت اللي بعده
    prevOuterEdge = ((x + A) * PERSPECTIVE) / (PERSPECTIVE + B);

    result.push({ ...slot, x });
  });

  return result;
})();

/** أقصى عدد كروت تظهر في كل جهة */
export const MAX_SIDE = SLOTS.length - 1;

/* ============================================================
   المكوّن (Component)
   ============================================================ */

export default function ProjectCard({
  project,
  position,
  index,
  isActive = false,
  onSelect,
  onViewProject,
  detailsOpen = false,
}: ProjectCardProps) {
  const t = useTranslations("home.projects");
  const dir = useTextDirection();
  const titleKey = `items.${project.id}.title`;
  const descriptionKey = `items.${project.id}.shortDescription`;
  const projectTitle = t.has(titleKey) ? t(titleKey) : project.id;
  const committeeKey = `items.${project.id}.committee`;
  const projectDescription = t.has(descriptionKey) ? t(descriptionKey) : "";
  const projectCommittee = t.has(committeeKey) ? t(committeeKey) : "";

  // abs = بُعد الكرت عن المنتصف، side = جهته (-1 يسار، 1 يمين)
  const abs = Math.min(Math.abs(position), MAX_SIDE);
  const side = Math.sign(position);
  const slot = SLOTS[abs];

  // عكس الاتجاه في اللغة العربية (RTL)
  const mirror = dir === "rtl" ? -1 : 1;

  return (
    <motion.article
      initial={false}
      animate={{
        x: slot.x * side * mirror, // الإزاحة الأفقية
        z: slot.z, // إبعاد الكروت الجانبية لتتبع قوس أسطواني
        scale: slot.scale,
        rotateY: slot.rotateY * side * mirror, // الدوران ثلاثي الأبعاد
        opacity: slot.opacity,
      }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        // التصغير والدوران من أسفل الكرت => كل الكروت قاعها على نفس الخط
        originX: 0.5,
        originY: 1,
        zIndex: 10 - abs, // الكرت النشط فوق الباقي
        // انعكاس الكرت على الأرضية
        WebkitBoxReflect:
          "below 4px linear-gradient(transparent 78%, rgba(255,255,255,0.16))",
      }}
      onClick={!isActive ? (detailsOpen ? onViewProject : onSelect) : undefined}
      className={`absolute left-1/2 top-0 -ml-[140px] h-[420px] w-[280px] ${
        !isActive && onSelect ? "cursor-pointer" : ""
      }`}
    >
      {/* جسم الكرت */}
      <div
        className={`relative h-full w-full overflow-hidden rounded-[24px] border-3 border-border bg-surface ${
          isActive
            ? "shadow-[0_28px_50px_rgba(40,40,70,0.25)]"
            : "shadow-[0_18px_32px_rgba(40,40,70,0.14)]"
        }`}
        style={{ backgroundColor: project.committeeColor ?? "var(--surface-muted)" }}
      >
        {/* صورة المشروع */}
        {/* تدرج داكن في أسفل الكرت عشان يوضح النص */}
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-[color:var(--gdg-dark)]/55 to-[color:var(--gdg-dark)]/90" />

        {/* طبقة تغميق للكروت الجانبية (كل ما ابتعدت زادت) */}
        <motion.div
          initial={false}
          animate={{ opacity: slot.dim }}
          transition={{ duration: 0.7 }}
          className="pointer-events-none absolute inset-0 z-20 bg-foreground/10"
        />

        {/* تبويبة الرقم (نفس لون خلفية السيكشن عشان تبان مقصوصة) */}
        <div className="absolute right-0 top-0 z-30 flex h-[54px] w-[88px] items-center justify-center rounded-bl-[22px] bg-background text-foreground">
          <span className="text-xl font-medium tracking-tight">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="absolute -left-[18px] top-0 h-[18px] w-[18px] rounded-tr-[18px] bg-transparent shadow-[5px_-5px_0_5px_var(--background)]" />
          <span className="absolute -bottom-[18px] right-0 h-[18px] w-[18px] rounded-tr-[18px] bg-transparent shadow-[5px_-5px_0_5px_var(--background)]" />
        </div>

        {/* محتوى الكرت: الاسم، المطوّر، الوصف، الزر، الشارات */}
        <div
          dir={dir}
          className="absolute inset-x-0 bottom-0 z-10 p-5 text-white"
        >
          {/* اسم المشروع */}
          <h3 className="text-2xl font-semibold leading-tight tracking-tight text-white">
            {projectTitle}
          </h3>

          {/* صانع المشروع (madeBy) */}
          <p className="mt-1 text-[11px] text-white/60">
            {projectCommittee}
          </p>

          {/* الوصف + زر السهم */}
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="line-clamp-4 max-w-[190px] text-xs leading-[1.6] text-white/80">
              {projectDescription}
            </p>

            <button
              type="button"
              aria-label={t("viewProject")}
              onClick={(event) => {
                event.stopPropagation();
                onViewProject?.();
              }}
              className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-white/5 transition-all duration-300 hover:scale-110 hover:bg-white"
            >
              {/* rtl:-scale-x-100 تقلب السهم في العربي */}
              <svg
                className="h-[18px] w-[18px] rtl:-scale-x-100 group-hover:[&>path]:stroke-black"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* الشارات (Tags) – تظهر فقط إذا موجودة في البيانات */}
          {project.tags && project.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-white/90"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}
