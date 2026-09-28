"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, NavNode } from "@/config/nav";

function Icon({ name }: { name: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "grid":
      return (<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
    case "clinic":
      return (<svg {...p}><path d="M4 21V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15" /><path d="M9 8h4M9 12h4M9 16h4" /><path d="M17 11h3v10H4" /></svg>);
    case "hospital":
      return (<svg {...p}><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" /><path d="M2 21h20" /><path d="M12 7v6M9 10h6" /></svg>);
    case "pathogen":
      return (<svg {...p}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>);
    case "emergency":
      return (<svg {...p}><path d="M12 3l1.8 4.2L18 8l-3 3 .8 4.5L12 13.7 8.2 15.5 9 11 6 8l4.2-.8z" /><circle cx="12" cy="12" r="9" opacity="0" /></svg>);
    case "vaccine":
      return (<svg {...p}><path d="M18 2l4 4M17 3l4 4M14.5 6.5l3 3M15.5 8.5L8 16l-3 1-1 3-1-1 3-1 1-3 7.5-7.5" /></svg>);
    case "info":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
    default:
      return null;
  }
}

function Caret() {
  return (
    <svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function sectionOf(node: NavNode, pathname: string): boolean {
  if (node.href && !node.external) return pathname === node.href;
  if (node.children) return node.children.some((c) => pathname === c.href);
  if (node.groups) return node.groups.some((g) => g.children.some((c) => pathname === c.href));
  return false;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const n of NAV) if (sectionOf(n, pathname)) o[n.key] = true;
    return o;
  });
  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const n of NAV)
      if (n.groups)
        for (const g of n.groups)
          if (g.children.some((c) => pathname === c.href)) o[n.key + "::" + g.label] = true;
    return o;
  });

  const toggle = (k: string) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  const toggleG = (k: string) => setOpenGroup((s) => ({ ...s, [k]: !s[k] }));

  return (
    <aside className="sidebar">
      <div className="brand">
        <Link href="/">
          <Image src="/fluon-logo.png" alt="FluON" width={150} height={62} priority />
        </Link>
      </div>

      <nav className="nav">
        {NAV.map((node) => {
          const active = sectionOf(node, pathname);
          if (node.href) {
            const cls = "nav-item" + (active ? " active" : "");
            return node.external ? (
              <a key={node.key} className={cls} href={node.href} target="_blank" rel="noreferrer">
                <span className="nav-ico"><Icon name={node.icon} /></span>
                <span className="nav-label">{node.label}</span>
              </a>
            ) : (
              <Link key={node.key} className={cls} href={node.href}>
                <span className="nav-ico"><Icon name={node.icon} /></span>
                <span className="nav-label">{node.label}</span>
              </Link>
            );
          }
          const isOpen = open[node.key] ?? false;
          return (
            <div className="nav-group" key={node.key}>
              <button className={"nav-parent" + (isOpen ? " open" : "")} onClick={() => toggle(node.key)}>
                <span className="nav-ico"><Icon name={node.icon} /></span>
                <span className="nav-label">{node.label}</span>
                <Caret />
              </button>

              {isOpen && (
                <div className="subnav">
                  <div className="subnav-inner">
                    {node.children?.map((c) => (
                      <Link key={c.href} href={c.href} className={"sub-item" + (pathname === c.href ? " active" : "")}>
                        {c.label}
                      </Link>
                    ))}

                    {node.groups?.map((g) => {
                      const gk = node.key + "::" + g.label;
                      const gOpen = openGroup[gk] ?? false;
                      return (
                        <div key={gk}>
                          <button className={"sub-group-label" + (gOpen ? " open" : "")} onClick={() => toggleG(gk)}>
                            <span>{g.label}</span>
                            <Caret />
                          </button>
                          {gOpen &&
                            g.children.map((c) => (
                              <Link key={c.href} href={c.href} className={"sub-item sub-sub" + (pathname === c.href ? " active" : "")}>
                                {c.label}
                              </Link>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="kdca">
          <Image src="/kdca-logo-white.png" alt="KDCA" width={34} height={34} />
          <span>질병관리청<br />KDCA</span>
        </div>
        <div className="dept">
          담당부서
          <strong>질병관리청 감염병관리과</strong>
        </div>
      </div>
    </aside>
  );
}
