---
title: "Mail Storage & Caching Without Lagging the Gesture"
excerpt: "Inbox open is a latency budget across memory, disk, and network. Put each byte where the gesture can afford it."
date: 2025-03-25 16:05:00
tags: [Writing, Android]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>Room, DataStore, SQLite WAL, or WorkManager</strong> are new.</p>
    <ul>
      <li><a href="https://developer.android.com/training/data-storage/room">Room</a> — typed SQLite layer on Android</li>
      <li><a href="https://developer.android.com/topic/libraries/architecture/datastore">DataStore</a> — preferences / proto storage vs SharedPreferences</li>
      <li><a href="https://www.sqlite.org/wal.html">SQLite WAL</a> — write-ahead logging and readers vs writers</li>
      <li><a href="https://developer.android.com/topic/libraries/architecture/workmanager">WorkManager</a> — durable background work for sync</li>
    </ul>
  </div>
</details>

## “We have a cache” is not a latency budget

Inbox open, scroll, search, and send all fail differently when data lives on the wrong tier. Teams add Room, then a memory cache, then another disk layer — and still hitch on first paint because sync work steals the frame after the user flicked the list. On a mail client, storage is a **product surface**: where each byte lives decides whether the gesture feels instant.

This pairs with [offline-first consistency]({{ site.baseurl }}/offline-first-mail-consistency) and [CDN→Room invalidation]({{ site.baseurl }}/cache-invalidation-cdn-to-room). Here the focus is **on-device tiers and budgets**, not the whole sync protocol.

## Assign a home to each class of data

| Data | Default home | Why |
|------|--------------|-----|
| Thread / message metadata | Room (SQLite) | Queryable, transactional, survives process death |
| Body / HTML snippets | Room or chunked files | Size-dependent; avoid huge blobs in hot rows |
| Attachments | Files / blob store | Stream and decode off the list path |
| Tiny prefs / flags | DataStore | Not a message database |
| Hot list rows / decoded previews | Memory (bounded) | Scroll budget; evict under pressure |
| Tokens / secrets | Encrypted store | Not SharedPreferences plaintext |

Memory → disk → network is the read path. Write path for send is usually **outbox first** (local truth), then network — optimistic UI with idempotent retries.

## Latency budgets beat slogans

Pick numbers your team can argue about:

- **Open inbox:** first pixels from local DB; network may refine.
- **Open message:** metadata immediate; body may stream.
- **Send:** UI confirms from outbox; server ack is async.

Rules that protect those budgets:

1. **Never block scroll on network.** Prefetch is fine; waiting on bind is not.
2. **Sync yields to UI.** WorkManager / coroutine priorities — background refresh should lose to fling.
3. **Query plans matter.** WAL, indexes on thread list predicates, avoid `SELECT *` into adapters.
4. **Decode attachments lazily.** Thumbnail pipelines off the main thread; cancel when the row leaves the viewport.

```kotlin
// Sketch: list reads local truth; refresh is separate
fun observeInbox(): Flow<List<ThreadRow>> =
    threadDao.observeVisible()
        .flowOn(Dispatchers.IO)
```

If invalidation storms refill Room on every push, you will win “freshness” and lose frames — pair with the CDN→Room essay for cross-layer invalidation discipline.

## Consistency vs snappiness

Stale-while-revalidate for thread lists is usually right. Multi-device sync landing mid-scroll needs conflict rules (last-writer, server wins for metadata, outbox wins for unsent). Measure **jank and ANR**, not only “cache hit rate.” A 99% hit rate that stalls the main thread is still a product bug — and storage work on the wrong thread is exactly what shows up in [ANR traces]({{ site.baseurl }}/android-crashlytics-anr).

## When memory cache fights Room

A common hitch: memory cache returns a thread row, Room updates underneath, and the UI shows a franken-row until the next process death. Treat memory as a **view-speed layer** with short TTL or explicit invalidation tied to DAO writes — not a second source of truth. If the list is Room-backed `Flow`, prefer letting Room be authoritative and use memory only for decoded bitmaps and ephemeral UI state.

## Wrap-up

Mail storage is latency design: put each data class where the gesture can afford it, paint from local truth, and keep sync and decode off the critical path. “We cached it” without a budget is how inboxes feel broken while dashboards look healthy.

## References

- [Android Developers — Data and file storage](https://developer.android.com/training/data-storage)
- [OkHttp cache](https://square.github.io/okhttp/features/cache/) — HTTP response cache as a layer above Room, not a second source of truth
- [Cache invalidation from CDN to Room (this site)]({{ site.baseurl }}/cache-invalidation-cdn-to-room) — when local observers and HTTP caches disagree
