import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";

// ── ItemList ──────────────────────────────────────────────────────────────────

describe("ItemList", () => {
  it("renders empty state", () => {
    render(<ItemList items={[]} />);
    expect(screen.getByText(/no items yet/i)).toBeTruthy();
  });
});

// ── ItemForm — PDF download button (Bug S9-1) ─────────────────────────────────

/** Fill every required field so the zod schema passes. */
function fillForm(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    "e.g. Web Development": "Web Development",
    "Rahul Sharma": "Ravi Kumar",
    "Sharma Enterprises Pvt Ltd": "Kumar Corp Pvt Ltd",
    "75000": "50000",
    "50% advance, 50% on delivery": "50% advance, 50% on delivery",
    "30 days from signing": "30 days",
    "Describe deliverables…": "Build a custom web application for the client",
  };
  const values = { ...defaults, ...overrides };

  for (const [placeholder, value] of Object.entries(values)) {
    const el = screen.queryByPlaceholderText(placeholder);
    if (el) fireEvent.change(el, { target: { value } });
  }
}

describe("ItemForm — PDF download button (Bug S9-1)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "cf-20260607000000",
        content: "SERVICE AGREEMENT\n\n1. PARTIES\n...",
        created_at: "2026-06-07T00:00:00",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows Download PDF button after successful contract generation", async () => {
    const onCreated = vi.fn();
    render(<ItemForm userEmail="user@test.com" onCreated={onCreated} />);

    fillForm();
    fireEvent.click(screen.getByText("Generate Contract"));

    await waitFor(() => {
      expect(screen.getByText("Download PDF")).toBeTruthy();
    }, { timeout: 3000 });

    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cf-20260607000000" })
    );
  });

  it("Download PDF button is absent before any generation", () => {
    render(<ItemForm userEmail="user@test.com" onCreated={vi.fn()} />);
    expect(screen.queryByText("Download PDF")).toBeNull();
  });
});

// ── ItemForm — real data wiring to export endpoint (Bugs S9-2, S9-6) ─────────

describe("ItemForm — export request wires real form values (Bugs S9-2 + S9-6)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    // jsdom does not implement URL.createObjectURL — stub it so downloads don't throw
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:mock-url"),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("passes client_name, client_company, amount, timeline, payment_schedule, and deliverables to the export endpoint", async () => {
    // First fetch = generate
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: "cf-export-test-001",
        content: "CONTRACT CONTENT",
        created_at: "2026-06-07T00:00:00",
      }),
    });

    // Second fetch = export (PDF download)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(["PDF"], { type: "application/pdf" }),
    });

    render(<ItemForm userEmail="buyer@company.com" onCreated={vi.fn()} />);

    fillForm({
      "Rahul Sharma": "Acme Client Name",
      "Sharma Enterprises Pvt Ltd": "Acme Technologies Pvt Ltd",
      "75000": "100000",
      "50% advance, 50% on delivery": "100% on final delivery",
      "30 days from signing": "60 days from agreement",
      "Describe deliverables…": "Build a mobile app for iOS and Android",
    });

    fireEvent.click(screen.getByText("Generate Contract"));
    await waitFor(() => screen.getByText("Download PDF"), { timeout: 3000 });

    fireEvent.click(screen.getByText("Download PDF"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }, { timeout: 3000 });

    const [exportUrl, exportInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(exportUrl).toContain("/contracts/cf-export-test-001/export");

    const body = JSON.parse(exportInit.body as string);
    expect(body.client_name).toBe("Acme Client Name");
    expect(body.client_company).toBe("Acme Technologies Pvt Ltd");
    expect(body.amount).toBe(100000);
    expect(body.timeline).toBe("60 days from agreement");
    expect(body.payment_schedule).toBe("100% on final delivery");
    expect(Array.isArray(body.deliverables)).toBe(true);
    expect(body.deliverables.join(" ")).toContain("Build a mobile app for iOS and Android");
  });

  it("includes user_email in the export request body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: "cf-export-test-002",
        content: "CONTRACT",
        created_at: "2026-06-07T00:00:00",
      }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(["PDF"], { type: "application/pdf" }),
    });

    render(<ItemForm userEmail="test.freelancer@example.com" onCreated={vi.fn()} />);
    fillForm();
    fireEvent.click(screen.getByText("Generate Contract"));
    await waitFor(() => screen.getByText("Download PDF"), { timeout: 3000 });
    fireEvent.click(screen.getByText("Download PDF"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: 3000 });

    const body = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(body.user_email).toBe("test.freelancer@example.com");
  });
});
