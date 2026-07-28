---
title: "Feature Flags on Mobile: Kill Switch, Rollout, Experiment"
date: 2025-05-29 12:50:00
tags: [Writing, Android]
draft: false
---

## Three jobs, one muddy word

“Feature flag” on mobile usually collapses three different jobs: a **kill switch**, a **gradual rollout**, and a **scientific experiment**. They share a boolean in a JSON blob and almost nothing else — SLAs, ownership, and tooling differ. Mixing them is how dark launches become un-measurable A/Bs, or how flag evaluation on every list bind becomes a performance bug.

This is a survey of industry patterns (including Datadog-shaped stacks) and a sane client architecture — not a vendor pitch.

## Related reading

- **Docs:** [Firebase Remote Config](https://firebase.google.com/docs/remote-config)
- **Docs:** [Datadog Feature Flags](https://docs.datadoghq.com/feature_flags/) (product surface evolves; treat as one pattern among many)
- **Internal:** [BFF / multi-client]({{ site.baseurl }}/bff-three-clients-same-aggregation) — flags as protocol negotiation across clients

## Separate the jobs

| Job | Question | Failure mode |
|-----|----------|--------------|
| Kill switch | Can we turn it off in minutes? | Config fetch blocked on startup |
| Gradual rollout | Can we ramp % and stick users? | Non-sticky assignment → flickering UX |
| Experiment | Can we measure lift with a holdout? | No exposure events → fake wins |

Remote config can host all three; experiment platforms add assignment, exposure logging, and analysis. Homegrown “JSON on S3” works for kill switches and fails quietly for science.

## Tools you will actually meet

- **Datadog** — flags / experimentation next to RUM and product analytics; strong when exposure and metrics already live in one place. Decide whether Datadog is **source of truth** or **observer** of another assigner.
- **Firebase Remote Config (+ A/B Testing)** — common on Android; good defaults for fetch intervals; easy to misuse by blocking first frame.
- **LaunchDarkly / Optimizely / Statsig-style** — richer targeting and analysis; watch mobile SDKs for size, startup, and offline caches.
- **Homegrown** — fine for kill switches; add sticky assignment and exposure before calling it an experiment.

## Mobile constraints that bite

1. **Cache for offline.** Default-safe when fetch fails — usually “off” or last-known.
2. **Do not block startup on config.** Bootstrap with baked defaults; refresh async.
3. **Evaluate off the hot path.** Not every `LazyColumn` bind; compute once per session/screen when possible.
4. **Avoid PII in targeting.** Version and cohort yes; email hashes only with privacy review.
5. **Version skew.** Old APKs linger; flags must degrade when the client does not understand a variant.

```kotlin
// Sketch: sticky assignment + exposure once
class FlagSession(private val store: FlagStore) {
    fun treatment(key: String): String {
        val t = store.stickyOrAssign(key)
        store.recordExposureOnce(key, t)
        return t
    }
}
```

Pipeline: **bootstrap defaults → fetch/cache → sticky assign → exposure event → metric**. Skip exposure and you are guessing.


## Exposure logging is the experiment

Without an exposure event (“user X saw treatment T at time τ”), downstream metrics cannot be attributed. Product analytics that only record “flag was true on the device” after the fact will include users who never hit the screen. Fire exposure **when the treatment is applied to a user-visible path**, once per assignment window, and keep it privacy-safe. Kill switches do not need exposures; experiments do — that difference alone justifies separate configs.

## Wrap-up

Name the job before you pick the tool. Kill switches need speed and safe defaults; rollouts need stickiness; experiments need exposure and holdouts. On mobile, protect startup and scroll from flag evaluation — and do not call a cached boolean an A/B test.

## References

- [Firebase — Remote Config](https://firebase.google.com/docs/remote-config)
- [Datadog — Feature Flags documentation](https://docs.datadoghq.com/feature_flags/)
- [Android — Avoid blocking on network at startup](https://developer.android.com/topic/performance/vitals/launch-time)
