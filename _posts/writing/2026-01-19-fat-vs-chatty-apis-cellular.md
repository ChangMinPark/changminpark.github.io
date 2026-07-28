---
title: "Fat vs Chatty APIs on Cellular"
date: 2026-01-19 12:00:00
tags: [Writing, Distributed]
draft: false
---

## The list scrolled fine on Wi‑Fi

On office Wi‑Fi, a message list that fires six GETs per row feels snappy. On cellular — mid-train, one bar, radio cycling — the same design hitch-steps: placeholders flash, scroll janks while JSON arrives late, and background sync drains battery waking the radio for tiny payloads. The bug is not “Android is slow.” It is **physics**: latency and radio state dominate more than database purity arguments about resource-oriented REST.

This post is about fat vs chatty APIs for mobile mail-style UIs — what to optimize (bytes vs round trips), how that shows up as scroll and sync cost, and why “normalize everything like a DB” is the wrong default on a phone.

## Related reading

- **Articles surveyed:** [CACM — Designing APIs for mobile performance](https://cacm.acm.org/blogcacm/designing-apis-for-mobile-performance-best-practices/); [JSON mobile API optimization (Jsonic)](https://jsonic.io/guides/json-mobile-apis); [Mobile API strategy notes](https://developersvoice.com/blog/mobile/mobile-api-strategy-in-2025/)
- **Related:** [Three Clients, Same Aggregation]({{ site.baseurl }}/bff-three-clients-same-aggregation) — put the fat shape behind a BFF when three clients share the need

## Round trips usually hurt more than a few extra bytes

Cellular RTT is often tens to hundreds of milliseconds. Each sequential request pays that tax again. A home or message-list screen that needs messages + badges + ads + experiments as separate calls can stack seconds before first useful paint — even when each response is small.

| Style | Shape | Wins when | Loses when |
|-------|-------|-----------|------------|
| **Chatty** | Many small resource GETs | Resources reused widely; HTTP/2 multiplexing; fields change independently | High RTT; sequential dependencies; radio flapping |
| **Fat** | One aggregated payload per screen/section | Time-to-interactive on cellular; fewer failure modes | Over-fetch; cache invalidation coarser; payload bloat |

HTTP/2 helps with parallel small requests on one connection, but it does not erase RTT. Ten parallel calls still wait on the slowest dependency if the UI needs all of them to commit a frame. Prefer **one coherent response** for the critical path, then lazy-load heavy parts (full bodies, large images).

> **Rule of thumb** - optimize for round trips on the critical path first; trim bytes second; micro-normalize last.

## Scroll jank and sync cost are the real metrics

On Android list surfaces (RecyclerView historically, Compose `LazyColumn` now), late-arriving fields cause:

- Rebinds / recompositions as rows “fill in”
- Layout shifts when preview lines or ad slots appear late
- Extra decoder and main-thread work arriving in bursts

Background sync has a related cost: many tiny endpoints mean many radio wakes. Batching into fewer, slightly fatter sync documents often saves more battery than shaving JSON keys while keeping request count high. Mail is a good stress test: folders, badges, and push-triggered refresh can multiply into a chatty storm unless the sync protocol collapses work into deltas with clear watermarks.

```mermaid
flowchart LR
  subgraph chatty [Chatty path]
    c1[List meta] --> c2[Badges]
    c2 --> c3[Ads]
    c3 --> c4[Previews]
  end
  subgraph fat [Fat path]
    f1[Mailbox home payload]
  end
```

*Figure 1. Chatty critical path vs one aggregated home payload.*

## Not database dogma

Server engineers sometimes push chatty APIs because normalized resources are easier to cache and evolve. That is a real concern — and it belongs behind a [BFF](https://samnewman.io/patterns/architectural/bff/) or aggregate endpoint, not in the mobile critical path. The phone should not reimplement a join across a flaky network.

Practical split:

1. **Critical path (list open, first screenful)** — fat or BFF-shaped; stable field set; cursor pagination sized for the viewport
2. **Secondary** — thread body, full attachment metadata, rarely used panels — separate calls, prefetch when idle
3. **Sync** — delta documents with clear watermarks; avoid N endpoints × M folders on every tick

I will not invent Yahoo payload sizes or cellular lab numbers. On large mail Android surfaces, the wins I have seen come from fewer blocking round trips and calmer list updates — not from arguing REST purity in a design review.

## What to measure before picking a religion

- Time to first useful list content on a throttled cellular profile
- Request count and bytes for cold open vs incremental sync
- Frame time / jank while the first page binds
- Radio wake patterns during background sync (coarse is fine)

If fat payloads are bloated, sparse fieldsets and compression help. If chatty APIs are chatty, aggregate. Watch for the false compromise: “parallelize six calls on OkHttp” — better than sequential, still six failure modes and six chances for partial UI. The answer is usually hybrid — not a slogan.

## Wrap-up

On cellular, round trips and radio wakes dominate. Chatty resource APIs that look elegant on Wi‑Fi become scroll jank and sync tax on a phone. Prefer fat or BFF-aggregated payloads for the critical path, lazy-load the rest, and leave normalized purity to the server edge. Measure list open and sync cost on a bad network before declaring the API “clean.”

## References

- [Designing APIs for mobile performance (CACM)](https://cacm.acm.org/blogcacm/designing-apis-for-mobile-performance-best-practices/)
- [JSON mobile API optimization (Jsonic)](https://jsonic.io/guides/json-mobile-apis)
- [Mobile API strategy (Developers Voice)](https://developersvoice.com/blog/mobile/mobile-api-strategy-in-2025/)
- [Sam Newman — Backends for Frontends](https://samnewman.io/patterns/architectural/bff/)
