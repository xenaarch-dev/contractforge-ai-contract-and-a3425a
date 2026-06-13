"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

const ROSTER = [
  { display: "ContractForge Agent",  dbName: "metrics"    },
  { display: "OutreachForge Agent",  dbName: "outreach"   },
  { display: "ClientForge Agent",    dbName: "client"     },
  { display: "MeetingForge Agent",   dbName: "meeting"    },
  { display: "SpecForge Agent",      dbName: "spec"       },
  { display: "ReputationForge Agent",dbName: "reputation" },
  { display: "FounderOS Agent",      dbName: "founderos"  },
] as const;

// ── Pure helpers ───────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
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
  const mrr    = Number(metricsRow?.summary?.["mrr_inr"]     ?? 2499);
  const users  = Number(metricsRow?.summary?.["total_users"] ?? 0);
  const emails = logs.filter((l) => l.summary?.["action"] === "email_sent").length;
  return { mrr, users, emails };
}

// ── Design tokens ──────────────────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  background: "#130F18",
  border: "1px solid rgba(201,160,101,0.12)",
  borderRadius: 2,
  boxShadow: "0 0 40px rgba(139,26,26,0.06) inset",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "active" | "idle" | "error" }) {
  const cfg = {
    active: { color: "#3EB489", shadow: "0 0 8px #3EB489, 0 0 14px rgba(62,180,137,0.3)"  },
    idle:   { color: "#D9832A", shadow: "0 0 6px rgba(217,131,42,0.4)"                     },
    error:  { color: "#C41E1E", shadow: "0 0 8px #C41E1E, 0 0 14px rgba(196,30,30,0.3)"   },
  }[status];
  return (
    <span
      className={status === "active" ? "animate-pulse" : ""}
      style={{
        display: "inline-block",
        flexShrink: 0,
        marginTop: 4,
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: cfg.color,
        boxShadow: cfg.shadow,
      }}
    />
  );
}

function agentBadgeColor(log: LogRow): string {
  if (log.status === "error")   return "#C41E1E";
  if (log.status === "success") return "#3EB489";
  return "#C9A065";
}

function StatusBadge({ status }: { status: LogRow["status"] }) {
  const cfg = {
    success: { bg: "rgba(62,180,137,0.15)",  color: "#3EB489", label: "success" },
    error:   { bg: "rgba(139,26,26,0.18)",   color: "#C41E1E", label: "error"   },
    skipped: { bg: "rgba(122,95,58,0.18)",   color: "#7A5F3A", label: "skipped" },
  }[status];
  return (
    <span
      className="font-space-mono"
      style={{
        fontSize: 8,
        lineHeight: 1,
        padding: "3px 6px",
        borderRadius: 2,
        backgroundColor: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 mb-4">
      <p
        className="font-space-mono uppercase"
        style={{ fontSize: 10, letterSpacing: "0.2em", color: "#C9A065" }}
      >
        {children}
      </p>
      <div style={{ marginTop: 6, height: 1, background: "rgba(122,95,58,0.2)" }} />
    </div>
  );
}

function MetricCard({ label, value, isGold }: { label: string; value: string; isGold?: boolean }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(122,95,58,0.1)", padding: "8px 0" }}>
      <p
        className="font-space-mono uppercase"
        style={{ fontSize: 9, letterSpacing: "0.18em", color: "#A89F94", marginBottom: 2 }}
      >
        {label}
      </p>
      <p
        className="font-cormorant"
        style={{ fontSize: 42, fontWeight: 300, lineHeight: 1.05, color: isGold ? "#C9A065" : "#E8E0D0" }}
      >
        {value}
      </p>
    </div>
  );
}

function FooterStat({ label, value, isGold }: { label: string; value: string; isGold?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="font-space-mono uppercase"
        style={{ fontSize: 9, letterSpacing: "0.18em", color: "#A89F94" }}
      >
        {label}
      </span>
      <span
        className="font-space-mono tabular-nums"
        style={{ fontSize: 11, color: isGold ? "#C9A065" : "#A89F94" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function WarRoomPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [logs,  setLogs]  = useState<LogRow[]>([]);
  const [,      setTick]  = useState(0);

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
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{ background: "#040208" }}
      >
        <span
          className="font-space-mono animate-pulse"
          style={{ fontSize: 10, color: "#7A5F3A", letterSpacing: "0.3em" }}
        >
          AUTHORIZING
        </span>
      </div>
    );
  }

  const metrics = deriveMetrics(logs);

  return (
    <div
      className="min-h-screen w-screen overflow-y-auto md:h-screen md:overflow-hidden flex flex-col"
      style={{ background: "#040208" }}
    >
      {/* Crimson depth gradient */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(139,26,26,0.08) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-col md:h-full">

        {/* ── Header ── */}
        <header
          className="shrink-0 h-11 px-5 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(201,160,101,0.15)" }}
        >
          <span
            className="font-space-mono uppercase"
            style={{ fontSize: 9, letterSpacing: "0.22em", color: "#A89F94" }}
          >
            CONTRACTFORGE
          </span>
          <span style={{ color: "rgba(201,160,101,0.3)", fontSize: 11 }}>→</span>
          <span
            className="font-space-mono uppercase"
            style={{ fontSize: 9, letterSpacing: "0.18em", color: "#A89F94" }}
          >
            WAR ROOM
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="rounded-full animate-pulse"
              style={{ width: 6, height: 6, backgroundColor: "#3EB489", display: "inline-block" }}
            />
            <span
              className="font-space-mono uppercase"
              style={{ fontSize: 8, letterSpacing: "0.22em", color: "#3EB489" }}
            >
              LIVE
            </span>
          </div>
        </header>

        {/* ── Three panels ── */}
        <main className="flex-1 flex flex-col md:flex-row gap-2.5 p-2.5 md:min-h-0">

          {/* Panel 1 — AgentRoster 25% */}
          <aside className="w-full md:w-1/4 shrink-0 flex flex-col p-4" style={PANEL_STYLE}>
            <SectionLabel>Agents</SectionLabel>
            <ul className="grid grid-cols-2 md:block md:flex-1 md:overflow-y-auto gap-x-2">
              {ROSTER.map(({ display, dbName }) => {
                const st      = agentStatus(logs, dbName);
                const lastLog = logs.find((l) => l.agent_name === dbName);
                return (
                  <li
                    key={dbName}
                    className="flex items-start gap-2.5 py-3"
                    style={{ borderBottom: "1px solid rgba(122,95,58,0.08)" }}
                  >
                    <StatusDot status={st} />
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-cormorant leading-tight truncate"
                        style={{ fontSize: 16, fontWeight: 400, color: "#E8E0D0" }}
                      >
                        {display}
                      </p>
                      <p
                        className="font-space-mono mt-0.5"
                        style={{ fontSize: 9, color: "#A89F94" }}
                      >
                        {lastLog ? relativeTime(lastLog.created_at) : "idle"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Panel 2 — ActivityStream 45% */}
          <section className="flex-1 flex flex-col min-w-0 p-4 max-h-[50vh] md:max-h-none" style={PANEL_STYLE}>
            <SectionLabel>
              Activity Stream{" "}
              <span style={{ color: "rgba(201,160,101,0.3)" }}>{logs.length}</span>
            </SectionLabel>
            <div className="flex-1 overflow-y-auto pr-0.5" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-3 py-2 transition-colors duration-150"
                  style={{ borderRadius: 2 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(201,160,101,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="font-space-mono uppercase"
                        style={{ fontSize: 8, letterSpacing: "0.15em", color: agentBadgeColor(log) }}
                      >
                        {log.agent_name}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p
                      className="font-cormorant italic truncate"
                      style={{ fontSize: 14, color: "#E8E0D0" }}
                    >
                      {actionLabel(log)}
                    </p>
                    {log.error_message && (
                      <p
                        className="font-space-mono mt-0.5 truncate"
                        style={{ fontSize: 9, color: "#C41E1E", opacity: 0.7 }}
                      >
                        {log.error_message}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 font-space-mono mt-0.5 whitespace-nowrap"
                    style={{ fontSize: 9, color: "#A89F94" }}
                  >
                    {relativeTime(log.created_at)}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="flex items-center justify-center h-32">
                  <p className="font-space-mono" style={{ fontSize: 11, color: "rgba(122,95,58,0.5)" }}>
                    No activity yet
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Panel 3 — MetricsBar 27% */}
          <aside className="w-full md:w-[27%] shrink-0 flex flex-col p-4" style={PANEL_STYLE}>
            <SectionLabel>Metrics</SectionLabel>
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:flex-1 md:justify-between md:gap-0">
              <MetricCard label="MRR"             value={`₹${metrics.mrr.toLocaleString("en-IN")}`} isGold />
              <MetricCard label="Active Agents"   value="7" />
              <MetricCard label="Users"           value={String(metrics.users)} />
              <MetricCard label="Emails Sent"     value={String(metrics.emails)} />
              <MetricCard label="Pipeline Stages" value="18" />
            </div>
          </aside>

        </main>

        {/* ── Bottom strip ── */}
        <footer
          className="shrink-0 h-9 px-5 flex items-center gap-5 overflow-x-auto"
          style={{
            background: "rgba(13,8,16,0.95)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(201,160,101,0.15)",
          }}
        >
          <FooterStat label="MRR"           value={`₹${metrics.mrr.toLocaleString("en-IN")}`} isGold />
          <span style={{ color: "rgba(201,160,101,0.2)" }}>·</span>
          <FooterStat label="Active Agents" value="7" />
          <span style={{ color: "rgba(201,160,101,0.2)" }}>·</span>
          <FooterStat label="Users"         value={String(metrics.users)} />
          <span style={{ color: "rgba(201,160,101,0.2)" }}>·</span>
          <FooterStat label="Emails"        value={String(metrics.emails)} />
          <span style={{ color: "rgba(201,160,101,0.2)" }}>·</span>
          <FooterStat label="Pipeline"      value="18 stages" />
        </footer>

      </div>
    </div>
  );
}
