"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Space_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

// ── Types ──────────────────────────────────────────────────────────────────

type LogRow = {
  id: string;
  agent_name: string;
  run_at: string;
  status: "success" | "error" | "skipped";
  summary: Record<string, unknown> | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
};

type Metrics = { mrr: number; users: number; emails: number };

// ── Roster ─────────────────────────────────────────────────────────────────
// display: shown in UI  |  dbName: agent_name column in agent_logs

const ROSTER = [
  { display: "ContractForge Agent", dbName: "metrics" },
  { display: "OutreachForge Agent", dbName: "outreach" },
  { display: "ClientForge Agent",   dbName: "client" },
  { display: "MeetingForge Agent",  dbName: "meeting" },
  { display: "SpecForge Agent",     dbName: "spec" },
  { display: "ReputationForge Agent", dbName: "reputation" },
  { display: "FounderOS Agent",     dbName: "founderos" },
] as const;

// ── Pure helpers ───────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function agentStatus(logs: LogRow[], dbName: string): "active" | "idle" | "error" {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = logs.filter(
    (l) => l.agent_name === dbName && new Date(l.created_at).getTime() > cutoff,
  );
  if (recent.length === 0) return "idle";
  if (recent.some((l) => l.status === "error")) return "error";
  return "active";
}

function actionLabel(log: LogRow): string {
  const action = log.summary?.["action"];
  return typeof action === "string" ? action : log.agent_name;
}

function deriveMetrics(logs: LogRow[]): Metrics {
  const metricsRow = logs.find(
    (l) => l.agent_name === "metrics" && l.status === "success" && l.summary,
  );
  const mrr   = Number(metricsRow?.summary?.["mrr_inr"]     ?? 2499);
  const users  = Number(metricsRow?.summary?.["total_users"] ?? 0);
  const emails = logs.filter((l) => l.summary?.["action"] === "email_sent").length;
  return { mrr, users, emails };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "active" | "idle" | "error" }) {
  const color =
    status === "active" ? "#3EB489" : status === "error" ? "#ef4444" : "#f59e0b";
  return (
    <span className="relative flex h-2 w-2 shrink-0 mt-[3px]">
      {status === "active" && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function StatusBadge({ status }: { status: LogRow["status"] }) {
  if (status === "success")
    return (
      <span className="text-[9px] leading-none text-[#3EB489] border border-[#3EB489]/25 rounded px-1.5 py-[3px]">
        success
      </span>
    );
  if (status === "error")
    return (
      <span className="text-[9px] leading-none text-red-400 border border-red-500/25 rounded px-1.5 py-[3px]">
        error
      </span>
    );
  return (
    <span className="text-[9px] leading-none text-amber-400 border border-amber-500/25 rounded px-1.5 py-[3px]">
      skipped
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</p>
      <p className="text-xl font-semibold text-zinc-100 tabular-nums">{value}</p>
    </div>
  );
}

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">{label}</span>
      <span className="text-[11px] text-zinc-300 tabular-nums font-medium">{value}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const PANEL = "bg-white/[0.04] border border-white/[0.07] backdrop-blur-md rounded-xl overflow-hidden";
const SECTION_LABEL = "text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-4 shrink-0";

export default function WarRoomPage() {
  const router = useRouter();
  const [ready, setReady]   = useState(false);
  const [logs,  setLogs]    = useState<LogRow[]>([]);
  const [,      setTick]    = useState(0);

  // Auth gate — same client-side pattern as /dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/signin");
        return;
      }
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (adminEmail && session.user.email !== adminEmail) {
        router.replace("/dashboard");
        return;
      }
      setReady(true);
    });
  }, [router]);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!ready) return;

    supabase
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setLogs(data as LogRow[]);
      });

    const channel = supabase
      .channel("war_room_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as LogRow, ...prev].slice(0, 50));
        },
      )
      .subscribe();

    // Refresh relative timestamps every 30 s without a data fetch
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center">
        <span className="text-[10px] text-zinc-700 animate-pulse font-mono tracking-[0.3em]">
          AUTHORIZING
        </span>
      </div>
    );
  }

  const metrics = deriveMetrics(logs);

  return (
    <div
      className={`${spaceMono.className} h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 flex flex-col`}
    >
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-white/[0.06] h-11 px-5 flex items-center gap-3">
        <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">ContractForge</span>
        <span className="text-zinc-800">·</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">War Room</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3EB489] animate-pulse" />
          <span className="text-[8px] uppercase tracking-[0.22em] text-zinc-600">Live</span>
        </div>
      </header>

      {/* ── Three panels ── */}
      <main className="flex-1 flex gap-2.5 p-2.5 min-h-0">

        {/* Panel 1 — AgentRoster 25% */}
        <aside className={`w-1/4 shrink-0 flex flex-col ${PANEL} p-4`}>
          <p className={SECTION_LABEL}>Agents</p>
          <ul className="flex-1 space-y-3 overflow-y-auto">
            {ROSTER.map(({ display, dbName }) => {
              const st      = agentStatus(logs, dbName);
              const lastLog = logs.find((l) => l.agent_name === dbName);
              return (
                <li key={dbName} className="flex items-start gap-2.5">
                  <StatusDot status={st} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-zinc-300 leading-tight truncate">{display}</p>
                    <p className="text-[9px] text-zinc-700 mt-0.5">
                      {lastLog ? relativeTime(lastLog.created_at) : "idle"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Panel 2 — ActivityStream 45% */}
        <section className={`flex-1 flex flex-col min-w-0 ${PANEL} p-4`}>
          <p className={SECTION_LABEL}>
            Activity Stream
            <span className="ml-2 text-zinc-800">{logs.length} entries</span>
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg bg-white/[0.025] border border-white/[0.04] px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[9px] font-medium text-[#3EB489] uppercase tracking-[0.15em] truncate">
                      {log.agent_name}
                    </span>
                    <StatusBadge status={log.status} />
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate">{actionLabel(log)}</p>
                  {log.error_message && (
                    <p className="text-[10px] text-red-400 mt-0.5 truncate">{log.error_message}</p>
                  )}
                </div>
                <span className="shrink-0 text-[9px] text-zinc-700 mt-0.5 whitespace-nowrap">
                  {relativeTime(log.created_at)}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-[11px] text-zinc-700">No activity yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Panel 3 — MetricsBar 30% */}
        <aside className={`w-[27%] shrink-0 flex flex-col ${PANEL} p-4`}>
          <p className={SECTION_LABEL}>Metrics</p>
          <div className="flex flex-col gap-2.5 flex-1">
            <MetricCard label="MRR"             value={`₹${metrics.mrr.toLocaleString("en-IN")}`} />
            <MetricCard label="Active Agents"   value="7" />
            <MetricCard label="Users"           value={String(metrics.users)} />
            <MetricCard label="Emails Sent"     value={String(metrics.emails)} />
            <MetricCard label="Pipeline Stages" value="18" />
          </div>
        </aside>

      </main>

      {/* ── Bottom strip ── */}
      <footer className="shrink-0 border-t border-white/[0.06] h-9 px-5 flex items-center gap-6">
        <FooterStat label="MRR"            value={`₹${metrics.mrr.toLocaleString("en-IN")}`} />
        <span className="text-zinc-800">·</span>
        <FooterStat label="Active Agents"  value="7" />
        <span className="text-zinc-800">·</span>
        <FooterStat label="Users"          value={String(metrics.users)} />
        <span className="text-zinc-800">·</span>
        <FooterStat label="Emails"         value={String(metrics.emails)} />
        <span className="text-zinc-800">·</span>
        <FooterStat label="Pipeline"       value="18 stages" />
      </footer>
    </div>
  );
}
