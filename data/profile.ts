export type InfoRow = { key: string; value: string };

export type InfoCardData = {
  id: "personal" | "academic";
  rows: InfoRow[];
};

export type SocialLink = {
  platform: "github" | "portfolio" | "x";
  value: string | null;
};
