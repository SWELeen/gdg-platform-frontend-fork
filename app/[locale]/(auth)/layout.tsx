"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { TopNav } from "@/components/dashboard/TopNav"
import Footer from "@/components/Footer"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-surface text-foreground">
      <TopNav />
      <motion.div
        key={pathname}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
      <Footer />
    </div>
  )
}
