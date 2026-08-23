---
title: "Gradle Modularization: Slice for Change, Not for the Diagram"
excerpt: "Hexagon diagrams do not cut build times. Slice Gradle modules by change frequency and ownership, not purity."
date: 2025-10-08 12:00:00
tags: [Writing, Android]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>app modularization</strong>, <strong>api vs implementation</strong>, or <strong>feature modules</strong> are new.</p>
    <ul>
      <li><a href="https://developer.android.com/topic/modularization">Guide to app modularization</a> — why large Android apps split modules; the debate this post is in</li>
      <li><a href="https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_separation">api vs implementation</a> — what leaks across a module boundary (ABI / compile classpath)</li>
      <li><a href="https://developer.android.com/studio/projects/android-library">Android library modules</a> — app vs library projects in Gradle</li>
      <li><a href="https://developer.android.com/guide/playcore/feature-delivery">Play Feature Delivery</a> — on-demand / instant feature modules vs ordinary Gradle slices</li>
    </ul>
  </div>
</details>

## The debate that stalls the roadmap

Every large Android team eventually holds the same meeting: *should we modularize?* Someone draws clean hexagons. Someone else cites build times. Six months later you still have a mega-module — or fifty modules that every feature PR must touch. The failure is rarely “we used Gradle wrong.” It is slicing for **diagram purity** instead of **how the app actually changes**.

This plays out on production mail clients and smaller products alike. The useful question is not “how many modules,” it is “what boundary survives the next twenty PRs without becoming a tax.”

## Related reading

- **Docs:** [Android — Guide to app modularization](https://developer.android.com/topic/modularization)
- **Docs:** [Gradle — `api` vs `implementation`](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_separation)
- **Internal:** [From Jenkins to Screwdriver]({{ site.baseurl }}/cicd-jenkins-to-screwdriver) — org CI is useless if every change still compiles the world

## Five slices teams actually argue

**1. Don’t modularize yet.** One or few modules until compile pain or ownership pain is real. Ceremony (`settings.gradle` wiring, navigation graphs, DI graphs, sync time) is not free. If two engineers merge without stepping on each other, wait.

**2. Feature-by-feature.** `:feature:inbox`, `:feature:compose`, … Parallel product ownership. Risk: every feature re-implements “core” helpers, or you invent a god `:core` that everyone imports — cycles appear quietly.

**3. By layer / file type.** `:data`, `:domain`, `:ui`, `:network`. Easy to explain in interviews; often **false** boundaries — a single feature still edits all four, and “clean” edges become PR theater.

**4. UI vs core logic vs shared.** Thin `:ui:*`, reusable domain/data, `:app` assembles. Helps Compose/View sharing and tests. Cost: navigation and Hilt graphs get heavy; “shared” grows forever.

**5. Hybrid (what large apps converge on).** Thin `:core:*` libraries + **feature modules that own UI + VM**, with `api`/`impl` splits for unstable internals. Optimize for **team ownership and change frequency**, not hexagons.

```text
:app
  ├─ :feature:mail-list      (UI + VM, owns inbox change)
  ├─ :feature:compose        (UI + VM)
  ├─ :core:network           (api / impl)
  └─ :core:database          (Room types, migrations)
```

## What to measure before declaring victory

| Signal | Healthy | Smell |
|--------|---------|-------|
| Configuration / sync time | Stable as modules grow | Sync dominates “build” |
| Critical-path compile | Feature PR compiles its cone | Touching one screen rebuilds everything |
| Who merges what | Feature owners stay in one module | Every PR edits five projects |
| `api` edges | Rare, intentional | Accidental ABI leaks force downstream rebuilds |

Gradle’s `api` vs `implementation` is not trivia: leaking a type through `api` expands the compile fan-out. Circular project dependencies are the other classic smell — if `:feature:a` needs `:feature:b` and vice versa, your slice is lying.

## How to slice a mail-scale app

Start from **change frequency**. For example, in a mail app, message list and compose often churn weekly; attachment pipelines less so. Give high-churn surfaces a feature module. Put stable infrastructure behind `api`/`impl` so internals can move without recompiling the world. Delay layer-only modules until a second client or test target needs the same domain — not because a blog post said “clean architecture.”


## A concrete anti-pattern: the expanding `:core`

The most common failure after “we modularized” is a single `:core` (or `:common`) that absorbs everything awkward. Navigation helpers, analytics wrappers, date formatters, network clients, and half of domain models land there because “everyone needs it.” Then every feature depends on `:core`, `:core` slowly depends back on features through callbacks or sealed hierarchies, and you have reinvented the mega-module with worse sync times.

Prefer **narrow cores** (`:core:network-api`, `:core:database`) and let features own glue. If two features need the same helper, extract a third library with a clear owner — do not grow an anonymous junk drawer.

## Wrap-up

Modularization is a **product and org** decision wearing Gradle clothes. Slice for ownership and compile cones; measure sync and critical path; treat `api` leaks and cycles as bugs. Diagrams that do not match how PRs land will lose to the mono-module every time.

## References

- [Android Developers — Modularization patterns](https://developer.android.com/topic/modularization/patterns) — feature vs layer vs data-type slices (the meeting this post is in)
- [Add build dependencies](https://developer.android.com/build/dependencies) — how module edges show up in Gradle, not in a hexagon diagram
- [Gradle — Multi-project builds](https://docs.gradle.org/current/userguide/multi_project_builds.html) — configuration/execution of a graph you actually have to sync
