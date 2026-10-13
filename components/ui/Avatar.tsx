const sizeClasses = {
  sm: "size-16 text-xl", 
  md: "size-28 text-4xl ",
  lg: "size-18 sm:size-22 md:size-26 lg:size-30 text-2xl sm:text-3xl md:text-3xl lg:text-4xl ",
} as const;

type AvatarProps = {
  initials: string;
  imageUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function Avatar({
  initials,
  imageUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  
  return (
  <div
    className={`shrink-0 rounded-full bg-[conic-gradient(#4285F4_0deg_90deg,#EA4335_90deg_180deg,#FBBC05_180deg_270deg,#34A853_270deg_360deg)] p-1 ${sizeClasses[size]} ${className}`}
  >
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-5xl font-bold text-[#1E3A5F] dark:bg-[#1E1E1E] dark:text-5xl dark:text-white">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  </div>
);
}