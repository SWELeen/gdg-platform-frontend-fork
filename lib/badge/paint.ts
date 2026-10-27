import type { BadgeData, BadgeTheme } from "./types";

// The badge faces, painted on a canvas. One painter feeds both the 3D badge (as
// its texture) and the flat fallback, so the two never drift apart. Cards are
// drawn in CSS pixels on a 300px wide card and scaled to whatever canvas they're
// given. Layout ported from the GDG card in the mukhaverse portfolio.

export const CARD_W = 300;
export const CARD_H = 441;
// the slot punched through the top, which the ring passes through
export const SLOT = { top: 13.6, bottom: 21.6, width: 44.8 };

export type BadgeAssets = {
  font: string;
  pattern: HTMLImageElement | null;
  photo: HTMLImageElement | null;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/** Waits for the font and images a badge needs, so the first paint is the final one. */
export async function loadBadgeAssets(data: BadgeData, theme: BadgeTheme, font: string): Promise<BadgeAssets> {
  const [pattern, photo] = await Promise.all([
    theme.patternUrl ? loadImage(theme.patternUrl) : null,
    data.photoUrl ? loadImage(data.photoUrl) : null,
    Promise.all([400, 600, 700].map((w) => document.fonts.load(`${w} 12px ${font}`))).catch(() => {}),
  ]);
  return { font, pattern, photo };
}

// ─── Helpers ───────────────────────────────────────────────

// a silhouette until there's a real photo, in a 100×125 box
const PERSON = "M50 16C31 16 22 30 22 48C22 58 24 66 21 75C28 79 36 80 42 78L42 84C24 87 10 96 8 125L92 125C90 96 76 87 58 84L58 78C64 80 72 79 79 75C76 66 78 58 78 48C78 30 69 16 50 16Z";
// the chapter mark: the GDG brackets
const GDG_MARK = "M14 3 4 10l10 7M20 3l10 7-10 7";

function begin(cv: HTMLCanvasElement) {
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  const s = cv.width / CARD_W;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, CARD_H, 16);
  ctx.clip();
  return ctx;
}

// the slot is a real hole, so the ring can pass through it; cut last
function finish(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.roundRect((CARD_W - SLOT.width) / 2, SLOT.top, SLOT.width, SLOT.bottom - SLOT.top, 4);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawPerson(ctx: CanvasRenderingContext2D, x: number, bottom: number, width: number, color: string) {
  const s = width / 100;
  ctx.save();
  ctx.translate(x, bottom - 125 * s);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(PERSON));
  ctx.restore();
}

// draws img to cover the box, cropped from the centre
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s, ih = img.height * s;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

// one line if it fits, otherwise two lines as even as the words allow
function balance(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return [text];
  const words = text.split(" ");
  let best = [text], widest = Infinity;
  for (let k = 1; k < words.length; k++) {
    const pair = [words.slice(0, k).join(" "), words.slice(k).join(" ")];
    const w = Math.max(...pair.map((s) => ctx.measureText(s).width));
    if (w < widest) { widest = w; best = pair; }
  }
  return best;
}

function strokeMark(ctx: CanvasRenderingContext2D, ink: string) {
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(GDG_MARK));
}

// ─── Faces ─────────────────────────────────────────────────

// role and committee, photo against the pattern, name, chapter mark
export function paintFront(cv: HTMLCanvasElement, data: BadgeData, t: BadgeTheme, assets: BadgeAssets) {
  const { font } = assets;
  const ctx = begin(cv);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.textAlign = "center";
  ctx.fillStyle = t.ink;
  // the committee line breaks into two even lines when it's long
  ctx.font = `400 15px ${font}`;
  const sub = balance(ctx, data.committee, CARD_W - 50);
  const subBase = sub.length > 1 ? 93 : 104;
  sub.forEach((line, k) => ctx.fillText(line, CARD_W / 2, subBase + k * 18));
  ctx.font = `700 30px ${font}`;
  ctx.fillText(data.role, CARD_W / 2, subBase - 24, CARD_W - 32);

  // the pattern strip tucked behind the photo, cropped to fill
  const top = 126, pw = 118, ph = 160, px = 61, patW = 89;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(CARD_W / 2, top, patW, ph, 10);
  ctx.clip();
  ctx.fillStyle = t.patternBg;
  ctx.fillRect(CARD_W / 2, top, patW, ph);
  if (assets.pattern) drawCover(ctx, assets.pattern, CARD_W / 2, top, patW, ph);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, top, pw, ph, 12);
  ctx.fillStyle = t.photoBg;
  ctx.fill();
  ctx.clip();
  if (assets.photo) drawCover(ctx, assets.photo, px, top, pw, ph);
  else drawPerson(ctx, px + pw * 0.1, top + ph - 18, pw * 0.8, t.bg);
  ctx.restore();
  ctx.strokeStyle = t.photoFrame;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, top, pw, ph, 12);
  ctx.stroke();

  ctx.fillStyle = t.ink;
  ctx.font = `700 21px ${font}`;
  ctx.fillText(data.name, CARD_W / 2, 330, CARD_W - 32);

  // the brackets and the chapter's two lines, centred as one group
  ctx.font = `400 10.5px ${font}`;
  const w1 = ctx.measureText(data.chapter).width;
  ctx.font = `400 8.5px ${font}`;
  const w2 = ctx.measureText(data.university).width;
  const x0 = (CARD_W - (34 + 8 + Math.max(w1, w2))) / 2;
  ctx.save();
  ctx.translate(x0, 391);
  strokeMark(ctx, t.ink);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.font = `400 10.5px ${font}`;
  ctx.fillText(data.chapter, x0 + 42, 400);
  ctx.font = `400 8.5px ${font}`;
  ctx.fillText(data.university, x0 + 42, 412);
  finish(ctx);
}

// the back: the committee's colour with the chapter mark
export function paintBack(cv: HTMLCanvasElement, data: BadgeData, t: BadgeTheme, assets: BadgeAssets) {
  const { font } = assets;
  const ctx = begin(cv);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.save();
  ctx.translate(CARD_W / 2 - 51, 160);
  ctx.scale(3, 3);
  strokeMark(ctx, t.ink);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = t.ink;
  ctx.font = `600 15px ${font}`;
  ctx.fillText(data.chapter, CARD_W / 2, 250, CARD_W - 40);
  ctx.globalAlpha = 0.75;
  ctx.font = `400 12px ${font}`;
  ctx.fillText(data.university, CARD_W / 2, 270);
  ctx.globalAlpha = 1;
  finish(ctx);
}
