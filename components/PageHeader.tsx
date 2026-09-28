import type { InfoBox } from "@/config/pages";

export default function PageHeader({
  eyebrow,
  title,
  desc,
  boxes,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  boxes?: InfoBox[];
}) {
  return (
    <header className="page-head">
      <p className="page-eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {desc && <p className="page-desc">{desc}</p>}
      {boxes && boxes.length > 0 && (
        <div className="info-row">
          {boxes.map((b, i) => (
            <div className="info-box" key={i}>
              <span className={"info-tag " + b.tag}>{b.label}</span>
              {b.tag === "term" ? (
                <span>
                  <b>{b.term}</b> <span className="muted">{b.def}</span>
                </span>
              ) : (
                <span>{b.text}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
