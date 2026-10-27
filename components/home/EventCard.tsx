"use client";

import { CiCalendarDate, CiLocationOn } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useTextDirection } from "@/i18n/useTextDirection";
import type { CSSProperties } from "react";
import type { RegistrationQuestion } from "@/components/dashboard/shared/types";

export type HomeEvent = {
  id: string;
  image: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  registrationQuestions?: RegistrationQuestion[];
  requiredRegistrantFields?: string[];
  // false once the deadline passes; demo events leave it unset and stay open.
  registrationOpen?: boolean;
};

type EventCardProps = {
  event: HomeEvent;
  onRegister: (event: HomeEvent) => void;
};

const BORDER = 1; // سماكة الحد بالبكسل
const NOTCH = 14; // نصف قطر الفتحة الجانبية
const DIVIDER_NOTCH = 8; // نصف قطر فتحات الفاصل المنقط
const STUB_WIDTH = 84; // عرض ستاب التاريخ (أفقي)
const STUB_HEIGHT = 72; // ارتفاع ستاب التاريخ (عمودي)

function getDateParts(date: string, locale: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    month: parsed.toLocaleDateString(locale, { month: "short" }),
    day: parsed.toLocaleDateString(locale, { day: "numeric" }),
    year: parsed.toLocaleDateString(locale, { year: "numeric" }),
  };
}

export default function EventCard({ event, onRegister }: EventCardProps) {
  const t = useTranslations("home.events");
  const dir = useTextDirection();
  const locale = useLocale();
  const isRtl = dir === "rtl";
  const dateParts = getDateParts(event.date, locale);
  const registrationClosed = event.registrationOpen === false;

  const cut = (r: number, x: string, y: string) =>
    `radial-gradient(circle ${r}px at ${x} ${y}, transparent 97%, var(--black))`;

  // يبني الـ mask بنسختين: أفقي (sm وفوق) وعمودي (الجوال).
  // grow = زيادة نصف القطر، offset = المسافة بين الطبقة والحد الخارجي
  const buildMasks = (grow: number, offset: number) => {
    const left = `${-offset}px`;
    const right = `calc(100% + ${offset}px)`;
    const top = `${-offset}px`;
    const bottom = `calc(100% + ${offset}px)`;

    // أفقي: فتحات جانبية بنص الحافتين + فتحات الفاصل فوق وتحت
    const stubX = isRtl
      ? `${STUB_WIDTH - offset}px`
      : `calc(100% - ${STUB_WIDTH - offset}px)`;

    const horizontal = [
      cut(NOTCH + grow, left, "50%"),
      cut(NOTCH + grow, right, "50%"),
      cut(DIVIDER_NOTCH + grow, stubX, top),
      cut(DIVIDER_NOTCH + grow, stubX, bottom),
    ].join(", ");

    // عمودي: نفس التذكرة بعد التدوير 90°
    const stubY = `calc(100% - ${STUB_HEIGHT - offset}px)`;

    const vertical = [
      cut(NOTCH + grow, "50%", top),
      cut(NOTCH + grow, "50%", bottom),
      cut(DIVIDER_NOTCH + grow, left, stubY),
      cut(DIVIDER_NOTCH + grow, right, stubY),
    ].join(", ");

    return { horizontal, vertical };
  };

  const outerMasks = buildMasks(0, 0);
  const innerMasks = buildMasks(BORDER, BORDER);

  // حافة مسننة لجهة الصورة (أفقي: جنب الصورة، عمودي: أسفل الصورة)
  const scallopHorizontal = isRtl
    ? "linear-gradient(var(--black) 0 0) right / calc(100% - 5px) 100% no-repeat, radial-gradient(circle 5px at 100% 50%, var(--black) 98%, transparent) left / 5px 10px repeat-y"
    : "linear-gradient(var(--black) 0 0) left / calc(100% - 5px) 100% no-repeat, radial-gradient(circle 5px at 0 50%, var(--black) 98%, transparent) right / 5px 10px repeat-y";

  const scallopVertical =
    "linear-gradient(var(--black) 0 0) top / 100% calc(100% - 5px) no-repeat, radial-gradient(circle 5px at 50% 0, var(--black) 98%, transparent) bottom / 10px 5px repeat-x";

  // الـ composite بالـ inline عشان ما ينمسح من الـ shorthand حق mask
  const compositeStyle: CSSProperties = {
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };

  const outerStyle = {
    padding: BORDER,
    "--mask-h": outerMasks.horizontal,
    "--mask-v": outerMasks.vertical,
    ...compositeStyle,
  } as CSSProperties;

  const innerStyle = {
    "--mask-h": innerMasks.horizontal,
    "--mask-v": innerMasks.vertical,
    ...compositeStyle,
  } as CSSProperties;

  const imageStyle = {
    "--scallop-h": scallopHorizontal,
    "--scallop-v": scallopVertical,
  } as CSSProperties;

  // نفس المحتوى يستخدم بالنسختين (عمودي/أفقي)
  const dateStubContent = dateParts && (
    <>
      <span className="text-xs font-medium uppercase tracking-widest text-muted">
        {dateParts.month}
      </span>
      <span className="text-3xl leading-none sm:text-4xl sm:leading-tight">
        {dateParts.day}
      </span>
      <span className="text-xs tracking-wider text-muted">
        {dateParts.year}
      </span>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full w-full drop-shadow-sm sm:min-h-[160px]"
    >
      {/* الطبقة الخارجية = لون الحد */}
      <div
        className="h-full w-full rounded-2xl bg-border [-webkit-mask:var(--mask-v)] [mask:var(--mask-v)] sm:[-webkit-mask:var(--mask-h)] sm:[mask:var(--mask-h)]"
        style={outerStyle}
      >
        {/* الطبقة الداخلية = محتوى التذكرة */}
        <div
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[15px] bg-surface [-webkit-mask:var(--mask-v)] [mask:var(--mask-v)] sm:min-h-[158px] sm:flex-row sm:[-webkit-mask:var(--mask-h)] sm:[mask:var(--mask-h)]"
          style={innerStyle}
        >
          {/* Event Image */}
          <div
            className="relative h-[170px] w-full shrink-0 overflow-hidden [-webkit-mask:var(--scallop-v)] [mask:var(--scallop-v)] sm:h-auto sm:w-[34%] sm:[-webkit-mask:var(--scallop-h)] sm:[mask:var(--scallop-h)]"
            style={imageStyle}
          >
            <img
              src={event.image}
              alt={event.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Event Info */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 px-4 py-4">
            <div>
              <h3 className="text-lg font-semibold leading-snug text-foreground">
                {event.name}
              </h3>

              {event.description && (
                <p className="mt-1 line-clamp-3 text-xs leading-snug text-muted">
                  {event.description}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5 text-xs leading-normal text-foreground">
                <p className="flex items-center gap-1.5">
                  <CiCalendarDate className="h-4 w-4 shrink-0" />
                  <span className="truncate">{event.date}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <IoTimeOutline className="h-4 w-4 shrink-0" />
                  <span className="truncate">{event.time}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CiLocationOn className="h-4 w-4 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>
              </div>

              {/* Register Button */}
              {registrationClosed ? (
                <span className="flex h-8 shrink-0 items-center rounded-full border border-border px-4 text-xs font-medium leading-none text-muted">
                  <span dir={dir}>{t("registrationClosed")}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onRegister(event)}
                  className="flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium leading-none text-background"
                >
                  <span dir={dir}>{t("register")}</span>
                  <svg
                    className="h-3.5 w-3.5 rtl:-scale-x-100"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date stub */}
          {dateParts && (
            <div
              className="flex shrink-0 items-center justify-center gap-3 border-t-2 border-dashed border-border text-foreground sm:w-[83px] sm:flex-col sm:gap-0 sm:border-t-0 sm:border-s-2"
              style={{ minHeight: STUB_HEIGHT - BORDER }}
            >
              {dateStubContent}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
