from __future__ import annotations


async def check_entitlement(
    user_email: str,
    supabase,
    consume: bool = True,
) -> tuple[bool, str]:
    """
    Returns (allowed, reason).
    consume=False: check-only, no decrement (used by export endpoint).
    """
    if supabase is None:
        return True, "supabase_not_configured"

    if not consume:
        # Passive check: has user ever had any entitlement?
        sub = supabase.table("subscriptions").select("id").eq("user_email", user_email).execute()
        trial = supabase.table("free_trials").select("id").eq("user_email", user_email).execute()
        if sub.data or trial.data:
            return True, "has_access"
        return False, "no_entitlement"

    # Active check — may consume a per_contract credit
    result = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_email", user_email)
        .eq("active", True)
        .execute()
    )

    if result.data:
        row = result.data[0]

        if row["plan"] == "monthly":
            return True, "monthly_active"

        if row["plan"] == "per_contract":
            if row["contracts_remaining"] > 0:
                supabase.table("subscriptions").update(
                    {"contracts_remaining": row["contracts_remaining"] - 1}
                ).eq("id", row["id"]).execute()
                return True, "per_contract_used"
            return False, "per_contract_exhausted"

    # No active subscription — check free trial
    trial = (
        supabase.table("free_trials")
        .select("id")
        .eq("user_email", user_email)
        .execute()
    )

    if not trial.data:
        supabase.table("free_trials").insert({"user_email": user_email}).execute()
        return True, "free_trial_granted"

    return False, "no_entitlement"
