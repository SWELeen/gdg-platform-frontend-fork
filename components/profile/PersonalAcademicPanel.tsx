"use client";

import { motion } from "framer-motion";
import { InfoCard } from "@/components/profile/InfoCard";
import type { InfoCardData } from "@/data/profile";

type PersonalAcademicPanelProps = {
  personalInfo: InfoCardData;
  academicInfo: InfoCardData;
  isEditing: boolean;
  values: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (key: string, value: string) => void;
};

export function PersonalAcademicPanel({
  personalInfo,
  academicInfo,
  isEditing,
  values,
  errors,
  onChange,
}: PersonalAcademicPanelProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        className="flex w-full min-w-0"
      >
        <InfoCard
          data={personalInfo}
          isEditing={isEditing}
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        className="flex w-full min-w-0"
      >
        <InfoCard
          data={academicInfo}
          isEditing={isEditing}
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </motion.div>
    </motion.div>
  );
}
