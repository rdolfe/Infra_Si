# Chat Feature — Bug Analysis & Fix Plan

This document traces every broken path in the messaging system and provides
exact, file-by-file instructions an agent can follow to fix them.

---

## Root causes (TL;DR)

| # | Severity | Problem |
|---|---|---|
| C-01 | 🔴 | Agents have **no UI path** to any chat — `/agency/offers` has no offer-detail page |
| C-02 | 🔴 | The only chat page (`/dashboard/offers/[id]`) **hard-redirects agents away** |
| C-03 | 🔴 | `ChatThread` flex/height setup **prevents the message list from scrolling** |
| C-04 | 🟠 | No polling — **new messages from the other party never appear** without a page reload |
| C-05 | 🟠 | Dashboard "Messages" tab depends on `/api/messages/threads`; if that endpoint is absent the tab **always shows empty** |

---

## C-01 — Agents have no path to a chat

### Evidence

`app/agency/offers/page.tsx` renders a list of `<OfferCard>` components with
Accept / Counter-offer / Reject action buttons. There is no link to any
offer-detail or chat page. The entire `/agency/offers/` directory has only
`page.tsx` — there is no `[id]/page.tsx`.

The `ChatThread` component is used in exactly **one** place:
`app/dashboard/offers/[id]/page.tsx` — and that page immediately redirects
anyone who is not a `client` (see C-02).

### Fix

**Step 1 — Create `app/agency/offers/[id]/page.tsx`**

Create a new file mirroring the structure of the client offer-detail page but
without the client-only guard, and with the extra agent actions (counter-offer
button) embedded directly.

```tsx
// app/agency/offers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import ChatThread from "@/components/messages/ChatThread";
import CounterOfferModal from "@/components/offers/CounterOfferModal";

// Reuse the same OfferDetail / Transaction interfaces from the client page
// (or move them to a shared lib/types.ts)

export default function AgencyOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = auth.getUser();

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [counterOpen, setCounterOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "agent") { router.replace("/"); return; }
    loadOffer();
  }, [id]);

  async function loadOffer() {
    setLoadingOffer(true);
    try {
      const res = await api.get(`/api/offers/${id}`);
      if (!res.ok) throw new Error();
      setOffer(await res.json());
    } catch {
      setError("Impossible de charger cette offre.");
    } finally {
      setLoadingOffer(false);
    }
  }

  async function handleAction(action: "accept" | "reject") {
    if (!offer) return;
    setActionLoading(action);
    setError(null);
    try {
      const res = await api.put(`/api/offers/${offer.id}`, { action });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Erreur");
      }
      setOffer(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  if (!user || user.role !== "agent") return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/agency/offers" className="text-sm text-charcoal-light hover:text-terracotta">
        ← Retour aux offres
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 my-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Offer info + actions */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <h1 className="font-playfair text-xl font-bold text-charcoal">Offre reçue</h1>
          {loadingOffer ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-8 rounded-lg bg-stone-100" />)}
            </div>
          ) : offer && (
            <>
              {/* Offer details — status, proposed price, counter price, date */}
              {/* Same pattern as client offer-detail page */}

              {(offer.status === "pending" || offer.status === "countered") && (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleAction("accept")}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
                  >
                    {actionLoading === "accept" ? "Traitement…" : "Accepter"}
                  </button>
                  <button
                    onClick={() => setCounterOpen(true)}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg border border-terracotta text-terracotta text-sm font-medium hover:bg-terracotta/5 disabled:opacity-50"
                  >
                    Contre-offre
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg border border-stone-200 text-charcoal text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
                  >
                    {actionLoading === "reject" ? "Traitement…" : "Refuser"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col h-[560px]">
          {offer && <ChatThread offerId={offer.id} />}
        </div>
      </div>

      {counterOpen && offer && (
        <CounterOfferModal
          offerId={offer.id}
          open={counterOpen}
          onClose={() => setCounterOpen(false)}
          onSuccess={loadOffer}
        />
      )}
    </div>
  );
}
```

**Step 2 — Add a "Voir la conversation" link in `app/agency/offers/page.tsx`**

Inside the `OfferCard` actions block (around line 111), add a link to the new
page:

```tsx
// After the existing action buttons:
<Link
  href={`/agency/offers/${offer.id}`}
  className="text-xs px-2 py-1 rounded border border-stone-200 text-charcoal hover:bg-stone-50"
>
  Conversation →
</Link>
```

---

## C-02 — Client offer-detail page hard-blocks agents

### Evidence

`app/dashboard/offers/[id]/page.tsx`, lines 74-77 and 133:

```tsx
// Line 74-77 — inside useEffect:
if (user.role !== "client") {
  router.replace("/");
  return;
}

// Line 133 — early return guard:
if (!user || user.role !== "client") return null;
```

An agent navigating to `/dashboard/offers/<id>` is immediately redirected to
`/`. Even if an agent somehow had the URL, they can never see the chat.

### Fix

This page should stay client-only (agents get their own page from C-01).
**No change needed here.** The fix is entirely in C-01 — giving agents their
own `/agency/offers/[id]` page.

However, the hard `router.replace("/")` for unknown roles is hostile for
debugging. Consider replacing it with a redirect to the appropriate role home:

```tsx
// Replace the generic redirect:
const roleHome: Record<string, string> = {
  agent: "/agency/offers",
  admin: "/admin",
};
router.replace(roleHome[user.role] ?? "/");
```

---

## C-03 — Message list doesn't scroll (broken flex layout)

### Evidence

`components/messages/ChatThread.tsx`, line 80:

```tsx
<div className="flex flex-col h-full min-h-0">
```

`h-full` only works when the **parent has an explicit height**. In
`app/dashboard/offers/[id]/page.tsx` line 252:

```tsx
<div className="bg-white rounded-2xl ... flex flex-col min-h-[480px]">
  {offer && <ChatThread offerId={offer.id} />}
</div>
```

The parent has `min-h-[480px]` (a minimum, not a fixed height) and **no
`h-[480px]` or `h-full`**. This means the parent grows to fit its children,
so `h-full` on `ChatThread` resolves to `auto`, and the inner
`flex-1 overflow-y-auto` message list has no bounded height to scroll within.
The entire page scrolls instead of the message pane.

### Fix

**In `app/dashboard/offers/[id]/page.tsx`** — change the Chat panel's
container from `min-h-[480px]` to a fixed height:

```tsx
// Before:
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col min-h-[480px]">

// After:
<div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col h-[560px]">
```

**In the new `app/agency/offers/[id]/page.tsx`** (from C-01) — use the same
`h-[560px]` on the chat panel container (already shown in the template above).

**In `components/messages/ChatThread.tsx`** — the component itself is correct
(`flex flex-col h-full min-h-0` with `flex-1 overflow-y-auto` on the message
list) as long as the parent has a fixed height. No changes needed here.

---

## C-04 — No real-time updates (new messages never appear)

### Evidence

`components/messages/ChatThread.tsx`, lines 51-53:

```tsx
useEffect(() => {
  loadMessages();
}, [offerId]);
```

Messages are fetched once on mount. There is no polling, WebSocket, or Server-
Sent Events. If the other party sends a message, it will never appear in the
current user's view until they manually reload the page.

### Fix — Short-interval polling (pragmatic approach)

Add a polling interval inside `ChatThread`. Poll every 5 seconds while the
component is mounted. Skip the poll while a message is being sent to avoid
race conditions.

```tsx
// In ChatThread.tsx — replace the existing useEffect for loadMessages:

useEffect(() => {
  loadMessages();

  const interval = setInterval(() => {
    // Don't poll while the user is actively sending
    if (!sending) loadMessages();
  }, 5000);

  return () => clearInterval(interval);
}, [offerId]);
```

To avoid resetting scroll position on each poll, only append genuinely new
messages rather than replacing the whole list:

```tsx
async function loadMessages() {
  try {
    const res = await api.get(`/api/messages?offer_id=${offerId}`);
    if (!res.ok) throw new Error();
    const data: Message[] = await res.json();
    // Only update if there are actually new messages
    setMessages(prev => {
      if (data.length === prev.length) return prev;
      return data;
    });
  } catch {
    setError("Impossible de charger les messages.");
  } finally {
    setLoading(false);
  }
}
```

Note: The scroll-to-bottom `useEffect` already watches `messages`, so it will
auto-scroll only when the array actually changes. No additional changes needed
there.

---

## C-05 — Dashboard "Messages" tab silently empty

### Evidence

`app/dashboard/page.tsx`, lines 93-104:

```tsx
async function loadThreads() {
  setLoadingThreads(true);
  setError(null);
  try {
    const res = await api.get("/api/messages/threads");
    if (!res.ok) throw new Error();
    setThreads(await res.json());
  } catch {
    setError("Impossible de charger vos messages.");
  } finally {
    setLoadingThreads(false);
  }
}
```

This calls `GET /api/messages/threads` — an aggregated endpoint that must
return a summary list with `last_message`, `last_message_at`, and
`unread_count` per offer thread. **If the backend has not implemented this
endpoint, the catch block swallows the error and `threads` stays `[]`**, showing
"Aucun message pour le moment." with no indication that something went wrong.

Additionally, because `loadThreads` is only called when `activeTab === "messages"`,
a user who never clicks the Messages tab will never discover they have messages
— there is no unread badge on the tab itself.

### Fix — Part A: Fallback when `/api/messages/threads` is absent

If the backend doesn't expose a threads endpoint yet, derive the thread list
from the offers list (which always loads). Offers already have an `id` that can
be used as the `offer_id` for a chat link.

```tsx
// In loadThreads — add a fallback:
async function loadThreads() {
  setLoadingThreads(true);
  setError(null);
  try {
    const res = await api.get("/api/messages/threads");
    if (res.status === 404) {
      // Backend doesn't have this endpoint yet — derive threads from offers
      const offersRes = await api.get("/api/offers");
      if (!offersRes.ok) throw new Error();
      const offerList: OfferSummary[] = await offersRes.json();
      // Map offers to a minimal thread shape so the UI can still render links
      setThreads(
        offerList.map(o => ({
          offer_id: o.id,
          property_id: o.property_id,
          last_message: "Voir la conversation →",
          last_message_at: o.created_at,
          unread_count: 0,
        }))
      );
      return;
    }
    if (!res.ok) throw new Error();
    setThreads(await res.json());
  } catch {
    setError("Impossible de charger vos messages.");
  } finally {
    setLoadingThreads(false);
  }
}
```

### Fix — Part B: Load threads eagerly alongside offers

Currently each tab's data is loaded lazily when the tab is clicked. This means
the unread count badge (from AUDIT FIX-28) can never be computed until the user
switches to the Messages tab. Move the `loadThreads()` call to run in parallel
with the initial data load:

```tsx
// In the useEffect that guards role and runs on mount:
useEffect(() => {
  if (!user || user.role !== "client") return;
  loadOffers();
  loadThreads(); // load eagerly so unread count is available immediately
}, []);

// Keep the existing activeTab useEffect but skip threads if already loaded:
useEffect(() => {
  if (!user || user.role !== "client") return;
  if (activeTab === "offers" && offers.length === 0) loadOffers();
  if (activeTab === "favorites") loadFavorites();
  // threads already loaded above — no need to reload on tab switch
}, [activeTab]);
```

---

## Summary — files to create / modify

| Action | File | Change |
|---|---|---|
| **Create** | `app/agency/offers/[id]/page.tsx` | New agent offer-detail + chat page (C-01) |
| **Edit** | `app/agency/offers/page.tsx` line ~111 | Add "Conversation →" link per offer card (C-01) |
| **Edit** | `app/dashboard/offers/[id]/page.tsx` line 252 | Change `min-h-[480px]` → `h-[560px]` on chat panel (C-03) |
| **Edit** | `components/messages/ChatThread.tsx` lines 51-53 | Add 5-second polling interval (C-04) |
| **Edit** | `app/dashboard/page.tsx` lines 93-104 | Add `/api/messages/threads` 404 fallback + eager load (C-05) |

---

## Quick verification checklist

After applying the fixes, test these paths manually:

- [ ] Agent logs in → navigates to `/agency/offers` → clicks "Conversation →" on any offer → lands on `/agency/offers/<id>` and sees the chat panel
- [ ] Agent sends a message → it appears immediately in the agent's chat
- [ ] Client logs in → navigates to `/dashboard` → Messages tab → clicks a thread → lands on `/dashboard/offers/<id>` → chat panel scrolls correctly when messages overflow
- [ ] Client sends a message → it appears immediately
- [ ] Agent's page auto-refreshes within 5 seconds to show the client's message (and vice versa)
- [ ] Dashboard Messages tab shows a non-empty list even if `/api/messages/threads` returns 404

---

## Related issues from main audit

The following items from `AUDIT.md` interact with the chat feature and should
be fixed alongside these:

- **FIX-08** (Dashboard tabs missing ARIA roles) — also affects the Messages tab
- **FIX-12** (Agency offers page uses `confirm()` / `alert()`) — same file as C-01 step 2
- **FIX-17** (Shared error state across tabs) — affects the Messages tab error display
- **FIX-28** (No unread count badge on Messages tab) — depends on C-05 Part B being fixed first
