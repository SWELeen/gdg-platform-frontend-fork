import type { SocialLink } from "@/data/profile";

const requiredDomain: Partial<Record<SocialLink["platform"], string>> = {
  github: "github.com",
  x: "x.com",
};

// Empty values are allowed (renders as "Not added yet") — only non-empty values
// are checked, so clearing a field is always a valid way to remove a link.
// Returns a key from messages/*/validation.json, or null when valid.
export function validateSocialLink(
  platform: SocialLink["platform"],
  value: string,
): string | null {
  if (!value.trim()) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "urlInvalid";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "urlProtocol";
  }

  const domain = requiredDomain[platform];
  if (domain && url.hostname !== domain && !url.hostname.endsWith(`.${domain}`)) {
    return `${platform}Domain`;
  }

  return null;
}
