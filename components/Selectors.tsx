"use client";

import { useEffect, useRef, useState } from "react";

function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

const Caret = () => <span className="car">▾</span>;

export function SingleSelect({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const fmt = format ?? ((v) => v);
  return (
    <div className="selector" ref={ref}>
      <button className="select-box" onClick={() => setOpen((o) => !o)}>
        <span className="lbl">{label}</span>
        <span className="val">{fmt(value)}</span>
        <Caret />
      </button>
      {open && (
        <div className="popover">
          {options.map((o) => (
            <button
              key={o}
              className={"opt" + (o === value ? " sel" : "")}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {fmt(o)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  format,
}: {
  label: string;
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
  format?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const fmt = format ?? ((v) => v);
  const toggle = (o: string) => {
    if (values.includes(o)) onChange(values.filter((v) => v !== o));
    else onChange(options.filter((x) => values.includes(x) || x === o));
  };
  const allSelected = values.length === options.length;
  return (
    <div className="selector" ref={ref}>
      <button className="select-box" onClick={() => setOpen((o) => !o)}>
        <span className="lbl">{label}</span>
        <span className="val">{values.length}개 선택</span>
        <Caret />
      </button>
      {open && (
        <div className="popover">
          <button className="opt" onClick={() => onChange(allSelected ? [] : options.slice())}>
            <span className="chk">{allSelected ? "✓" : ""}</span>
            <span>전체 선택</span>
          </button>
          {options.map((o) => {
            const sel = values.includes(o);
            return (
              <button key={o} className={"opt" + (sel ? " sel" : "")} onClick={() => toggle(o)}>
                <span className="chk">{sel ? "✓" : ""}</span>
                <span>{fmt(o)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
