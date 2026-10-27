"use client";

import { projects } from "@/data/home";
import { useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import ProjectCard, { MAX_SIDE, PERSPECTIVE } from "./ProjectCard";

export default function FeaturedProjects() {
  const t = useTranslations("home.projects");
  const dir = useTextDirection();
  const projectMessage = (projectId: string, field: string) => {
    const key = `items.${projectId}.${field}`;
    return t.has(key) ? t(key) : "";
  };

  /*
   * offset: عدّاد غير محدود (يزيد وينقص بدون حد).
   * نستخدمه عشان كل كرت يحتفظ بنفس الـ key وهو يتحرك،
   * وهذا اللي يخلي الحركة سلسة بدل ما الكرت يختفي ويظهر.
   */
  const [offset, setOffset] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  const total = projects.length; // عدد المشاريع (ديناميكي بالكامل)
  if (total === 0) return null; // ما في مشاريع = ما نعرض شي

  // دالة تحوّل أي رقم (حتى السالب) إلى رقم صحيح داخل نطاق المشاريع
  const mod = (n: number) => ((n % total) + total) % total;

  // رقم المشروع النشط حاليًا
  const activeIndex = mod(offset);

  /*
   * عدد الكروت في كل جهة يعتمد على عدد المشاريع:
   * مشروع واحد  = كرت واحد فقط
   * مشروعان     = كرت على كل جهة
   * ثلاثة فأكثر = الحد الأقصى (MAX_SIDE)
   */

  // قائمة المواقع مثلًا: [-3,-2,-1,0,1,2,3]
  const handleNext = () => setOffset((p) => p + 1);
  const handlePrevious = () => setOffset((p) => p - 1);

  // نجهّز بيانات الكروت اللي بتظهر (تتكرر الكروت لو المشاريع قليلة)
  const visible = projects
    .map((project, index) => {
      let position = index - activeIndex;
      if (position > total / 2) position -= total;
      if (position < -total / 2) position += total;
      return { key: project.id, position, index, project };
    })
    .filter(({ position }) => Math.abs(position) <= (selectedProject ? 1 : MAX_SIDE));

  // الأزرار تتعطل إذا في مشروع واحد فقط
  const canNavigate = total > 1;

  // عدّاد الصفحات (01 / 05) – نفس الشكل للجوال والكمبيوتر
  const counter = (
    <div dir="ltr" className="min-w-[64px] text-center text-sm font-medium text-foreground">
      <span className="font-semibold text-foreground">
        {String(activeIndex + 1).padStart(2, "0")}
      </span>
      <span className="mx-1.5 text-foreground/25">/</span>
      <span className="text-foreground/45">{String(total).padStart(2, "0")}</span>
    </div>
  );

  return (
<section
  id="projects"
  className="relative isolate overflow-hidden bg-background px-8 py-20 lg:px-10 lg:py-28"
>
  {/* ===== الخلفية ===== */}
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    {/* شبكة نقاط */}
    {/* <div className="absolute inset-0 text-foreground/25 [background-image:radial-gradient(currentColor_1.2px,transparent_1.2px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_50%,black_30%,transparent)]" /> */}

    {/* توهّج ألوان Google */}
    <div className="absolute -top-32 start-[-6%] h-[380px] w-[380px] rounded-full bg-gdg-blue/30 blur-[110px]" />
    {/* <div className="absolute -top-20 end-[-4%] h-[320px] w-[320px] rounded-full bg-gdg-red/25 blur-[110px]" /> */}
    {/* <div className="absolute bottom-[-120px] start-[18%] h-[340px] w-[340px] rounded-full bg-gdg-green/25 blur-[110px]" /> */}
    <div className="absolute bottom-[-100px] end-[16%] h-[320px] w-[320px] rounded-full bg-gdg-blue/25 blur-[110px]" />

    {/* خط علوي بألوان Google */}
    {/* <div className="absolute inset-x-0 top-0 flex h-[3px] opacity-80">
      <span className="flex-1 bg-gdg-blue" />
      <span className="flex-1 bg-gdg-red" />
      <span className="flex-1 bg-gdg-yellow" />
      <span className="flex-1 bg-gdg-green" />
    </div> */}
  </div>

  {/* ===== العنوان (على اليسار) ===== */}
  <div className="max-w-2xl">
    <motion.div
      dir={dir}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-start"
    >
      <h2 className="text-4xl font-bold leading-snug text-foreground md:text-5xl">
        {t("titleStart")}{" "}
        <span className="bg-[image:var(--google-gradient)] bg-clip-text pe-1 italic text-transparent rtl:not-italic">
          {t("titleHighlight")}
        </span>
      </h2>

      <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
        {t("subtitle")}
      </p>
    </motion.div>
  </div>

      {/* ===== المعرض ثلاثي الأبعاد (شاشات الكمبيوتر) ===== */}
      <div className="mx-auto mt-14 hidden w-full max-w-[1400px] lg:block">
        {/*
          perspective: العمق ثلاثي الأبعاد (نفس القيمة المستخدمة في حساب المسافات).
          perspectiveOrigin 100%: نقطة نظر العين عند قاع الكروت،
          عشان قواعد الكروت كلها تبقى على خط واحد.
        */}
        <div className="relative mx-auto h-[420px] w-full" style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 100%" }}>
          <motion.div
            className="absolute inset-0"
            animate={{
              x: selectedProject ? (dir === "rtl" ? 280 : -280) : 0,
              scale: selectedProject ? 0.90 : 1,
            }}
            style={{ transformOrigin: "center center" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
          {visible.map(({ key, project, index, position }) => (
            <ProjectCard
              key={key}
              project={project}
              position={position}
              index={index}
              isActive={position === 0}
              detailsOpen={Boolean(selectedProject)}
              // الضغط على كرت جانبي ينقلك له مباشرة
              onSelect={() => setOffset((p) => p + position)}
              onViewProject={() => {
                setOffset(index);
                setSelectedProjectId(project.id);
              }}
            />
          ))}
          </motion.div>

          <AnimatePresence>
            {selectedProject && (
              <motion.article
                key={selectedProject.id}
                dir={dir}
                className={`absolute inset-y-0 ${dir === "rtl" ? "right-[56%]" : "left-[56%]"} z-20 w-[44%] overflow-y-auto rounded-3xl border border-border bg-background/95 p-7 text-foreground shadow-xl`}
                initial={{ opacity: 0, x: 90 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <button type="button" onClick={() => setSelectedProjectId(null)} className="mb-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-muted">
                  <FiArrowLeft className="rtl:-scale-x-100" />
                  {t("backToProjects")}
                </button>
                <h3 className="mt-5 text-2xl font-semibold">{projectMessage(selectedProject.id, "title")}</h3>
                <p className="mt-2 text-sm text-foreground/60">{projectMessage(selectedProject.id, "committee")}</p>
                <p className="mt-5 text-base leading-8 text-foreground/80">{projectMessage(selectedProject.id, "fullDescription")}</p>
                {selectedProject.detailsImages?.length ? (
                  <div className={`mt-6 grid ${selectedProject.detailsImages.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                    {selectedProject.detailsImages.map((image, index) => (
                      <div key={image} className="w-full overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-md">
                        <motion.img
                          src={image}
                          alt={t("screenshotAlt", { number: index + 1 })}
                          className="block h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {/* أزرار التنقل (تحت الانعكاس) */}
        <div className={`mt-24 flex items-center justify-center gap-6 ${selectedProject ? "invisible" : ""}`}>
          <button
            type="button"
            aria-label={t("previous")}
            onClick={handlePrevious}
            disabled={!canNavigate}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all duration-300 hover:-translate-x-1 hover:bg-surface-muted hover:shadow-md disabled:opacity-40"
          >
            <FiArrowLeft className="text-lg rtl:-scale-x-100" />
          </button>

          {counter}

          <button
            type="button"
            aria-label={t("next")}
            onClick={handleNext}
            disabled={!canNavigate}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-all duration-300 hover:translate-x-1 hover:shadow-lg disabled:opacity-40"
          >
            <FiArrowRight className="text-lg rtl:-scale-x-100" />
          </button>
        </div>
      </div>

      {/* ===== نسخة الجوال والتابلت: كرت واحد فقط ===== */}
      <div className="mt-10 lg:hidden">
        <div
          className="relative mx-auto h-[255px] w-full overflow-visible"
          style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 100%" }}
        >
          <motion.div
            initial={false}
            animate={{ x: 2, scale: 0.60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 h-[420px] w-full"
            style={{ transformOrigin: "top center" }}
          >
            {visible
              .filter(({ position }) => Math.abs(position) <= 1)
              .map(({ key, project, index, position }) => (
                <ProjectCard
                  key={key}
                  project={project}
                  position={position}
                  index={index}
                  isActive={position === 0}
                  detailsOpen={Boolean(selectedProject)}
                  onSelect={() => setOffset((current) => current + position)}
                  onViewProject={() => {
                    setOffset(index);
                    setSelectedProjectId(project.id);
                  }}
                />
              ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedProject && (
            <motion.article
              key={selectedProject.id}
              dir={dir}
              className="mx-auto mt-8 max-w-xl rounded-3xl border border-border bg-background p-5 text-foreground shadow-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
            >
              <button type="button" onClick={() => setSelectedProjectId(null)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium">
                <FiArrowLeft className="rtl:-scale-x-100" />
                {t("backToProjects")}
              </button>
              <h3 className="mt-4 text-xl font-semibold">{projectMessage(selectedProject.id, "title")}</h3>
              <p className="mt-2 text-sm text-foreground/60">{projectMessage(selectedProject.id, "committee")}</p>
              <p className="mt-4 text-sm leading-7 text-foreground/80">{projectMessage(selectedProject.id, "fullDescription")}</p>
              {selectedProject.detailsImages?.length ? (
                <div className={`mt-5 grid ${selectedProject.detailsImages.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                  {selectedProject.detailsImages.map((image, index) => (
                    <div key={image} className="w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-sm">
                      <motion.img
                        src={image}
                        alt={t("screenshotAlt", { number: index + 1 })}
                        className="block h-auto w-full object-contain"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.1 }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.article>
          )}
        </AnimatePresence>

        <div className={`mt-8 flex items-center justify-center gap-6 ${selectedProject ? "invisible" : ""}`}>
          <button
            type="button"
            aria-label={t("previous")}
            onClick={handlePrevious}
            disabled={!canNavigate}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground disabled:opacity-40"
          >
            <FiArrowLeft className="rtl:-scale-x-100" />
          </button>

          {counter}

          <button
            type="button"
            aria-label={t("next")}
            onClick={handleNext}
            disabled={!canNavigate}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
          >
            <FiArrowRight className="rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </section>
  );
}
