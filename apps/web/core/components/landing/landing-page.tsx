/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@plane/constants";

/**
 * The public face of Flyst, shown at the app root to anyone not signed in.
 *
 * It lives in the app rather than on a separate host so one domain serves both
 * states: signed out gets this, signed in goes straight to the workspace. Every
 * call to action points at central sign-in, which is the only way in.
 */

const FEATURES = [
  {
    step: "01 / PLAN",
    title: "From backlog to next step",
    body: "Capture work as issues, set priority and state, and group it the way your team actually thinks — by module, label, assignee or cycle.",
  },
  {
    step: "02 / BUILD",
    title: "Find your team's rhythm",
    body: "Cycles turn a shared plan into steady progress, with scope and burn-down visible while there is still time to act on them.",
  },
  {
    step: "03 / SEE",
    title: "One board, every angle",
    body: "List, kanban, calendar, spreadsheet and Gantt views over the same work, saved per project so everyone lands where they left off.",
  },
];

const BOARD = [
  {
    pip: "#E77129",
    head: "In progress · 2",
    chip: "bg-[#20769F26] text-[#88C9E7]",
    items: [
      { id: "FLY-24", title: "Give every idea a clear next step", label: "Product" },
      { id: "FLY-25", title: "Bring the team into one workspace", label: "Collaboration" },
    ],
  },
  {
    pip: "#10B981",
    head: "Done · 2",
    chip: "bg-[#10B98119] text-[#6EE7B7]",
    items: [
      { id: "FLY-21", title: "Map the next release", label: "Planning" },
      { id: "FLY-22", title: "Make room for the work that matters", label: "Focus" },
    ],
  },
];

function FlystMark({ className }: { className?: string }) {
  // Geometry matches .brand/marks.py; the dot is the family signature.
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="Flyst">
      <path
        d="M8,52 L8,12 L38,12"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8,32 L32,32" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="18" r="7" fill="#E77129" />
    </svg>
  );
}

export function LandingPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next_path");
  const signInHref = `${API_BASE_URL}/auth/oidc/${nextPath ? `?next_path=${encodeURIComponent(nextPath)}` : ""}`;

  return (
    <div className="min-h-screen w-full bg-[#07141B] text-[#F1F5F9]">
      <header className="sticky top-0 z-20 border-b border-[#21404E] bg-[#07141B]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-6 py-4">
          <span className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.03em]">
            <FlystMark className="h-7 w-7 text-[#40A8D9]" />
            Flyst <span className="hidden text-[15px] font-normal text-[#8FA3AE] sm:inline">by Techyst</span>
          </span>
          <a
            href={signInHref}
            className="rounded-lg border border-[#20769F] bg-[#20769F] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1A6284]"
          >
            Sign in
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-6">
        <section className="grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-[#88C9E7] uppercase">
              <span className="h-[7px] w-[7px] rounded-full bg-[#E77129]" />
              Project planning
            </span>
            <h1 className="mt-5 text-[clamp(40px,5.5vw,64px)] leading-[1.08] font-semibold tracking-[-0.04em]">
              Good ideas.
              <br />
              Clear plans.
              <br />
              <span className="text-[#88C9E7]">Work that moves.</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-[#8FA3AE]">
              Flyst gives your projects a home. Issues, cycles and the people behind them, together in one workspace
              that stays out of the way.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={signInHref}
                className="rounded-lg border border-[#20769F] bg-[#20769F] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1A6284]"
              >
                Open Flyst ↗
              </a>
              <a
                href="#features"
                className="rounded-lg border border-[#21404E] px-5 py-3 text-[14px] font-medium text-[#F1F5F9] transition-colors hover:bg-[#0E212B]"
              >
                See what's inside
              </a>
            </div>
            <p className="mt-4 text-[13px] text-[#68808D]">
              One Techyst account signs you in across every connected app.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-xl border border-[#21404E] bg-[#0E212B] shadow-[0_34px_80px_-22px_#000a]"
            role="img"
            aria-label="Example Flyst board: two work items in progress, two done in cycle 04."
          >
            <div className="flex items-center justify-between border-b border-[#21404E] px-5 py-3.5 text-[13px]">
              <strong className="font-semibold">Product launch</strong>
              <span className="font-mono text-[11px] text-[#68808D]">CYCLE 04</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 p-4">
              {BOARD.map((col) => (
                <div key={col.head}>
                  <p className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.1em] text-[#8FA3AE] uppercase">
                    <span className="h-2 w-2 rounded-full" style={{ background: col.pip }} />
                    {col.head}
                  </p>
                  {col.items.map((item) => (
                    <div key={item.id} className="mb-2.5 rounded-lg border border-[#21404E] bg-[#16323F] p-3.5 text-[12.5px]">
                      <span className="mb-1.5 block font-mono text-[10px] text-[#68808D]">{item.id}</span>
                      {item.title}
                      <span className={`mt-2.5 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${col.chip}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-[#21404E] py-16">
          <h2 className="max-w-[620px] text-[clamp(26px,3.4vw,36px)] leading-tight font-semibold tracking-[-0.035em]">
            Everything a plan needs, nothing it doesn't.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.step} className="rounded-xl border border-[#21404E] bg-[#0E212B] p-6">
                <span className="font-mono text-[11px] tracking-[0.08em] text-[#40A8D9]">{f.step}</span>
                <h3 className="mt-2.5 text-[17px] font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#8FA3AE]">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[#21404E] py-20 text-center">
          <h2 className="text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em]">
            Make space for your next project.
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-[#8FA3AE]">
            Bring the plan, the work and the team together — and get back to shipping.
          </p>
          <a
            href={signInHref}
            className="mt-8 inline-block rounded-lg border border-[#20769F] bg-[#20769F] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1A6284]"
          >
            Open Flyst ↗
          </a>
        </section>
      </main>

      <footer className="border-t border-[#21404E] py-8 text-[13px] text-[#68808D]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E77129]" />
            Flyst is part of the Techyst family.
          </span>
          <span>
            Built on{" "}
            <a href="https://github.com/makeplane/plane" className="text-[#8FA3AE] hover:text-[#F1F5F9]">
              Plane
            </a>
            , open source under AGPL-3.0
          </span>
        </div>
      </footer>
    </div>
  );
}
