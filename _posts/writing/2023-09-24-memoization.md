---
title: "Memoization: Cache the Result, Not the Algorithm"
excerpt: "Same inputs, same answer — stop recomputing on every scroll frame. Memoization as production caching, not interview DP."
date: 2023-09-24 12:00:00
tags: [Writing, Systems]
draft: false
---

## When the same work runs twice

The first time memoization mattered outside a LeetCode tab, it was not for Fibonacci. For example, in a mail app a feature may need to resolve a stable display label from a long chain of IDs — contacts, aliases, domain rules — on every list scroll frame. The resolver is pure: same inputs, same string out. Profiling often shows the same `(userId, threadId)` pairs recomputing dozens of times per second. The fix is not a faster algorithm; it is **remembering answers** for keys already paid for.

That is **memoization**: wrap a function so repeated calls with the same arguments return a cached result instead of recomputing. It is the technique behind many dynamic-programming wins, but you do not need a DP table on the wall to use it in production code.

## Memoization vs tabulation vs "DP"

These terms get lumped together in interview prep. They solve overlapping subproblems, but the shape differs.

| Approach | When work runs | Typical structure |
|----------|----------------|-------------------|
| **Memoization** (top-down) | On demand, when a subproblem is first needed | Recursive function + cache lookup/store |
| **Tabulation** (bottom-up) | Up front, filling a table in dependency order | Iterative loops over a fixed grid |
| **Dynamic programming** | Either; the *idea* is optimal substructure + overlapping subproblems | Memo or tabulation implementation |

Memoization keeps the natural recursive structure — good when the call graph is sparse and you only touch a fraction of the state space. Tabulation avoids recursion depth and makes memory layout predictable — good when you know the full table size upfront (classic edit-distance matrix).

> **Rule of thumb** - if only a slice of the state space is ever visited, memoize; if you always fill `(m+1) × (n+1)`, tabulate.

## A Kotlin example: expensive pure function

Suppose a feature computes a formatted preview string from message metadata. The function is deterministic and side-effect free — ideal memoization territory:

```kotlin
class PreviewCache(private val ttlMs: Long = 60_000) {
    private data class Entry(val value: String, val expiresAt: Long)

    private val cache = mutableMapOf<PreviewKey, Entry>()

    fun preview(key: PreviewKey, now: Long = System.currentTimeMillis()): String {
        cache[key]?.takeIf { it.expiresAt > now }?.let { return it.value }

        val computed = buildPreview(key) // expensive: parsing, lookups, formatting
        cache[key] = Entry(computed, now + ttlMs)
        return computed
    }

    fun invalidate(key: PreviewKey) {
        cache.remove(key)
    }

    fun clearExpired(now: Long = System.currentTimeMillis()) {
        cache.entries.removeIf { (_, entry) -> entry.expiresAt <= now }
    }
}
```

The cache key must capture **everything** that affects the output. Miss one field and you serve stale UI. That is the main production footgun — not the Big-O on paper.

## When the cache must clear

Memoization assumes inputs are stable for some window. Real apps violate that constantly: network refresh, user edits, locale changes, feature flags.

Plan for invalidation up front:

- **Event-driven** — drop entries when the underlying record changes (`invalidate(key)` after a sync).
- **TTL** — expire after `ttlMs` so eventually-consistent data self-heals (see the example above).
- **Scope-bound** — tie the cache to a `ViewModel` scope or screen session; clear on navigation or `onCleared()`.
- **Memory cap** — LRU eviction when keys grow without bound (scroll lists with unbounded IDs).

Without a TTL or explicit invalidation, memoization trades CPU for **silent staleness**. That is worse than being slow.

## Not the same as Compose `remember`

Jetpack Compose's `remember { … }` looks like memoization and often gets described that way. The distinction matters on Android UI work.

| | Function memoization | Compose `remember` |
|--|---------------------|-------------------|
| **Granularity** | Per logical inputs (keys you define) | Per composition slot / call site |
| **Lifetime** | You choose (singleton, ViewModel, TTL) | Composition lifecycle; survives recomposition, not necessarily process death |
| **Purpose** | Skip redundant **computation** | Preserve **object identity** across recompositions |

```kotlin
@Composable
fun MessageRow(message: Message) {
    // remember: same Formatter instance across recompositions of this slot
    val formatter = remember { DateTimeFormatter.ofPattern("MMM d") }

    // memoization pattern: skip re-parsing unless message.id changes
    val preview = remember(message.id, message.bodyHash) {
        buildPreview(message)
    }

    Text(preview)
}
```

`remember(message.id, message.bodyHash)` is memoization *inside* the composition model — keys you control, invalidation when inputs change. Plain `remember { }` without keys is "create once per slot," not "cache this function globally." For cross-screen caches, keep state in a ViewModel or repository, not only in composable memory.

## Tradeoffs

| Upside | Cost |
|--------|------|
| Large win on repeated pure work | Stale results if keys or invalidation are wrong |
| Simple to add around one hot function | Memory grows with distinct keys |
| Keeps readable recursive code | Thread safety needs explicit design (concurrent maps, per-thread caches) |
| Easy to measure (cache hit rate) | Debugging "why is this wrong?" can hide behind a cache |

Measure before and after on a release build. Memoization that never hits is complexity with no payoff; memoization that always hits but serves wrong data is a product bug.

## Wrap-up

Memoization caches **outputs** for repeated **inputs** — not the algorithm itself. Pair it with explicit invalidation or TTL, distinguish it from Compose's composition-scoped `remember`, and treat the cache key as part of your public contract. Used that way, it is one of the cheapest wins between "works in LeetCode" and "survives a scroll-heavy mail list."

## References

- [Dynamic Programming vs Memoization vs Tabulation](https://programming.guide/dynamic-programming-vs-memoization-vs-tabulation.html) — clear top-down vs bottom-up comparison
- [Levenshtein Distance]({{ site.baseurl }}/levenshtein-distance) — tabulation example on this site (full matrix fill)
