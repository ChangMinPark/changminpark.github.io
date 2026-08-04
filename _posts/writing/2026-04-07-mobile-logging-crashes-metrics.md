---
title: "Mobile Logs, Crashes, and Metrics: Pick Signals That Decide"
excerpt: "More telemetry is not more control. How to pick logs, crashes, and metrics that actually decide ship/fix calls on mobile."
date: 2026-04-07 09:40:00
tags: [Writing, Android]
draft: false
---

## More telemetry is not more control

Mobile teams either drown in unsampled logs nobody reads, or fly blind when crash-free sessions move. The vocabulary is muddled: action log, breadcrumb, metric, alert — four words for overlapping pipes. The fix is not another SDK. It is choosing **signals that drive decisions** and owning who pages when they move.

ANR forensics deserve their own deep dive — see [ANR traces lie by omission]({{ site.baseurl }}/android-crashlytics-anr). Client↔server correlation is covered in [telemetry across client and server]({{ site.baseurl }}/telemetry-across-client-and-server). This post is the **stack map**: what to collect, with which industry tools, without repeating those essays.

## Related reading

- **Internal:** [ANR / Crashlytics]({{ site.baseurl }}/android-crashlytics-anr)
- **Internal:** [Telemetry across client and server]({{ site.baseurl }}/telemetry-across-client-and-server)
- **Docs:** [Play Vitals](https://developer.android.com/topic/performance/vitals), [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)

## Three pipes (do not merge them in your head)

| Pipe | Answers | Examples |
|------|---------|----------|
| Crashes / ANRs / non-fatals | What broke, how often | Stack + breadcrumbs + custom keys |
| Action / product logs | What the user tried | open thread, send, attach (privacy-reviewed) |
| Metrics | Is the system healthy | counters, timers, histograms (cold start, sync p95) |

Play Vitals and vendor dashboards will not match one-to-one. That is normal — collection windows differ. Design for **decisions** (page on crash-free drop, p95 sync, send success), not vanity event counts.

## Tools in the wild

- **Firebase Crashlytics** — crashes, non-fatals, ANRs (with constraints called out in the ANR post); breadcrumbs when Analytics sharing is configured.
- **Datadog** — RUM, logs, metrics, APM correlation; strong when you already live in that ecosystem.
- **Sentry / Bugsnag** — error-centric; watch PII and sampling defaults.
- **Perfetto / systrace** — local truth for jank; not a production pager.
- **Play Console vitals** — store-facing rates that affect discoverability.
- **Custom** — Kafka → warehouse for product analytics at scale.

Shared concerns everywhere: **sampling**, **PII redaction**, **offline batching**, and **correlation IDs** from APK to backend (see the telemetry post).

## A minimal ownership model

1. Pick three SLIs the team will defend (e.g. crash-free users, p95 inbox open, send success).
2. Map each SLI to one primary tool and one human owner.
3. Alert on rate of change and absolute thresholds — not on every log line.
4. Keep action logs privacy-reviewed; treat them as production data, not debug leftovers.

If everything is a “log,” nothing is an alert. If everything is an alert, nobody pages.


## Sampling without lying to yourself

Log everything in debug builds; sample in production. Crash and ANR pipelines usually want high capture; verbose action logs need aggressive sampling or they become a storage and privacy problem. Metrics should be cheap enough to be continuous. The mistake is one global “log level” that either blinds you or bankrupts the pipeline — set policy **per pipe**.

## Wrap-up

Instrument for decisions: separate crash, action, and metric pipes; pick tools that match how you already operate; sample and redact on purpose. Pair Crashlytics/ANR deep dives and cross-tier correlation posts with this map — do not paste every stack into a log pipeline and call it observability.

## References

- [Android Vitals](https://developer.android.com/topic/performance/vitals)
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [Datadog Mobile RUM](https://docs.datadoghq.com/real_user_monitoring/mobile_and_tv_monitoring/)
