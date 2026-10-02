// Client-side CSV + chart-PNG export helpers (no dependencies).

function trigger(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface Column {
  key: string;
  label: string;
}

/** Download rows as CSV (UTF-8 BOM so Excel reads Korean correctly). */
export function downloadCSV(filename: string, columns: Column[], rows: Record<string, unknown>[]) {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(",")).join("\r\n");
  trigger(new Blob(["﻿" + header + "\r\n" + body], { type: "text/csv;charset=utf-8" }), filename);
}

interface PngOpts {
  title?: string;
  subtitle?: string;
  legend?: { label: string; color: string }[];
  filename: string;
  scale?: number;
}

/** Render the first <svg> inside `container` to a PNG, with an optional
 * title + legend header drawn on top (since the legend is HTML, not SVG). */
export async function downloadChartPNG(container: HTMLElement | null, opts: PngOpts) {
  if (!container) return;
  const svg = container.querySelector("svg.recharts-surface") as SVGSVGElement | null;
  if (!svg) return;

  const scale = opts.scale ?? 2;
  const rect = svg.getBoundingClientRect();
  const chartW = Math.max(320, Math.round(rect.width));
  const chartH = Math.max(240, Math.round(rect.height));

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(chartW));
  clone.setAttribute("height", String(chartH));
  const svgStr = new XMLSerializer().serializeToString(clone);
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);

  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = svgUrl;
  });

  const padX = 24;
  const titleH = opts.title ? 34 : 0;
  const legendH = opts.legend && opts.legend.length ? 26 : 0;
  const topH = (titleH || legendH ? 16 : 0) + titleH + legendH;
  const W = chartW + padX * 2;
  const H = chartH + topH + 20;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  let y = 14;
  if (opts.title) {
    ctx.fillStyle = "#123d68";
    ctx.font = "700 17px 'Pretendard', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(opts.title, padX, y);
    const titleW = ctx.measureText(opts.title).width; // measured with the title font
    if (opts.subtitle) {
      ctx.fillStyle = "#6d7f90";
      ctx.font = "500 12px 'Pretendard', sans-serif";
      ctx.fillText(opts.subtitle, padX + titleW + 12, y + 4);
    }
    y += 30;
  }
  if (legendH) {
    let lx = padX;
    ctx.font = "600 12.5px 'Pretendard', sans-serif";
    ctx.textBaseline = "middle";
    for (const it of opts.legend!) {
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.arc(lx + 5, y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3f556a";
      ctx.fillText(it.label, lx + 14, y + 8);
      lx += 14 + ctx.measureText(it.label).width + 18;
    }
    y += legendH;
  }

  ctx.drawImage(img, padX, topH + 4, chartW, chartH);
  canvas.toBlob((blob) => blob && trigger(blob, opts.filename), "image/png");
}
