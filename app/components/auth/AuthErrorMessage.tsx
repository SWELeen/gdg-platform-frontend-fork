"use client";

import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

type AuthErrorMessageProps = {
  // A key from messages/*/validation.json, or "" for no error.
  message: string
  detailText?: string
  id?: string
  className?: string
}

// Presentational only: caller controls positioning via `className`.
export default function AuthErrorMessage({
  message,
  detailText,
  id,
  className = "",
}: AuthErrorMessageProps) {
  const t = useTranslations("validation")
  const text = message ? t(message) : ""

  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          key={`${id ?? "auth-error"}-${message}`}
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`text-xs font-normal leading-normal text-gdg-red ${className}`}
        >
          {text}
          {detailText ? <span className="mt-1 block">{detailText}</span> : null}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
