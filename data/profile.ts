export type InfoRow = { key: string; value: string };

export type InfoCardData = {
  id: "personal" | "academic";
  rows: InfoRow[];
};

export type SocialLink = {
  platform: "github" | "linkedin" | "website";
  value: string | null;
};
