---
title: "ANR Stack Traces Lie by Omission — Crashlytics Is One Layer"
date: 2023-09-10 12:00:00
tags: [Writing, Android]
---

## The dialog is late; the trace is a snapshot

An ANR is not a crash. The system waits, the user taps, nothing responds, and eventually Android shows **Application Not Responding**. By then the main thread may have been blocked for seconds — long enough that the stack trace bundled with the report often captures **whatever was on top when the watchdog fired**, not the work that started the stall.

That mismatch is why ANR triage feels worse than crash triage. Crashes have a faulting frame and an exception type. ANRs arrive **categorized by method names and partial stacks**, sometimes fragmented across threads, with little of the session that led there. You see `MessageQueue.nativePollOnce` or a framework frame and assume idle UI — while the real offender was a synchronous call minutes earlier on a code path that already returned.

On a large mail client, ANRs show up on surfaces where scroll, sync, and WebView/Compose interop overlap. The symptom in Play Console is a cluster keyed by a method; the fix is rarely "change that one line."

## What Play Vitals and Crashlytics actually give you

**Google Play Android Vitals** rolls ANRs into user-perceived rates that affect discoverability when thresholds are exceeded (Google documents an overall bad-behavior threshold of **0.47%** of daily active users for user-perceived ANRs). The console groups issues and shows traces — useful for volume and regression detection, but still a **single-point snapshot** per report.

**Firebase Crashlytics** adds ANR reporting on **Android 11+** devices, using `ActivityManager.getHistoricalProcessExitReasons()` — more reliable than older SIGQUIT-only paths. Important constraints from Google's docs:

- Reports flush on the **next app startup**, not at freeze time.
- Counts will **not match** Play Vitals one-to-one (different collection timing and device filters).
- **Breadcrumbs** (screen views, custom Analytics events) require Firebase Analytics enabled and data sharing configured.

Crashlytics is valuable for tying ANRs into the same dashboard as crashes and non-fatals, and for custom keys/logs you attach deliberately:

```kotlin
Firebase.crashlytics.setCustomKey("last_screen", "message_list")
Firebase.crashlytics.setCustomKey("sync_in_flight", syncActive)
Firebase.crashlytics.log("Opened attachment preview id=$id")
```

Treat those keys as **design**, not defaults — they only help if you log the state you later wish you had.

## What still goes missing

Even with Crashlytics configured, several gaps remain in production ANR work:

**Timing.** The trace describes the main thread at detection time. Blocking work that finished before the watchdog may leave no frame. Input dispatch, broadcast handling, and binder stalls all have different ANR categories — the category helps, but it is not a story.

**Session context.** Which tab was open? Did the user open compose, then background the app during sync? Was memory pressure high? Crashlytics breadcrumbs cover Analytics events and manual logs — not device thermals, radio state, or every button tap unless you instrument them.

**Fragmentation.** Method-based clustering merges stacks that share a top frame but different root causes. Two ANRs both sitting in `Choreographer.doFrame` can be layout inflation on one device class and a lock in your adapter on another.

**Platform floor.** Pre–Android 11 ANRs will not appear in Crashlytics ANR reporting at all; you still rely on Play Console or other traces for that tail.

**Thread pitfalls.** Breadcrumbs logged from background threads can be dropped unless posted to the main looper — a known sharp edge when wiring Timber or custom log trees.

> **Rule of thumb** - treat Crashlytics as a **structured incident record**, not a replay. Reproduce with the same user journey, device tier, and data shape.

## Building a holistic view

What helped on high-traffic mail surfaces was stacking tools instead of expecting one dashboard to explain everything:

1. **Vitals for rate and regression** — did a release move the ANR needle on a specific device model?
2. **Crashlytics for clustering + custom keys** — which screen and flags were set?
3. **Local reproduction** — Systrace, `StrictMode`, main-thread guards in debug builds for suspected paths (sync on UI, large bitmap decode, Compose recomposition storms).
4. **Journey logging** — lightweight, privacy-safe breadcrumbs for navigation and long-running operations (not every click — the signal you will actually read during triage).

Third-party observability platforms push further on grouping and flame graphs. Embrace's [webinar on ANRs and Play ranking](https://www.youtube.com/watch?v=ug31wHjdhoU) argues the same core point: Play's default grouping is a starting point, not the full diagnostic picture — prioritize by user impact and look for **common stack prefixes**, not only the leaf method name.

<div class="video_container">
<iframe class="responsive-iframe" src="https://www.youtube.com/embed/ug31wHjdhoU" frameborder="0" allowfullscreen="true"></iframe>
</div>

[How to Solve ANRs and Boost Google Play Store Ranking (Embrace)](https://www.youtube.com/watch?v=ug31wHjdhoU)

## ANR categories worth knowing

Android distinguishes several ANR types (input dispatch, broadcast receiver, service timeout, etc.). The [official ANR guidance](https://developer.android.com/topic/performance/vitals/anr) documents thresholds and mitigations — for example, `goAsync()` on a broadcast does not cancel the ANR deadline for background delivery. Knowing **which contract you violated** saves days of chasing the wrong thread dump.

| Symptom cluster | Often means | First check |
|-----------------|-------------|-------------|
| Input dispatch timeout | Main thread busy during touch/key | Work on UI thread; lock contention |
| Broadcast ANR | `onReceive` too slow | Move work off main; mind background limits |
| Service / binder stall | IPC or startForeground timing | Trace cross-process calls |
| `nativePollOnce` top frame | Idle at snapshot | Earlier blocking work; strict mode in dev |

## Wrap-up

Crashlytics belongs in the ANR toolkit — especially for Android 11+ builds with Analytics-backed breadcrumbs and custom keys you define. It does not replace session narrative, device context, or the hard work of reproducing the path that blocked the main thread. ANR debugging at scale is ranking issues by user impact, instrumenting the questions you will ask after the dialog, and accepting that the stack trace is one frame of a longer film.

## References

- [ANRs (Android Developers)](https://developer.android.com/topic/performance/vitals/anr) — user-perceived thresholds and categories
- [Crashlytics troubleshooting — Android ANRs](https://firebase.google.com/docs/crashlytics/troubleshooting?platform=android#anr-requires-android-11-plus) — Android 11+ requirement, Play vs Crashlytics counts
- [Debug ANRs in Android apps (Crashlytics)](https://firebase.google.com/docs/crashlytics/debug-anr-errors) — grouping and triage tips
- [Customize crash reports for Android](https://firebase.google.com/docs/crashlytics/android/customize-crash-reports) — breadcrumbs via Analytics
- [How to Solve ANRs and Boost Google Play Store Ranking (Embrace)](https://www.youtube.com/watch?v=ug31wHjdhoU) — grouping and business-impact framing
