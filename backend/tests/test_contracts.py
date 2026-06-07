"""Tests for PDF contract builder (Bugs S9-2, S9-3, S9-6)."""
from __future__ import annotations

import io

import pypdf
import pytest

from backend.app.routers.contracts import ContractExportRequest, _build_pdf


def _extract_text(pdf_bytes: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


# ── S9-3: ENTIRE AGREEMENT section must be present ────────────────────────────

def test_pdf_contains_entire_agreement_section():
    """Bug S9-3 — _build_pdf() must emit an ENTIRE AGREEMENT clause."""
    req = ContractExportRequest(
        user_email="test@example.com",
        client_name="Test Client",
        client_company="Test Co Pvt Ltd",
        amount=50000,
        timeline="30 days from agreement date",
        payment_schedule="50% advance, 50% on delivery",
        deliverables=["Build a test widget"],
    )
    text = _extract_text(_build_pdf("cf-test-s9-3", req))
    assert "ENTIRE AGREEMENT" in text, "PDF must contain the ENTIRE AGREEMENT section heading"
    assert "entire agreement between the parties" in text.lower(), (
        "PDF must contain the merger / entire-agreement boilerplate text"
    )


# ── S9-3: section order — ENTIRE AGREEMENT before SIGNATURES ─────────────────

def test_entire_agreement_appears_before_signatures():
    """ENTIRE AGREEMENT (section 7) must precede SIGNATURES (section 8)."""
    req = ContractExportRequest(
        user_email="test@example.com",
        client_name="Order Test Client",
        client_company="Order Co",
        amount=30000,
        timeline="15 days",
        payment_schedule="100% upfront",
        deliverables=["Design work"],
    )
    text = _extract_text(_build_pdf("cf-test-order", req))
    entire_pos = text.find("ENTIRE AGREEMENT")
    signatures_pos = text.find("SIGNATURES")
    assert entire_pos != -1, "ENTIRE AGREEMENT section must exist"
    assert signatures_pos != -1, "SIGNATURES section must exist"
    assert entire_pos < signatures_pos, (
        "ENTIRE AGREEMENT must appear before SIGNATURES in the PDF"
    )


# ── S9-2: client_name and client_company must come from the request ───────────

def test_pdf_uses_supplied_client_name_not_hardcoded_default():
    """Bug S9-2 — PDF must show the caller's client_name, not 'Rahul Sharma'."""
    req = ContractExportRequest(
        user_email="freelancer@example.com",
        client_name="Acme Technologies Pvt Ltd",
        client_company="Acme Corp",
        amount=100_000,
        timeline="45 days",
        payment_schedule="100% on delivery",
        deliverables=["Custom software platform"],
    )
    text = _extract_text(_build_pdf("cf-test-s9-2", req))
    assert "Acme Technologies Pvt Ltd" in text, (
        "PDF must include the supplied client_name"
    )
    assert "Rahul Sharma" not in text, (
        "PDF must NOT include the hardcoded default client name 'Rahul Sharma'"
    )


def test_pdf_uses_supplied_client_company():
    """Bug S9-2 — PDF must show the caller's client_company, not 'Sharma Enterprises'."""
    req = ContractExportRequest(
        user_email="freelancer@example.com",
        client_name="Ravi Kumar",
        client_company="Nexgen Solutions Pvt Ltd",
        amount=75_000,
        timeline="30 days",
        payment_schedule="50% advance, 50% delivery",
        deliverables=["API integration work"],
    )
    text = _extract_text(_build_pdf("cf-test-s9-2b", req))
    assert "Nexgen Solutions Pvt Ltd" in text, "PDF must include supplied client_company"
    assert "Sharma Enterprises" not in text, (
        "PDF must NOT include the hardcoded default company name"
    )


# ── S9-6: deliverables must come from the request, not the hardcoded template ─

def test_pdf_uses_supplied_deliverables_not_hardcoded_template():
    """Bug S9-6 — PDF scope section must reflect caller's deliverables list."""
    req = ContractExportRequest(
        user_email="dev@example.com",
        client_name="Jane Corp",
        client_company="Jane Corp Pvt Ltd",
        amount=80_000,
        timeline="60 days",
        payment_schedule="Monthly installments",
        deliverables=["Mobile app development for iOS and Android"],
    )
    text = _extract_text(_build_pdf("cf-test-s9-6", req))
    assert "Mobile app development for iOS and Android" in text, (
        "PDF scope must include the supplied deliverable"
    )
    assert "Company website" not in text, (
        "PDF must NOT include the hardcoded 'Company website' default deliverable"
    )


# ── Basic sanity: all 8 sections present ──────────────────────────────────────

def test_pdf_contains_all_eight_sections():
    """PDF must have all 8 numbered sections including the new ENTIRE AGREEMENT."""
    req = ContractExportRequest(
        user_email="sanity@example.com",
        client_name="Sanity Client",
        client_company="Sanity Co",
        amount=60_000,
        timeline="30 days",
        payment_schedule="50% advance, 50% delivery",
        deliverables=["Sanity check deliverable"],
    )
    text = _extract_text(_build_pdf("cf-test-sections", req))
    expected = [
        "PARTIES",
        "SCOPE OF WORK",
        "PAYMENT TERMS",
        "GOVERNING LAW",
        "TERMINATION",
        "CONFIDENTIALITY",
        "ENTIRE AGREEMENT",
        "SIGNATURES",
    ]
    for heading in expected:
        assert heading in text, f"PDF must contain section heading: {heading}"
