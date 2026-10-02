"use client";

export default function ChartActions({
  onCSV,
  onPNG,
  disabled,
}: {
  onCSV: () => void;
  onPNG: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="chart-actions">
      <button className="chart-act-btn" onClick={onCSV} disabled={disabled} title="데이터 CSV 다운로드">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M8 11l4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        CSV
      </button>
      <button className="chart-act-btn" onClick={onPNG} disabled={disabled} title="차트 PNG 저장">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 16l-5-5-7 7" />
        </svg>
        PNG
      </button>
    </div>
  );
}
