import type { Announcement, AnnouncementBlock, RichText } from "@/lib/announcements/types";

const bulletColors = ["bg-gdg-blue", "bg-gdg-red", "bg-gdg-yellow", "bg-gdg-green"];

function renderRichText(text: RichText) {
  if (typeof text === "string") return text;

  return text.map((run, index) =>
    run.strong ? (
      <strong key={index} className="font-semibold text-foreground">
        {run.text}
      </strong>
    ) : (
      <span key={index}>{run.text}</span>
    ),
  );
}

function Block({ block }: { block: AnnouncementBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-4 text-2xl font-semibold leading-snug text-foreground">{block.text}</h2>
      );
    case "paragraph":
      return <p>{renderRichText(block.text)}</p>;
    case "list":
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${bulletColors[index % bulletColors.length]}`}
              />
              <span>
                {item.label && (
                  <strong className="font-semibold text-foreground">{item.label}</strong>
                )}
                {item.label && " — "}
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside className="rounded-xl border border-border border-s-4 border-s-gdg-blue bg-surface-muted/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">{block.title}</p>
          <p className="mt-1 text-sm">{block.text}</p>
        </aside>
      );
  }
}

// Article body. Falls back to the excerpt when the announcement has no structured body.
export function AnnouncementArticle({ announcement }: { announcement: Announcement }) {
  const { body, excerpt } = announcement;

  return (
    <article className="flex min-w-0 flex-col gap-4 text-base text-gray-500">
      {body?.length ? body.map((block, index) => <Block key={index} block={block} />) : <p>{excerpt}</p>}

    </article>
  );
}
