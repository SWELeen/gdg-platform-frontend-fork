type ProfileChipsProps = {
  chips: string[];
};

export function ProfileChips({ chips }: ProfileChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:justify-start">
      {chips.map((chip, index) => {
        const isMajor = index === 0;

        return (
          <span
            key={`${chip}-${index}`}
            className={
             isMajor
             ? "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-medium text-[var(--profile-navy-ink)] dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-100"
            : "inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 dark:border-[var(--profile-navy-border-strong)] dark:bg-surface dark:text-white"
}
          >
            {chip}
          </span>
        );
      })}
    </div>
  );
}